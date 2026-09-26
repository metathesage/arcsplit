# ArcSplit ⚡

> **High-voltage, non-custodial multi-party USDC payments and creator tip jars powered by Arc Network's native USDC gas.**  
> **Built by [@metathesage](https://x.com/metathesage) for the Arc Network Ecosystem.**

---

## ⚡ Overview

On traditional chains (Ethereum, Arbitrum, Base), distributing payments across multiple wallets requires:
1. Swapping for or holding volatile native gas tokens (ETH).
2. Sending a token `approve()` transaction.
3. Paying separate gas fees per approval and transfer.

**Arc changes this fundamentally.** Arc is Circle’s stablecoin-native Layer-1 blockchain where **USDC is the native gas token**.

**ArcSplit** leverages this architecture to make multi-party splits seamless:
- **Zero Token Approvals:** Send native USDC directly into `ArcSplit.sol` without requiring ERC-20 allowances.
- **Predictable Sub-Cent Gas:** Gas is paid natively in fractional USDC.
- **Atomic 100.00% Precision:** Configurable basis points (up to 10,000 bps) ensure exact mathematical payouts to contributors, co-founders, or affiliates.
- **Shareable Permalinks & Invoices:** Encode split recipients directly into URL query parameters (e.g. `?split=0x...:60;0x...:40&memo=PodcastTips`) so anyone can tip or settle an invoice with 1 click.
- **On-Chain Memos:** Emits `PaymentSplit` events containing invoice references and memo notes.
- **Interactive Lightning Scene:** High-voltage Web3 interface with procedural lightning bolts and real-time audio arc synthesis.

---

## 🌐 Live Demo & Deployment
- **Live dApp URL:** [https://arcsplit-two.vercel.app](https://arcsplit-two.vercel.app)
- **GitHub Repository:** [https://github.com/metathesage/arcsplit](https://github.com/metathesage/arcsplit)

---

## ⛓️ Deployed Contracts & Arc Network Parameters

| Network | Chain ID | Contract Address | Explorer Link | RPC Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Arc Mainnet** | `5042` (`0x13b2`) | `0x57B02Be99573B4aD4d744278821932f5b8742535` | [View on Arc Explorer](https://explorer.arc.io/address/0x57B02Be99573B4aD4d744278821932f5b8742535) | `https://rpc.mainnet.arc.io` |
| **Arc Testnet** | `5042002` (`0x4cef72`) | `0x3B31124377078eE939786e2765e1820Ad2C96399` | [View on Testnet Explorer](https://explorer.testnet.arc.io/address/0x3B31124377078eE939786e2765e1820Ad2C96399) | `https://rpc.testnet.arc.io` |

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
Compiles with `viaIR: true` and 200 optimizer runs, outputting ABI and 0x-prefixed bytecode to `src/contracts/ArcSplitData.json`.

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

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## ⚡ Creator & Ecosystem Credits
- **Architect & Developer:** [@metathesage](https://x.com/metathesage)
- **Target Network:** [Arc Network](https://arc.io)

---

## 📄 License
MIT
