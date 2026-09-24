# ArcSplit ⚡

> **Instant, non-custodial multi-party USDC payments and creator tip jars powered by Arc Network's native USDC gas.**

Built for the **Arc Network Microgrants Program** (20 x $500 USDC | Submission Deadline: October 14, 2026).

---

## 🌟 Overview

On traditional chains (Ethereum, Arbitrum, Base), distributing payments across multiple wallets requires:
1. Swapping for or holding volatile native gas tokens (ETH).
2. Sending a token `approve()` transaction.
3. Paying separate gas fees per approval and transfer.

**Arc changes this fundamentally.** Arc is Circle’s stablecoin-native Layer-1 blockchain where **USDC is the native gas token**.

**ArcSplit** leverages this architecture to make multi-party splits seamless:
- **Zero Token Approvals:** Send native USDC directly into `ArcSplit.sol` without requiring ERC-20 allowances.
- **Predictable Sub-Cent Gas:** Gas is paid natively in fractional USDC.
- **Atomic 100.00% Precision:** Configurable basis points (up to 10,000 bps) ensure exact mathematical payouts to contributors, co-founders, or affiliates.
- **Shareable Tip Jars & Invoices:** Encode split recipients directly into URL query parameters (e.g. `?split=0x...:60;0x...:40&memo=PodcastTips`) so anyone can tip or settle an invoice with 1 click.
- **On-Chain Memos:** Emits `PaymentSplit` events containing invoice references and memo notes.

---

## ⛓️ Arc Network Parameters

| Parameter | Arc Mainnet | Arc Testnet |
| :--- | :--- | :--- |
| **Chain ID** | `5042` (`0x13b2`) | `5042002` (`0x4cef72`) |
| **RPC Endpoint** | `https://rpc.mainnet.arc.io` | `https://rpc.testnet.arc.io` |
| **Currency Symbol** | `USDC` | `USDC` |
| **Block Explorer** | [explorer.arc.io](https://explorer.arc.io) | [explorer.testnet.arc.io](https://explorer.testnet.arc.io) |

---

## 📑 Smart Contract: `ArcSplit.sol`

Located in `contracts/ArcSplit.sol`.

### Core Functions:
- `splitNative(address[] calldata recipients, uint256[] calldata basisPoints, string calldata memo) external payable`
  - Validates recipient addresses and ensures basis points sum to `10000` (100.00%).
  - Performs direct pass-through via `payable(recipient).call{value: share}("")`.
  - Routes any division remainder (wei rounding) to the primary recipient to prevent locked funds.
  - Emits `PaymentSplit(msg.sender, recipients, amounts, memo, msg.value, block.timestamp)`.
- `splitERC20(address token, address[] calldata recipients, uint256[] calldata basisPoints, uint256 totalAmount, string calldata memo) external`
  - Also supports standard ERC-20 token distributions.

### Compiling the Contract:
```bash
node scripts/compile.cjs
```
Compiles with `viaIR: true` and 200 optimizer runs, outputting ABI and bytecode to `src/contracts/ArcSplitData.json`.

---

## 🚀 Deployment Options

### Option 1: In-Browser 1-Click Deployer (Recommended)
1. Open the ArcSplit web app.
2. Connect your wallet (MetaMask, Rabby, Coinbase Wallet).
3. Navigate to the **"Contract Deployer"** tab.
4. Click **"Deploy to Arc Mainnet"**. Your wallet will sign and deploy the contract using Arc's native USDC gas in seconds!

### Option 2: CLI Deployment (Node.js & Ethers)
```bash
# Mainnet deploy:
node scripts/deploy.cjs --network mainnet --private-key <YOUR_PRIVATE_KEY>

# Testnet deploy:
node scripts/deploy.cjs --network testnet --private-key <YOUR_PRIVATE_KEY>
```

---

## 💻 Running the Web Application Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 🏆 Arc Microgrant Submission Kit

| Field | Submission Details |
| :--- | :--- |
| **Project Name** | **ArcSplit** |
| **Tagline** | Instant, non-custodial multi-party USDC payments and creator tip jars powered by Arc Network's native USDC gas. |
| **Arc Mainnet Contract** | `0x8A14c33076e0c651F10705E3f757270275C68b81` (or your deployed address via the Deployer tab) |
| **Target Grant** | Arc Microgrants ($500 USDC) |
| **Ecosystem Value** | Showcases Arc’s primary superpower (USDC native gas) for consumer, creator, and B2B payout use cases that are cost-prohibitive on other networks. |

---

## 📄 License
MIT
