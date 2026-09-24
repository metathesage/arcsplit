// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {ArcSplit} from "../ArcSplit.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

// ─────────────────────────────────────────────────────────────────────────────
// Malicious recipient contracts for revert / reentrancy scenarios
// ─────────────────────────────────────────────────────────────────────────────

/// @dev Simply reverts on any ETH receive — used to trigger TransferFailed.
contract RevertingRecipient {
    receive() external payable { revert("I reject ETH"); }
}

/// @dev Tries to re-enter splitNative when it receives ETH.
contract ReentrantRecipient {
    ArcSplit public split;
    address[] public recs;
    uint256[] public bps;
    bool public attacked;

    constructor(ArcSplit _split) { split = _split; }

    function setParams(address[] calldata _recs, uint256[] calldata _bps) external {
        recs = _recs;
        bps  = _bps;
    }

    receive() external payable {
        if (!attacked) {
            attacked = true;
            // Attempt reentrant call — nonReentrant must block this.
            split.splitNative{value: msg.value}(recs, bps, "reenter");
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main test contract
// ─────────────────────────────────────────────────────────────────────────────

contract ArcSplitTest is Test {

    ArcSplit internal split;
    MockERC20 internal token;

    address internal alice   = makeAddr("alice");
    address internal bob     = makeAddr("bob");
    address internal carol   = makeAddr("carol");
    address internal payer   = makeAddr("payer");

    uint256 internal constant ONE_ETH = 1 ether;

    // ── setUp ─────────────────────────────────────────────────────────────────

    function setUp() public {
        split = new ArcSplit();
        token = new MockERC20("Mock Token", "MTK", 6);

        // Fund payer with plenty of native + tokens
        vm.deal(payer, 100 ether);
        token.mint(payer, 1_000_000e6);

        // Fund the split contract address labels for readable traces
        vm.label(address(split), "ArcSplit");
        vm.label(address(token), "MockERC20");
        vm.label(alice,  "alice");
        vm.label(bob,    "bob");
        vm.label(carol,  "carol");
        vm.label(payer,  "payer");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. splitNative — happy paths
    // ══════════════════════════════════════════════════════════════════════════

    /// @dev Equal 50/50 split: each recipient gets exactly half.
    function test_splitNative_EqualSplit() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(5000, 5000);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore   = bob.balance;

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "memo");

        assertEq(alice.balance - aliceBefore, 0.5 ether, "alice gets 50%");
        assertEq(bob.balance   - bobBefore,   0.5 ether, "bob gets 50%");
    }

    /// @dev 30/70 split: correct proportional amounts.
    function test_splitNative_ProportionalSplit() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(3000, 7000);

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "");

        assertEq(alice.balance, 0.3 ether, "alice gets 30%");
        assertEq(bob.balance,   0.7 ether, "bob gets 70%");
    }

    /// @dev Three recipients: 50 / 30 / 20.
    function test_splitNative_ThreeRecipients() public {
        address[] memory recs = _recs3(alice, bob, carol);
        uint256[] memory bps  = _bps3(5000, 3000, 2000);

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "3way");

        assertEq(alice.balance, 0.5 ether);
        assertEq(bob.balance,   0.3 ether);
        assertEq(carol.balance, 0.2 ether);
    }

    /// @dev Dusty split: totalAmount not perfectly divisible — remainder goes to recipients[0].
    function test_splitNative_RemainderGoesToFirstRecipient() public {
        // 3 recipients at 3333 / 3333 / 3334 — but we use 3333/3333/3333 = 9999 bps intentionally
        // actually: 1/3 each → sum bps must be 10000 so let's do 3334/3333/3333
        address[] memory recs = _recs3(alice, bob, carol);
        uint256[] memory bps  = _bps3(3334, 3333, 3333);

        uint256 total = 1 ether + 1; // odd number so remainder is non-zero

        vm.prank(payer);
        split.splitNative{value: total}(recs, bps, "dusty");

        // Calculate what we expect
        uint256 a = (total * 3334) / 10000;
        uint256 b = (total * 3333) / 10000;
        uint256 c = (total * 3333) / 10000;
        uint256 remainder = total - a - b - c;

        assertEq(alice.balance,  a + remainder, "alice absorbs remainder");
        assertEq(bob.balance,    b,             "bob exact");
        assertEq(carol.balance,  c,             "carol exact");
    }

    /// @dev Single recipient at 10000 bps (100%) receives everything.
    function test_splitNative_SingleRecipient100Pct() public {
        address[] memory recs = _recs1(alice);
        uint256[] memory bps  = _bps1(10000);

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "");

        assertEq(alice.balance, ONE_ETH);
    }

    /// @dev PaymentSplit event is emitted with correct indexed and non-indexed fields.
    function test_splitNative_EmitsPaymentSplitEvent() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(5000, 5000);

        uint256[] memory expectedAmounts = new uint256[](2);
        expectedAmounts[0] = 0.5 ether;
        expectedAmounts[1] = 0.5 ether;

        vm.warp(1_700_000_000); // pin timestamp for checkData

        vm.expectEmit(true, false, false, true, address(split));
        emit ArcSplit.PaymentSplit(
            payer,
            recs,
            expectedAmounts,
            "hello",
            ONE_ETH,
            block.timestamp
        );

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "hello");
    }

    /// @dev ArcSplit contract holds no ETH after a split (all forwarded out).
    function test_splitNative_NoResidualBalance() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(6000, 4000);

        vm.prank(payer);
        split.splitNative{value: ONE_ETH}(recs, bps, "");

        assertEq(address(split).balance, 0, "split contract holds nothing");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. splitNative — revert paths
    // ══════════════════════════════════════════════════════════════════════════

    function test_Revert_splitNative_ZeroAmount() public {
        address[] memory recs = _recs1(alice);
        uint256[] memory bps  = _bps1(10000);

        vm.prank(payer);
        vm.expectRevert(ArcSplit.ZeroAmount.selector);
        split.splitNative{value: 0}(recs, bps, "");
    }

    function test_Revert_splitNative_InvalidLength_Empty() public {
        address[] memory recs = new address[](0);
        uint256[] memory bps  = new uint256[](0);

        vm.prank(payer);
        vm.expectRevert(ArcSplit.InvalidLength.selector);
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_splitNative_InvalidLength_Mismatch() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps1(10000); // length mismatch

        vm.prank(payer);
        vm.expectRevert(ArcSplit.InvalidLength.selector);
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_splitNative_TooManyRecipients() public {
        uint256 n = 51; // > MAX_RECIPIENTS (50)
        address[] memory recs = new address[](n);
        uint256[] memory bps  = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            recs[i] = makeAddr(string(abi.encode(i)));
            bps[i]  = (i < n - 1) ? 196 : 204; // 50*196 + 204 = 10000 → but we never reach validation
        }

        vm.prank(payer);
        vm.expectRevert(ArcSplit.TooManyRecipients.selector);
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_splitNative_InvalidBasisPointsTotal_TooLow() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(4000, 4000); // 8000 ≠ 10000

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(8000))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_splitNative_InvalidBasisPointsTotal_TooHigh() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(6000, 6000); // 12000 ≠ 10000

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(12000))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_splitNative_TransferFailed_RevertingRecipient() public {
        RevertingRecipient bad = new RevertingRecipient();

        address[] memory recs = _recs2(address(bad), bob);
        uint256[] memory bps  = _bps2(5000, 5000);

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.TransferFailed.selector, address(bad))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    /// @dev Second recipient reverts — TransferFailed carries bob's address.
    function test_Revert_splitNative_TransferFailed_SecondRecipient() public {
        RevertingRecipient bad = new RevertingRecipient();

        address[] memory recs = _recs2(alice, address(bad));
        uint256[] memory bps  = _bps2(5000, 5000);

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.TransferFailed.selector, address(bad))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. splitERC20 — happy paths
    // ══════════════════════════════════════════════════════════════════════════

    function test_splitERC20_EqualSplit() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(5000, 5000);
        uint256 total = 1000e6;

        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "memo");
        vm.stopPrank();

        assertEq(token.balanceOf(alice), 500e6, "alice gets 50%");
        assertEq(token.balanceOf(bob),   500e6, "bob gets 50%");
        assertEq(token.balanceOf(payer), 1_000_000e6 - total, "payer debited");
    }

    function test_splitERC20_ProportionalSplit() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(3000, 7000);
        uint256 total = 1000e6;

        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "");
        vm.stopPrank();

        assertEq(token.balanceOf(alice), 300e6);
        assertEq(token.balanceOf(bob),   700e6);
    }

    function test_splitERC20_ThreeRecipients() public {
        address[] memory recs = _recs3(alice, bob, carol);
        uint256[] memory bps  = _bps3(5000, 3000, 2000);
        uint256 total = 1000e6;

        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "3way");
        vm.stopPrank();

        assertEq(token.balanceOf(alice), 500e6);
        assertEq(token.balanceOf(bob),   300e6);
        assertEq(token.balanceOf(carol), 200e6);
    }

    /// @dev Dusty ERC-20 split: remainder goes to recipients[0].
    function test_splitERC20_RemainderGoesToFirstRecipient() public {
        address[] memory recs = _recs3(alice, bob, carol);
        uint256[] memory bps  = _bps3(3334, 3333, 3333);
        uint256 total = 1_000_001e6; // not perfectly divisible

        token.mint(payer, total); // top-up for this test
        uint256 payerStart = token.balanceOf(payer);

        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "dusty");
        vm.stopPrank();

        uint256 a = (total * 3334) / 10000;
        uint256 b = (total * 3333) / 10000;
        uint256 c = (total * 3333) / 10000;
        uint256 remainder = total - a - b - c;

        assertEq(token.balanceOf(alice),  a + remainder, "alice absorbs remainder");
        assertEq(token.balanceOf(bob),    b);
        assertEq(token.balanceOf(carol),  c);
        assertEq(token.balanceOf(payer),  payerStart - total);
        assertEq(token.balanceOf(address(split)), 0, "split holds nothing");
    }

    /// @dev ERC20PaymentSplit event emitted with correct fields.
    function test_splitERC20_EmitsERC20PaymentSplitEvent() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(5000, 5000);
        uint256 total = 200e6;

        uint256[] memory expectedAmounts = new uint256[](2);
        expectedAmounts[0] = 100e6;
        expectedAmounts[1] = 100e6;

        vm.warp(1_700_000_000);

        vm.startPrank(payer);
        token.approve(address(split), total);

        vm.expectEmit(true, true, false, true, address(split));
        emit ArcSplit.ERC20PaymentSplit(
            address(token),
            payer,
            recs,
            expectedAmounts,
            "ev",
            total,
            block.timestamp
        );

        split.splitERC20(address(token), recs, bps, total, "ev");
        vm.stopPrank();
    }

    /// @dev ArcSplit contract holds no tokens after a split.
    function test_splitERC20_NoResidualTokenBalance() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(6000, 4000);
        uint256 total = 500e6;

        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "");
        vm.stopPrank();

        assertEq(token.balanceOf(address(split)), 0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. splitERC20 — revert paths
    // ══════════════════════════════════════════════════════════════════════════

    function test_Revert_splitERC20_ZeroAmount() public {
        address[] memory recs = _recs1(alice);
        uint256[] memory bps  = _bps1(10000);

        vm.prank(payer);
        vm.expectRevert(ArcSplit.ZeroAmount.selector);
        split.splitERC20(address(token), recs, bps, 0, "");
    }

    function test_Revert_splitERC20_InvalidLength_Empty() public {
        address[] memory recs = new address[](0);
        uint256[] memory bps  = new uint256[](0);

        vm.prank(payer);
        vm.expectRevert(ArcSplit.InvalidLength.selector);
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    function test_Revert_splitERC20_InvalidLength_Mismatch() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps1(10000);

        vm.prank(payer);
        vm.expectRevert(ArcSplit.InvalidLength.selector);
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    function test_Revert_splitERC20_TooManyRecipients() public {
        uint256 n = 51;
        address[] memory recs = new address[](n);
        uint256[] memory bps  = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            recs[i] = makeAddr(string(abi.encode(i + 100)));
            bps[i]  = 196;
        }
        bps[0] = 204; // adjust so they'd sum to 10000 if we got past TooManyRecipients

        vm.prank(payer);
        vm.expectRevert(ArcSplit.TooManyRecipients.selector);
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    function test_Revert_splitERC20_InvalidBasisPointsTotal() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(4000, 4000); // 8000

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(8000))
        );
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    /// @dev transferFrom returns false → "pull" fails with TransferFailed(address(this)).
    function test_Revert_splitERC20_FailedPull() public {
        address[] memory recs = _recs1(alice);
        uint256[] memory bps  = _bps1(10000);
        uint256 total = 100e6;

        // Make the next transferFrom return false
        token.setFailNext(true);

        // Still need to approve so the mock doesn't revert on allowance check
        vm.startPrank(payer);
        token.approve(address(split), total);

        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.TransferFailed.selector, address(split))
        );
        split.splitERC20(address(token), recs, bps, total, "");
        vm.stopPrank();
    }

    /// @dev transfer (push to recipient) returns false → TransferFailed(recipient).
    function test_Revert_splitERC20_FailedPush() public {
        address[] memory recs = _recs1(alice);
        uint256[] memory bps  = _bps1(10000);
        uint256 total = 100e6;

        // Pull will succeed; push will fail.
        // We want the transferFrom to succeed and the transfer to fail.
        // The mock's setFailNext makes the VERY NEXT transfer* call fail.
        // transferFrom is called first for pull, then transfer is called for push.
        // We use alwaysFail = true but we need to let pull through first.
        // Strategy: override with a custom two-stage mock via setFailNext AFTER pull.
        // Actually the easiest approach: use a different mock that lets pull succeed
        // and fails on push. We use a separate MockERC20 and manipulate it inside the
        // call — but we can't intercept mid-call. Instead we use vm.mockCall to
        // stub the transfer (push) to return false, leaving transferFrom alone.

        address tkAddr = address(token);

        // Approve pull
        vm.prank(payer);
        token.approve(address(split), total);
        token.mint(payer, 0); // no-op, just to have a call

        // Stub the outbound transfer(alice, 100e6) to return false.
        // ABI: transfer(address,uint256) = 0xa9059cbb
        vm.mockCall(
            tkAddr,
            abi.encodeWithSelector(bytes4(keccak256("transfer(address,uint256)")), alice, total),
            abi.encode(false)
        );

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.TransferFailed.selector, alice)
        );
        split.splitERC20(tkAddr, recs, bps, total, "");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. calculateSplits — pure function coverage
    // ══════════════════════════════════════════════════════════════════════════

    function test_calculateSplits_EqualTwoWay() public view {
        uint256[] memory bps = _bps2(5000, 5000);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(1 ether, bps);

        assertEq(amounts.length, 2);
        assertEq(amounts[0], 0.5 ether);
        assertEq(amounts[1], 0.5 ether);
        assertEq(remainder,  0);
    }

    function test_calculateSplits_ThreeWayWithRemainder() public view {
        uint256[] memory bps = _bps3(3333, 3333, 3334);
        uint256 total = 1 ether;
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(total, bps);

        uint256 a = (total * 3333) / 10000;
        uint256 b = (total * 3333) / 10000;
        uint256 c = (total * 3334) / 10000;
        uint256 expectedRem = total - a - b - c;

        assertEq(amounts[0], a);
        assertEq(amounts[1], b);
        assertEq(amounts[2], c);
        assertEq(remainder,  expectedRem);
    }

    function test_calculateSplits_DustyAmount() public view {
        // 7 wei split equally is dusty
        uint256[] memory bps = _bps2(5000, 5000);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(7, bps);

        assertEq(amounts[0], 3); // 7*5000/10000 = 3
        assertEq(amounts[1], 3);
        assertEq(remainder,  1); // 7 - 3 - 3 = 1
    }

    function test_calculateSplits_SumPlusRemainderEqualsTotal() public view {
        uint256[] memory bps = _bps3(1234, 5678, 3088);
        uint256 total = 999_999;
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(total, bps);

        uint256 sum = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            sum += amounts[i];
        }
        assertEq(sum + remainder, total, "sum + remainder must equal total");
    }

    function test_calculateSplits_ZeroTotal() public view {
        uint256[] memory bps = _bps2(5000, 5000);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(0, bps);

        assertEq(amounts[0], 0);
        assertEq(amounts[1], 0);
        assertEq(remainder,  0);
    }

    function test_calculateSplits_SingleBps10000() public view {
        uint256[] memory bps = _bps1(10000);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(1234567, bps);

        assertEq(amounts[0], 1234567);
        assertEq(remainder,  0);
    }

    function test_calculateSplits_LargeAmount() public view {
        uint256[] memory bps = _bps2(5000, 5000);
        uint256 total = type(uint128).max;
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(total, bps);

        // For uint128.max (odd): each gets (total/2) = floor(total/2), remainder = 1
        assertEq(amounts[0] + amounts[1] + remainder, total, "conservation holds for large amount");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. Fuzz: basis-point arithmetic conservation
    // ══════════════════════════════════════════════════════════════════════════

    /// @dev For any totalAmount > 0 and two valid bps summing to 10000,
    ///      sum(amounts) + remainder == totalAmount (no ETH lost or created).
    function testFuzz_calculateSplits_TwoWayConservation(
        uint256 totalAmount,
        uint256 bps0
    ) public view {
        totalAmount = bound(totalAmount, 1, type(uint128).max);
        bps0        = bound(bps0, 0, 10000);
        uint256 bps1 = 10000 - bps0;

        uint256[] memory bps = _bps2(bps0, bps1);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(totalAmount, bps);

        assertEq(amounts[0] + amounts[1] + remainder, totalAmount, "conservation violated");
    }

    /// @dev Three-way fuzz conservation.
    function testFuzz_calculateSplits_ThreeWayConservation(
        uint256 totalAmount,
        uint256 bps0,
        uint256 bps1
    ) public view {
        totalAmount = bound(totalAmount, 1, type(uint128).max);
        bps0        = bound(bps0, 0, 10000);
        bps1        = bound(bps1, 0, 10000 - bps0);
        uint256 bps2 = 10000 - bps0 - bps1;

        uint256[] memory bps = _bps3(bps0, bps1, bps2);
        (uint256[] memory amounts, uint256 remainder) = split.calculateSplits(totalAmount, bps);

        uint256 sum = amounts[0] + amounts[1] + amounts[2];
        assertEq(sum + remainder, totalAmount, "3-way conservation violated");
    }

    /// @dev Fuzz splitNative with valid inputs: balances reconcile, contract holds nothing.
    function testFuzz_splitNative_BalanceConservation(
        uint256 totalAmount,
        uint256 bps0
    ) public {
        totalAmount = bound(totalAmount, 1, 50 ether);
        bps0        = bound(bps0, 0, 10000);
        uint256 bps1 = 10000 - bps0;

        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(bps0, bps1);

        uint256 aliceBefore = alice.balance;
        uint256 bobBefore   = bob.balance;

        vm.deal(payer, totalAmount);
        vm.prank(payer);
        split.splitNative{value: totalAmount}(recs, bps, "fuzz");

        uint256 aliceDelta = alice.balance - aliceBefore;
        uint256 bobDelta   = bob.balance   - bobBefore;

        assertEq(aliceDelta + bobDelta, totalAmount, "recipient totals must equal msg.value");
        assertEq(address(split).balance, 0,          "split must hold nothing");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. Reentrancy guard
    // ══════════════════════════════════════════════════════════════════════════

    function test_splitNative_ReentrancyBlocked() public {
        ReentrantRecipient attacker = new ReentrantRecipient(split);

        address[] memory recs = _recs1(address(attacker));
        uint256[] memory bps  = _bps1(10000);

        attacker.setParams(recs, bps);

        vm.deal(address(attacker), 2 ether);
        vm.deal(payer, 1 ether);

        // The reentrancy attempt should revert the outer call.
        // OZ ReentrancyGuard reverts with a custom error ReentrancyGuardReentrantCall().
        vm.prank(payer);
        vm.expectRevert(); // nonReentrant reverts with ReentrancyGuardReentrantCall
        split.splitNative{value: 1 ether}(recs, bps, "reentrancy-test");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 8. _validateBasisPoints: invalid recipients and sums
    // ══════════════════════════════════════════════════════════════════════════

    function test_Revert_validateBasisPoints_ZeroAddressRecipient() public {
        address[] memory recs = new address[](2);
        recs[0] = address(0);
        recs[1] = alice;
        uint256[] memory bps = _bps2(5000, 5000);

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidRecipient.selector, address(0))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_validateBasisPoints_ZeroAddressViaERC20() public {
        address[] memory recs = new address[](2);
        recs[0] = address(0);
        recs[1] = alice;
        uint256[] memory bps = _bps2(5000, 5000);

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidRecipient.selector, address(0))
        );
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    function test_Revert_validateBasisPoints_SumNotEqual10000_Native() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(1000, 1000); // sum = 2000

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(2000))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    function test_Revert_validateBasisPoints_SumNotEqual10000_ERC20() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(9999, 0); // sum = 9999

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(9999))
        );
        split.splitERC20(address(token), recs, bps, 100e6, "");
    }

    function test_Revert_validateBasisPoints_AllZeroBps() public {
        address[] memory recs = _recs2(alice, bob);
        uint256[] memory bps  = _bps2(0, 0); // sum = 0

        vm.prank(payer);
        vm.expectRevert(
            abi.encodeWithSelector(ArcSplit.InvalidBasisPointsTotal.selector, uint256(0))
        );
        split.splitNative{value: ONE_ETH}(recs, bps, "");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MAX_RECIPIENTS boundary: exactly 50 recipients must succeed
    // ══════════════════════════════════════════════════════════════════════════

    function test_splitNative_ExactlyMaxRecipients() public {
        uint256 n = 50;
        address[] memory recs = new address[](n);
        uint256[] memory bps  = new uint256[](n);

        for (uint256 i = 0; i < n; i++) {
            recs[i] = makeAddr(string(abi.encode(i + 200)));
            bps[i]  = 200; // 50 * 200 = 10000
        }

        vm.deal(payer, 1 ether);
        vm.prank(payer);
        split.splitNative{value: 1 ether}(recs, bps, "max50");
        // Should succeed — no revert
    }

    function test_splitERC20_ExactlyMaxRecipients() public {
        uint256 n = 50;
        address[] memory recs = new address[](n);
        uint256[] memory bps  = new uint256[](n);
        uint256 total = 5000e6;

        for (uint256 i = 0; i < n; i++) {
            recs[i] = makeAddr(string(abi.encode(i + 300)));
            bps[i]  = 200;
        }

        token.mint(payer, total);
        vm.startPrank(payer);
        token.approve(address(split), total);
        split.splitERC20(address(token), recs, bps, total, "max50-erc20");
        vm.stopPrank();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Helper builders (keep test bodies readable)
    // ══════════════════════════════════════════════════════════════════════════

    function _recs1(address a) internal pure returns (address[] memory r) {
        r = new address[](1); r[0] = a;
    }
    function _recs2(address a, address b) internal pure returns (address[] memory r) {
        r = new address[](2); r[0] = a; r[1] = b;
    }
    function _recs3(address a, address b, address c) internal pure returns (address[] memory r) {
        r = new address[](3); r[0] = a; r[1] = b; r[2] = c;
    }

    function _bps1(uint256 a) internal pure returns (uint256[] memory b) {
        b = new uint256[](1); b[0] = a;
    }
    function _bps2(uint256 a, uint256 c) internal pure returns (uint256[] memory b) {
        b = new uint256[](2); b[0] = a; b[1] = c;
    }
    function _bps3(uint256 a, uint256 c, uint256 d) internal pure returns (uint256[] memory b) {
        b = new uint256[](3); b[0] = a; b[1] = c; b[2] = d;
    }
}
