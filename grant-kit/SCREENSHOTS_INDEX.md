# ArcSplit — Circle Products Code Screenshots & Architecture Kit

This folder contains high-resolution (1920×1080) code screenshots and architectural diagrams for the **Circle Developer Grant Application** (Field 12).

Google Drive Submission Folder:  
🔗 **[ArcSplit — Circle Grant Materials Google Drive](https://drive.google.com/drive/folders/1bj8sxJgPVW5bYXfd_Dklb4ZsiXtcBO1b?usp=sharing)**

---

## 📸 Screenshot Inventory by Circle Product

### 1. Circle Product 1: Native USDC on Arc L1 (Smart Contract Settlement & Gas)
| File | Description | Relevant Code / Path |
|------|-------------|-----------------------|
| `01-circle-native-usdc-arcsplit-contract.png` | `splitNative()` implementation showing atomic USDC distribution, exact 10,000 basis-point math, zero ERC-20 approval overhead, and remainder recovery. | `contracts/ArcSplit.sol` |
| `02-circle-native-usdc-verification.png` | Deployment script & mainnet verification parameters on Arc Mainnet (Chain ID 5042) with 18-decimal native USDC gas token. | `scripts/deploy.cjs` |

### 2. Circle Product 2: Circle Programmable Wallets (User-Controlled Wallets & Passkeys)
| File | Description | Relevant Code / Path |
|------|-------------|-----------------------|
| `03-circle-programmable-wallets-passkey.png` | WebAuthn biometric passkey registration simulation & non-custodial smart contract wallet creation with USDC gas sponsorship. | `src/components/AccountSection.jsx` |
| `04-circle-wallets-addressbook-history.png` | Beneficiary Address Book with 1-click batch loading into the Splitter and tax-compliant CSV export of Arc payment history. | `src/components/AccountSection.jsx` |

### 3. Circle Product 3: Cross-Chain USDC (CCTP & Relay Ingestion)
| File | Description | Relevant Code / Path |
|------|-------------|-----------------------|
| `05-circle-crosschain-usdc-cctp-routing.png` | Multi-chain USDC ingestion configuration routing funds from Base, Ethereum, Arbitrum, Optimism, Polygon, and Solana into Arc L1 Native USDC gas. | `src/components/RelayBridgeModal.jsx` |
| `06-circle-crosschain-usdc-execution.png` | Real-time cross-chain quote fetching, gas breakdown, fee calculation, and automated balance refresh pipeline. | `src/components/RelayBridgeModal.jsx` |

### 4. Circle Product 4: Agentic Economy & Autonomous Agent Swarm Payout SDK
| File | Description | Relevant Code / Path |
|------|-------------|-----------------------|
| `07-circle-agentic-swarm-sdk-ts.png` | TypeScript SDK snippet demonstrating programmatic multi-agent swarm revenue distribution for ERC-8004 identity nodes and ERC-8183 job escrows. | `src/components/AgenticSplitter.jsx` |
| `08-circle-agentic-swarm-sdk-py.png` | Python / Web3.py SDK script for LangChain / CrewAI autonomous agent pipelines executing native USDC micro-splits on Arc. | `src/components/AgenticSplitter.jsx` |

---

## 🏛️ Supporting Documentation & Architecture Diagram
| File | Description | Category |
|------|-------------|----------|
| `09-arcsplit-system-architecture-diagram.png` | Comprehensive 3-tier system architecture diagram showing Ingestion & Wallets, Arc L1 Core Settlement Engine, and Downstream Consumers (AI Swarms & Humans). | Supporting Architecture Diagram |
| `03-arcsplit-dapp-dashboard.png` | Full-screen live dApp screenshot of ArcSplit running on Arc Mainnet at `https://arcsplit-two.vercel.app`. | Live Production UI |
| `ArcSplit-Investor-Deck.pdf` | 10-slide high-resolution investor deck and ecosystem strategic vision. | Investor Deck (Field 13) |
| `ArcSplit-Video-Transcript.pdf` | Formatted PDF transcript of the 2:25 video walkthrough presentation. | Video Transcript (Field 11) |
| `ArcSplit-Grant-Walkthrough.mp4` | 1080p full narrated video walkthrough demo. | Video Demo (Field 10) |
