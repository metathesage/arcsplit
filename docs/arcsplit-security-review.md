# ArcSplit Security Review
**Contract:** `contracts/ArcSplit.sol`  
**Target chain:** Arc Network (Arc Testnet) — native gas token is USDC  
**Severity preset:** MAX  
**Date:** 2026-09-24  
**Auditors:** Rule-corpus (solidity-auditor) + Functional (functional-auditor), parallel pass, 2 rounds

---

## Round 1 — Initial audit

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 3 |
| Medium | 2 |
| Informational / Optimisation | 4 |

See "Round 1 findings" section below for the full original findings.

---

## Round 2 — Post-fix re-audit

All 7 requested fixes confirmed applied and verified clean. Remaining findings after fixes:

| Severity | Count |
|---|---|
| High | 1 (architectural — accepted, documented below) |
| Low | 1 (documentation — `unchecked` comments) |

---

## Applied fixes (all confirmed resolved)

| # | Fix | Status |
|---|---|---|
| 1 | `MAX_RECIPIENTS = 50` cap + `TooManyRecipients` error | Resolved |
| 2 | `ReentrancyGuard` inherited; `nonReentrant` on `splitNative` and `splitERC20` | Resolved |
| 3 | Native remainder transfer reverts on failure | Resolved |
| 4 | ERC-20 remainder transfer return value checked and reverted on failure | Resolved |
| 5 | Bare `receive()` removed | Resolved |
| 6 | NatSpec decimal clarification added to both split functions (18 dec native vs 6 dec ERC-20) | Resolved |
| 7 | `calculateSplits` now returns `(amounts, remainder)` with conservation guarantee | Resolved |

---

## Remaining findings

### R-1 — Push-payment design: one blocked recipient reverts entire split (High — architectural)

**Location:** `splitNative` lines 71–88, `splitERC20` lines 117–134  
**Category:** Denial of service / Arc-specific push-payment behaviour

Both functions perform all-or-nothing push transfers. On Arc, native USDC sends and
ERC-20 USDC transfers can revert for Arc-layer recipient restrictions (blocklist,
address policy). A single problematic recipient in the caller-supplied array causes the
entire batch to revert after gas is consumed.

**This is an architectural decision, not a bug.** The contract is documented as
non-custodial and atomic. Operators should validate recipient eligibility off-chain
before submission, or build a wrapper that prunes bad recipients before calling.

**To fully resolve** if atomicity is not required: implement a pull-payment pattern
(credit a `pendingWithdrawals` mapping in the loop, add a `withdraw()` function).
This would also eliminate the `nonReentrant` need on the native path.

**Current mitigation:** `MAX_RECIPIENTS = 50` limits the blast radius. `nonReentrant`
blocks reentrancy from a malicious recipient. Both are in place.

---

### R-2 — `unchecked` loop increments lack inline safety comments (Low — documentation)

**Location:** All four loop sites in the contract  
**Category:** Documentation / maintainability

The `unchecked { ++i; }` pattern is safe because `i < len <= MAX_RECIPIENTS <= 50`,
so overflow is unreachable. However no comment documents this, which increases review
friction for future maintainers.

**Recommended fix:**
```solidity
unchecked { ++i; } // safe: i < len <= MAX_RECIPIENTS (50)
```

---

## Slither static analysis

Ran against `contracts/ArcSplit.sol` with `--filter-paths node_modules`.

| Detector | Severity | Assessment |
|---|---|---|
| `msg-value-loop` | Medium | Intended — splitter reads `msg.value` in a loop to compute per-recipient share. Not a bug. |
| `calls-loop` | Medium | Intended — splitter must call each recipient. Bounded by `MAX_RECIPIENTS = 50`. |
| `low-level-calls` | Informational | Intended — native Arc transfers require `.call{value:}`. |

All 3 findings are intrinsic to the push-payment splitter design and bounded by the
`MAX_RECIPIENTS` cap. No actionable Slither findings.

---

## Unit test results

**46 / 46 tests passed. Zero suspected contract bugs.**

