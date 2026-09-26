# ArcSplit — Circle Grant Technical Video Walkthrough Script
**Target Duration:** 3:30 - 4:45 minutes  
**Live Application:** [https://arcsplit-two.vercel.app](https://arcsplit-two.vercel.app)  
**GitHub Repository:** [https://github.com/metathesage/arcsplit](https://github.com/metathesage/arcsplit)  

---

### [0:00 - 0:45] Introduction & Circle Alignment
> *"Hello Circle Grant Committee, my name is Sage (@metathesage), and today I am excited to present ArcSplit: the programmable, non-custodial multi-party USDC payment rail built specifically for Circle's Arc Network.*
>
> *On legacy blockchains like Ethereum, Arbitrum, or Base, splitting revenue across multiple recipients is cumbersome. Payers must hold volatile gas tokens like ETH, submit an ERC-20 `approve()` transaction, and pay duplicate fees.*
>
> *Arc changes this fundamentally because USDC is the native gas token. ArcSplit harnesses this architecture to deliver atomic, single-hop payment splits with zero token approval transactions, sub-second finality, and sub-cent fees. Today we will walk through the smart contract code, inspect our live deployments, and demonstrate the production dApp."*

---

### [0:45 - 2:00] Part 1: Codebase Walkthrough

*(Screen shows VS Code with `contracts/ArcSplit.sol`)*

> *"Let's look at `contracts/ArcSplit.sol`. Here, in the `splitNative()` function, you can see how Arc's native USDC gas model changes the developer experience.*
>
> *Instead of transferring ERC-20 tokens with prior allowances, the function receives native USDC directly via `msg.value`. It verifies that the recipient addresses are valid, checks that the basis points sum to exactly 10,000—which represents 100.00%—and performs direct, low-level calls to forward funds to all recipients in a single atomic transaction.*
>
> *Notice our mathematical precision guarantee: any fractional remainder resulting from integer division is automatically forwarded to the primary recipient, guaranteeing zero trapped wei.*
>
> *Next, opening `src/config/constants.js`, we can see our live deployed contracts:*
> - *Arc Mainnet (Chain ID 5042) at `0x57B02Be99573B4aD4d744278821932f5b8742535`*
> - *Arc Testnet (Chain ID 5042002) at `0x3B31124377078eE939786e2765e1820Ad2C96399`*
>
> *Both contracts are verified and confirmed on the Arc Block Explorer."*

---

### [2:00 - 3:30] Part 2: Live Integration Demonstration

*(Screen switches to browser showing `https://arcsplit-two.vercel.app`)*

> *"Now let's switch to the live dApp at `arcsplit-two.vercel.app`. Notice our high-resolution, retro-digital aesthetic with editorial serif typography.*
>
> *1. **Wallet Connection & Balance**: We connect via MetaMask or Coinbase Wallet. The header immediately queries our native USDC balance on Arc Mainnet. Notice the dedicated network switcher and our responsive Exit button.*
>
> *2. **Instant Splitter**: In the Splitter tab, we can enter any amount of native USDC—for example, 10 USDC—and distribute it among co-creators or team members using presets like 50/50, 70/30, or custom percentages. Clicking 'Execute Split' triggers a single transaction with no prior ERC-20 approve step.*
>
> *3. **Payment Permalinks**: In the Permalinks tab, any user can generate a permanent tip jar link. For example, by encoding `?split=...`, anyone who opens the URL can split a payment to the pre-configured wallets with one click.*
>
> *4. **AI Swarms & Agentic Economy**: In the AI Swarms tab, we provide developers with ready-to-use TypeScript and Python SDK snippets tailored for Arc's ERC-8004 Agent Identity and ERC-8183 Job Escrow standards, allowing autonomous agent swarms to execute recurring bounty splits programmatically.*
>
> *5. **Cross-Chain Ingestion**: With our integrated Relay modal, users from Base, Arbitrum, Ethereum, Polygon, or Solana can convert their assets into Arc USDC in seconds."*

---

### [3:30 - 4:15] Part 3: Planned Circle Integrations & Roadmap

*(Screen shows the technical roadmap and architecture diagram)*

> *"With this grant, we are expanding our Circle product integrations:*
> 1. *First, **Circle Programmable Wallets**: We will integrate Circle's user-controlled wallet SDK so web2 creators can generate non-custodial wallets using simple passkeys and social logins, backed by automated USDC gas sponsorship.*
> 2. *Second, **Circle CCTP**: We will integrate native Cross-Chain Transfer Protocol rails directly into our split engine, allowing cross-chain disbursements where a payer sends USDC on Base or Ethereum, and ArcSplit programmatically mints and distributes funds natively on Arc with zero slippage.*
> 3. *Third, **Circle Gateway**: Unified balance routing for high-frequency AI agent payouts.*
>
> *Thank you for your time and consideration. We look forward to building the future of programmable digital dollar payouts on Arc with Circle!"*
