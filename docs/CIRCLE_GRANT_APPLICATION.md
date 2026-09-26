# ArcSplit — Circle Developer Grant Application

**Project Name:** ArcSplit  
**Ecosystem:** Arc Network (Circle's Stablecoin-Native L1)  
**Live Application:** https://arcsplit-two.vercel.app  
**GitHub Repository:** https://github.com/metathesage/arcsplit  
**Primary Contact / Builder:** [@metathesage](https://x.com/metathesage)  
**Mainnet Contract:** `0x57B02Be99573B4aD4d744278821932f5b8742535`  
**Testnet Contract:** `0x3B31124377078eE939786e2765e1820Ad2C96399`  

---

### Field 1: Which Circle products are currently integrated into your project?
*(Your video submission will need to validate this)*

```text
1. Native USDC on Arc Network (Circle's Stablecoin-Native L1):
ArcSplit natively utilizes USDC as both the primary settlement currency and the native gas token on Arc Mainnet (Chain ID 5042) and Arc Testnet (Chain ID 5042002). Because Arc uses USDC for gas, ArcSplit eliminates the traditional ERC-20 approve() bottleneck, allowing users and autonomous AI agents to execute multi-party payment splits in a single atomic transaction without paying gas in volatile tokens like ETH.

2. Cross-Chain USDC Ingestion (via Relay & CCTP routing):
ArcSplit integrates cross-chain bridging infrastructure that routes USDC from Ethereum, Base, Arbitrum, Optimism, Polygon, and Solana into native Arc USDC, enabling users on any ecosystem to fund and execute splits on Arc with immediate settlement.

3. Circle Onramp Kit (@circle-fin/onramp-kit) & Arc App Kit Fiat Onramp:
ArcSplit integrates Circle's official @circle-fin/onramp-kit and Arc App Kit Fiat Onramp (https://docs.arc.io/app-kit/onramp). Users can purchase native Arc USDC directly with Apple Pay, Google Pay, and debit cards right inside the dApp via serverless ephemeral session tokens, onboarding mainstream creators and organizations to Arc without prior crypto experience.
```

---

### Field 2: Which Circle products do you plan to integrate into your project?

```text
1. Circle Programmable Wallets & User-Controlled Wallets:
Integrate Circle Developer Services (Web & Mobile SDKs) to provide non-custodial smart contract wallets for web2 creators and collaborative teams. Users will be able to set up instant royalty and payout splits using social/email logins (WebAuthn/Passkeys) with automated USDC gas sponsorship.

2. Circle CCTP (Cross-Chain Transfer Protocol):
Integrate native 1:1 cross-chain USDC mint/burn rails directly into the ArcSplit contract architecture. This will allow cross-chain disbursements: a payer can initiate a split on Ethereum or Base, and ArcSplit will programmatically distribute the funds to recipient wallets natively on Arc and other CCTP-supported chains with zero slippage.

3. Circle Gateway:
Implement Circle Gateway for instant cross-chain USDC liquidity unified balance routing, specifically enabling autonomous AI swarms (ERC-8004 / ERC-8183) to settle micropayments and task bounties seamlessly across networks.
```

---

### Field 3: Milestones and Timelines

#### Milestone 01 Title:
*(Max 1024 chars)*
```text
ArcSplit Core V1 Production Release & AI Agent Swarm Payout Standard on Arc Mainnet
```

#### Details about Milestone 01:
*(Max 2048 chars)*
```text
Deliverables:
1. Deployed and verified ArcSplit smart contracts on Arc Mainnet (0x57B02Be99573B4aD4d744278821932f5b8742535) and Arc Testnet (0x3B31124377078eE939786e2765e1820Ad2C96399).
2. Production non-custodial web application (https://arcsplit-two.vercel.app) with 100.00% basis-point precision splitting, custom on-chain memo logging, and shareable permalink generators.
3. Open-source TypeScript and Python agent SDK snippets integrated into the dApp, enabling AI swarms conforming to Arc's Agentic Economy standards (ERC-8004 Agent Identity & ERC-8183 Job Escrows) to execute autonomous micro-splits programmatically.
4. Comprehensive developer documentation, contract verification on Arc Explorer, and MIT open-source repository on GitHub (https://github.com/metathesage/arcsplit).

Success Metrics:
- Contract live on Arc Mainnet with 100% test suite pass rate.
- Zero token approval overhead (sub-cent native USDC gas execution).
- Functional permalink sharing tested with active wallet executions.
```

---

### Field 4: Project Traction and Roadmap — Where can we verify your traction?
*(Max 300 chars)*

```text
Contracts verified on Arc Explorer:
Mainnet: https://explorer.arc.io/address/0x57B02Be99573B4aD4d744278821932f5b8742535
Testnet: https://explorer.testnet.arc.io/address/0x3B31124377078eE939786e2765e1820Ad2C96399
Live App: https://arcsplit-two.vercel.app
Code: https://github.com/metathesage/arcsplit
```

---

### Field 5: Verification Documents (Google Drive link)
```text
https://drive.google.com/drive/folders/1bj8sxJgPVW5bYXfd_Dklb4ZsiXtcBO1b?usp=sharing
```

**Drive folder contents (ArcSplit — Circle Grant Materials):**
| # | File | Circle Product & Purpose |
|---|------|--------------------------|
| 1 | `01-circle-native-usdc-arcsplit-contract.png` | **Product 1 (Native USDC on Arc):** `splitNative()` atomic distribution, 10,000 bps math, zero-approval settlement (`contracts/ArcSplit.sol`) |
| 2 | `02-circle-native-usdc-verification.png` | **Product 1 (Native USDC on Arc):** Arc Mainnet (5042) deployment & verification with 18-decimal native USDC gas |
| 3 | `03-circle-programmable-wallets-passkey.png` | **Product 2 (Programmable Wallets):** WebAuthn biometric passkey onboarding & gas-sponsored non-custodial wallets (`src/components/AccountSection.jsx`) |
| 4 | `04-circle-wallets-addressbook-history.png` | **Product 2 (Programmable Wallets):** Beneficiary Address Book & 1-click batch split execution + CSV export |
| 5 | `05-circle-crosschain-usdc-cctp-routing.png` | **Product 3 (Cross-Chain USDC / CCTP):** Multi-chain USDC ingestion configuration routing to Arc L1 native gas (`src/components/RelayBridgeModal.jsx`) |
| 6 | `06-circle-crosschain-usdc-execution.png` | **Product 3 (Cross-Chain USDC / CCTP):** Sub-second cross-chain quote fetching, gas breakdown, and automated balance sync |
| 7 | `07-circle-agentic-swarm-sdk-ts.png` | **Product 4 (Agentic Economy):** TypeScript autonomous swarm SDK for ERC-8004 identity & ERC-8183 job escrows (`src/components/AgenticSplitter.jsx`) |
| 8 | `08-circle-agentic-swarm-sdk-py.png` | **Product 4 (Agentic Economy):** Python / Web3.py SDK script for LangChain / CrewAI autonomous agent micropayments |
| 9 | `09-arcsplit-system-architecture-diagram.png` | **Architecture Diagram:** Comprehensive 3-tier system architecture illustrating end-to-end Circle product integration |
| 10 | `03-arcsplit-dapp-dashboard.png` | **Production UI:** Live dApp dashboard at `https://arcsplit-two.vercel.app` |
| 11 | `ArcSplit-Investor-Deck.pdf` | **Investor Deck:** 10-slide high-res strategic deck (Q13) |
| 12 | `ArcSplit-Video-Transcript.pdf` | **Video Transcript:** Narration transcript for the 2:25 video walkthrough (Q11) |
| 13 | `ArcSplit-Grant-Walkthrough.mp4` | **Video Demo:** 1080p full narrated video walkthrough (Q10) |

---

### Field 6: Are you funded?
```text
No
```

---

### Field 7: Technical Roadmap: Grant Milestones
*(Exact required format: what will exist at completion | Circle product involved | target date | success metric)*  
*(Max 1250 chars)*

```text
Launch ArcSplit V1 Core and AI Swarm Payout SDK on Arc Mainnet | Native USDC on Arc | 2026-03-31 | 50 unique multi-party splits executed on Arc Mainnet
Integrate Circle Programmable Wallets for Email/Passkey Onboarding | Circle Programmable Wallets | 2026-05-15 | 250 creator tip jars and non-custodial wallets generated
Implement Native Cross-Chain Payouts via Circle CCTP & Gateway | Circle CCTP | 2026-06-30 | $50,000 in cross-chain USDC splits settled with zero slippage
Release ArcSplit Autonomous Agent Oracle & Job Escrow Hooks (ERC-8183) | Circle Gateway | 2026-08-31 | 10 autonomous AI agent swarms executing recurring on-chain revenue splits
```

---

### Field 8: Are you seeking funding or support for a smart contract audit or security review as part of your application?
```text
Yes
```

---

### Field 9: Summarize audit findings, or write N/A
*(Max 500 chars)*

```text
ArcSplit.sol completed a 2-round security review (docs/arcsplit-security-review.md). All 7 identified vulnerabilities were resolved: ReentrancyGuard was implemented, remainder division transfers verified with zero wei loss, MAX_RECIPIENTS capped at 50, and unauthenticated receive() removed. The contract enforces atomic Checks-Effects-Interactions and exact 10,000 basis-point balance preservation. We seek grant support for a formal third-party audit prior to scaling institutional volume.
```

---

### Field 10: Deck and Demo — Video Walkthrough Link
```text
[Paste your YouTube unlisted / Loom video link here]
```

---

### Field 11: Video Transcript (Google Drive / GitHub Link)
```text
https://github.com/metathesage/arcsplit/blob/master/docs/VIDEO_TRANSCRIPT.md
```

---

### Field 12: Code Screenshots Link
```text
https://drive.google.com/drive/folders/1bj8sxJgPVW5bYXfd_Dklb4ZsiXtcBO1b?usp=sharing
```
*(Backup GitHub Link: https://github.com/metathesage/arcsplit/tree/master/grant-kit)*

---

### Field 13: Investor Deck Link
```text
https://github.com/metathesage/arcsplit/blob/master/docs/INVESTOR_DECK.md
```

---

### Field 14: Conflict of Interest
```text
No
```
*(Explanation: Neither the applicant nor any contributing team member has any financial, employment, familial, or advisory conflict of interest with Circle or its subsidiaries.)*
