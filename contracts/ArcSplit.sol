// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcSplit
 * @notice Multi-party USDC Split-Payment & Creator Tip Jar on Arc Network.
 * @dev Arc uses USDC as its native gas token. This contract distributes incoming native USDC
 *      (or ERC-20 tokens) instantly and non-custodially to multiple recipient addresses
 *      according to predetermined basis points (10000 = 100.00%).
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract ArcSplit is ReentrancyGuard {
    // 10,000 basis points = 100.00%
    uint256 public constant TOTAL_BASIS_POINTS = 10000;
    uint256 public constant MAX_RECIPIENTS = 50;

    event PaymentSplit(
        address indexed payer,
        address[] recipients,
        uint256[] amounts,
        string memo,
        uint256 totalAmount,
        uint256 timestamp
    );

    event ERC20PaymentSplit(
        address indexed token,
        address indexed payer,
        address[] recipients,
        uint256[] amounts,
        string memo,
        uint256 totalAmount,
        uint256 timestamp
    );

    error InvalidLength();
    error InvalidBasisPointsTotal(uint256 currentTotal);
    error ZeroAmount();
    error TransferFailed(address recipient);
    error InvalidRecipient(address recipient);
    error TooManyRecipients();

    /**
     * @notice Splits native Arc currency (USDC) among multiple recipients based on basis points.
     * @dev On Arc Network, msg.value is denominated in the native gas token, which is USDC at 18 decimals. Do NOT pass an amount denominated in ERC-20 USDC (6 decimals) — a 1 USDC intent expressed as 1e6 will be treated as 0.000001 USDC worth of native value.
     * @param recipients Array of recipient addresses.
     * @param basisPoints Array of basis points for each recipient (must sum to 10,000).
     * @param memo Optional on-chain message or invoice identifier.
     */
    function splitNative(
        address[] calldata recipients,
        uint256[] calldata basisPoints,
        string calldata memo
    ) external payable nonReentrant {
        uint256 len = recipients.length;
        if (len == 0 || len != basisPoints.length) revert InvalidLength();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (msg.value == 0) revert ZeroAmount();

        _validateBasisPoints(recipients, basisPoints);

        uint256[] memory amounts = new uint256[](len);
        uint256 distributed = 0;

        for (uint256 i = 0; i < len; ) {
            uint256 amount = (msg.value * basisPoints[i]) / TOTAL_BASIS_POINTS;
            amounts[i] = amount;
            distributed += amount;

            if (amount > 0) {
                (bool success, ) = payable(recipients[i]).call{value: amount}("");
                if (!success) revert TransferFailed(recipients[i]);
            }
            unchecked { ++i; }
        }

        uint256 remainder = msg.value - distributed;
        if (remainder > 0) {
            (bool success, ) = payable(recipients[0]).call{value: remainder}("");
            if (!success) revert TransferFailed(recipients[0]);
            amounts[0] += remainder;
        }

        emit PaymentSplit(msg.sender, recipients, amounts, memo, msg.value, block.timestamp);
    }

    /**
     * @notice Splits ERC-20 tokens among multiple recipients based on basis points.
     * @dev totalAmount must be denominated in the ERC-20 token's own decimal precision (e.g. 6 decimals for USDC). On Arc Network the native USDC (msg.value path) uses 18 decimals — do NOT mix the two representations.
     */
    function splitERC20(
        address token,
        address[] calldata recipients,
        uint256[] calldata basisPoints,
        uint256 totalAmount,
        string calldata memo
    ) external nonReentrant {
        uint256 len = recipients.length;
        if (len == 0 || len != basisPoints.length) revert InvalidLength();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (totalAmount == 0) revert ZeroAmount();

        _validateBasisPoints(recipients, basisPoints);

        bool pulled = IERC20(token).transferFrom(msg.sender, address(this), totalAmount);
        if (!pulled) revert TransferFailed(address(this));

        uint256[] memory amounts = new uint256[](len);
        uint256 distributed = 0;

        for (uint256 i = 0; i < len; ) {
            uint256 amount = (totalAmount * basisPoints[i]) / TOTAL_BASIS_POINTS;
            amounts[i] = amount;
            distributed += amount;

            if (amount > 0) {
                bool sent = IERC20(token).transfer(recipients[i], amount);
                if (!sent) revert TransferFailed(recipients[i]);
            }
            unchecked { ++i; }
        }

        uint256 remainder = totalAmount - distributed;
        if (remainder > 0) {
            bool sent = IERC20(token).transfer(recipients[0], remainder);
            if (!sent) revert TransferFailed(recipients[0]);
            amounts[0] += remainder;
        }

        emit ERC20PaymentSplit(token, msg.sender, recipients, amounts, memo, totalAmount, block.timestamp);
    }

    function _validateBasisPoints(address[] calldata recipients, uint256[] calldata basisPoints) private pure {
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; ) {
            if (recipients[i] == address(0)) revert InvalidRecipient(recipients[i]);
            total += basisPoints[i];
            unchecked { ++i; }
        }
        if (total != TOTAL_BASIS_POINTS) revert InvalidBasisPointsTotal(total);
    }

    /**
     * @notice Calculate exact amounts for given total and basis points.
     */
    function calculateSplits(uint256 totalAmount, uint256[] calldata basisPoints)
        external
        pure
        returns (uint256[] memory amounts, uint256 remainder)
    {
        uint256 len = basisPoints.length;
        amounts = new uint256[](len);
        uint256 distributed = 0;
        for (uint256 i = 0; i < len; ) {
            amounts[i] = (totalAmount * basisPoints[i]) / TOTAL_BASIS_POINTS;
            distributed += amounts[i];
            unchecked { ++i; }
        }
        remainder = totalAmount - distributed;
    }
}