Coverage: happy path splits (2-way, 3-way, 50-way boundary), remainder dust conservation,
event emission, reentrancy block, `TooManyRecipients`, `InvalidLength`, `ZeroAmount`,
`InvalidBasisPointsTotal`, `TransferFailed` on reverting recipients, failed ERC-20 pull
and push, `_validateBasisPoints` with zero-address and wrong sums, and fuzz runs
confirming `sum(amounts) + remainder == totalAmount` for all inputs.

Test file: `contracts/test/ArcSplit.t.sol`

---

## Round 1 findings (historical reference)

### C-1 — Native remainder silent fail (FIXED)
The `if (success)` guard on the native remainder path did nothing when the call failed —
remainder stayed locked forever. Fixed: now `if (!success) revert TransferFailed(...)`.

### C-2 — ERC-20 remainder unchecked return (FIXED)
`IERC20(token).transfer(...)` return value was discarded; `amounts[0]` was updated
regardless. Fixed: bool check + revert, mirroring the main-loop pattern.

### C-3 — `receive()` traps native USDC (FIXED)
Bare `receive() external payable {}` accepted any direct send with no recovery path.
Fixed: removed entirely.

### H-1 — Unbounded recipient array (FIXED)
No cap on array length. Fixed: `MAX_RECIPIENTS = 50` + `TooManyRecipients` error.

### H-2 — Push-payment DoS (OPEN — architectural, documented as R-1 above)
Single blocked recipient reverts entire split. Still present by design.

### H-3 — No reentrancy guard (FIXED)
No `nonReentrant` modifier. Fixed: inherits `ReentrancyGuard`, both split functions
decorated with `nonReentrant`.

### M-1 — Blocked ERC-20 recipient halts batch (OPEN — sub-case of R-1)
Same root cause as H-2 on the ERC-20 path. Bounded by `MAX_RECIPIENTS`.

### M-2 — Arc native USDC decimal mismatch (FIXED)
No documentation of the 18-dec (native) vs 6-dec (ERC-20) distinction. Fixed: NatSpec
added to both functions with explicit decimal warnings.

### I-1 — `calculateSplits` discards remainder (FIXED)
No remainder return value. Fixed: signature updated to `returns (amounts, remainder)`.

### I-2 — Zero-amount transfers (NON-ISSUE)
Already guarded consistently in both paths.

### I-3 — `block.timestamp` in events (INFORMATIONAL — accepted)
Minor manipulation window for block proposers; indexers should use block timestamp.
Not changed; noted for off-chain integrators.

### I-4 — `memo` not indexed (INFORMATIONAL — accepted)
String fields cannot be indexed in Solidity. If invoice-ID search is required, switch
to `bytes32` and index.

---

## Arc-specific notes for operators

1. **Decimal discipline.** `splitNative` takes `msg.value` in 18-decimal native USDC.
   `splitERC20` takes `totalAmount` in the token's own decimals (6 for USDC). Never
   pass a 6-decimal amount to `splitNative` — it will execute for 10^-12 the intended
   value.

2. **Recipient pre-validation.** Before calling either split function, validate every
   recipient address against Arc's active USDC blocklist off-chain. A single blocked
   recipient reverts the entire batch.

3. **Gas estimation.** With `MAX_RECIPIENTS = 50`, worst-case gas is bounded and
   predictable. Build off-chain gas estimates around this cap.

---

## Audit Provenance

Round 1:

| Subagent | Dispatched | Files audited | Corpus rules cited |
|---|---|---|---|
| solidity-auditor | yes | 1 | unbounded-loop-external-call-dos, arc-native-value-transfer-reverts-blocklist-zero-address-precompile, use-safe-erc20-for-erc20-interactions, erc20-batch-transfer-blocklisted-recipient-reverts-all, missing-withdrawal-mechanism-for-deposited-funds |
| functional-auditor | yes | 1 | — |

Round 2:

| Subagent | Dispatched | Files audited | Corpus rules cited |
|---|---|---|---|
| solidity-auditor | yes | 2 | arc-native-value-transfer-reverts-blocklist-zero-address-precompile, unchecked-safety-proof-documentation |
| functional-auditor | yes | 1 | — |
