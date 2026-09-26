import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  MapPin,
  History,
  Zap,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ARC_MAINNET, ARC_TESTNET } from '../config/constants';

export function DocsSection() {
  const [activeSubTab, setActiveSubTab] = useState('about');
  const [copiedContract, setCopiedContract] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(id);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
                border: '1px solid rgba(0, 240, 255, 0.25)',
              }}
            >
              <BookOpen size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', color: 'white', letterSpacing: '-0.01em' }}>
              ArcSplit Protocol Documentation & System Manual
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '780px', lineHeight: '1.6' }}>
            Deep dive into the architecture, mathematical proofs, security audits, technical roadmap, and patch notes powering Circle's stablecoin-native L1 payment engine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href="https://github.com/metathesage/arcsplit"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 13px' }}
          >
            <span>GitHub Source</span>
            <ExternalLink size={13} />
          </a>
          <a
            href="https://docs.arc.io"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '7px 13px' }}
          >
            <span>Arc Docs</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Docs Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(5, 8, 15, 0.7)',
          backgroundImage: 'var(--dither-fine)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '26px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'about', label: 'About & Architecture', icon: Layers },
          { id: 'security', label: 'Security & Audit Report', icon: ShieldCheck },
          { id: 'roadmap', label: 'Technical Roadmap', icon: MapPin },
          { id: 'patchnotes', label: 'Patch Notes & Changelog', icon: History },
          { id: 'contracts', label: 'Verified Deployments', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#ffffff' : 'var(--text-dim)',
                background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={isActive ? '#00f0ff' : 'currentColor'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: ABOUT & ARCHITECTURE */}
      {activeSubTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Concept Banner */}
          <div
            style={{
              background: 'rgba(10, 15, 26, 0.8)',
              backgroundImage: 'var(--dither-fine)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Foundational Paradigm
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '8px' }}>
                Why Native USDC Gas Changes Everything
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                On legacy EVM chains (Ethereum, Base, Arbitrum), distributing USDC requires two separate transactions: an ERC-20 <code className="mono" style={{ color: '#00f0ff' }}>approve()</code> and a subsequent <code className="mono" style={{ color: '#00f0ff' }}>transferFrom()</code>, paid in volatile ETH.
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '8px' }}>
                On Circle's Arc L1, <strong>USDC is the native gas token</strong>. ArcSplit harnesses this architecture so payers and AI agents route digital dollars via <code className="mono" style={{ color: '#00f0ff' }}>msg.value</code> in a single, atomic, zero-approval transaction with predictable, sub-cent transaction costs.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ color: '#94a3b8', marginBottom: '8px', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)', paddingBottom: '6px' }}>
                TRANSACTION COMPLEXITY COMPARISON
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#f87171' }}>Legacy L2 (Base / Arb):</span>
                <span style={{ color: '#e2e8f0' }}>2 TXs (Approve + Split) + ETH Gas</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#00f0ff' }}>ArcSplit on Arc L1:</span>
                <span style={{ color: '#00f0ff', fontWeight: '700' }}>1 Atomic TX + USDC Gas</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Gas Currency:</span>
                <span style={{ color: '#34d399' }}>Pure Digital Dollar (USDC)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Mathematical Loss:</span>
                <span style={{ color: '#c084fc' }}>0 Wei (Remainder Conserved)</span>
              </div>
            </div>
          </div>

          {/* Mathematical Precision Section */}
          <div className="reso-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '10px' }}>
              Mathematical Conservation & Division Rounding
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Allocations in ArcSplit are expressed in <strong>basis points</strong> (where 10,000 bps = 100.00%). Each recipient receives:
            </p>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-xs)',
                margin: '12px 0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                color: '#00f0ff',
              }}
            >
              uint256 share = (msg.value * basisPoints[i]) / 10000;
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              In standard EVM integer division, truncations can leave dust wei stranded forever inside smart contracts. In ArcSplit, the contract tracks <code className="mono" style={{ color: '#00f0ff' }}>remainder = totalValue - distributedSum</code> and automatically transfers every residual wei to the primary recipient (<code className="mono">recipients[0]</code>), rigorously proving:
            </p>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: '#34d399',
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-xs)',
                display: 'inline-block',
              }}
            >
              ∑(amounts[i]) + remainder == msg.value (Conservation Guaranteed)
            </div>
          </div>

          {/* Agentic Standards Section */}
          <div className="reso-card">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', marginBottom: '10px' }}>
              Arc Agentic Economy: ERC-8004 & ERC-8183
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              ArcSplit is built from first principles to act as the autonomous financial backbone for AI Agent Swarms on Arc:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li>
                <strong style={{ color: '#ffffff' }}>ERC-8004 (Agent Identity & Reputation):</strong> Agents register autonomous cryptographic identities on Arc and link them directly to ArcSplit recipient indices.
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>ERC-8183 (Autonomous Job Escrows):</strong> Multi-agent swarms completing coordinated research, code generation, or data crawling can set ArcSplit as their escrow payout target, automatically splitting rewards among the planner, execution sub-agents, and human creators.
              </li>
            </ul>
          </div>

          {/* Arc App Kit & Circle Onramp Section */}
          <div className="reso-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>
                Arc App Kit & Circle Fiat Onramp Integration
              </h3>
              <span className="badge badge-accent">docs.arc.io/app-kit/onramp</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              ArcSplit natively integrates Circle's official <strong style={{ color: '#ffffff' }}>@circle-fin/onramp-kit</strong> and the Arc App Kit Fiat Onramp, offering frictionless digital dollar onboarding directly within the application:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '14px' }}>
                <div style={{ color: '#00f0ff', fontWeight: '600', fontSize: '0.86rem', marginBottom: '6px' }}>💳 Apple Pay, Google Pay & Debit Cards</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Allows mainstream users and corporate treasuries to purchase native Arc USDC instantly with everyday payment rails.</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '14px' }}>
                <div style={{ color: '#34d399', fontWeight: '600', fontSize: '0.86rem', marginBottom: '6px' }}>⚡ Direct Arc L1 Settlement</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Tokens settle directly to the user's Arc Mainnet address (Chain ID 5042) as native gas-ready USDC with zero bridging friction.</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '14px' }}>
                <div style={{ color: '#c084fc', fontWeight: '600', fontSize: '0.86rem', marginBottom: '6px' }}>🔒 Serverless Ephemeral Sessions</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Onramp sessions are minted via Vercel serverless functions with isolated Circle API credentials, keeping sensitive keys protected.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SECURITY & AUDIT REPORT */}
      {activeSubTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} color="#34d399" />
              <div>
                <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.96rem' }}>
                  2-Round Comprehensive Security Review: Clean & Resolved
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Evaluated against Solidity 0.8.28 MAX severity rules, OpenZeppelin guard standards, and reentrancy vectors.
                </div>
              </div>
            </div>
            <a
              href="https://github.com/metathesage/arcsplit/blob/master/docs/arcsplit-security-review.md"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.78rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            >
              <span>View Full Audit Report</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            <div className="reso-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>Defense #1</div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '2px', marginBottom: '6px' }}>ReentrancyGuard Hardening</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Both <code className="mono">splitNative</code> and <code className="mono">splitERC20</code> inherit OpenZeppelin's <code className="mono">nonReentrant</code> modifier. State checks and calculations occur strictly before external calls.
              </p>
            </div>

            <div className="reso-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>Defense #2</div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '2px', marginBottom: '6px' }}>50-Recipient Cap (DoS Prevention)</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                To prevent block gas limit exhaustion attacks, <code className="mono">MAX_RECIPIENTS = 50</code> is strictly enforced on-chain with a custom gas-efficient error <code className="mono">TooManyRecipients()</code>.
              </p>
            </div>

            <div className="reso-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>Defense #3</div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '2px', marginBottom: '6px' }}>Remainder Transfer Assertion</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Native and ERC-20 remainder transfer outcomes are explicitly checked. If the primary recipient cannot accept residual dust, the entire transaction atomically reverts.
              </p>
            </div>

            <div className="reso-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase' }}>Defense #4</div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', marginTop: '2px', marginBottom: '6px' }}>Zero Unsolicited Deposits</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                The bare <code className="mono">receive()</code> fallback was intentionally removed. Contracts or users cannot accidentally strand funds by sending plain USDC transfers without an explicit recipient split plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROADMAP & MILESTONES */}
      {activeSubTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              phase: 'Q1 2026',
              status: 'Completed / Live',
              title: 'ArcSplit V1 Core & Agentic Economy Launch',
              desc: 'Deployed on Arc Mainnet & Testnet, production Vercel dApp, instant zero-approval multi-party splits, and open-source TypeScript/Python agent SDK.',
              color: '#00f0ff',
            },
            {
              phase: 'Q2 2026',
              status: 'In Development',
              title: 'Circle Programmable Wallets & WebAuthn Passkeys',
              desc: 'Integrate Circle Developer Services to provide gasless, passkey-secured non-custodial smart contract wallets for web2 creators, podcasters, and teams.',
              color: '#34d399',
            },
            {
              phase: 'Q3 2026',
              status: 'Scheduled',
              title: 'Native Circle CCTP Cross-Chain Payout Engine',
              desc: 'Deploy native 1:1 CCTP mint/burn rails so payers can initiate splits on Ethereum or Base, with ArcSplit programmatically routing funds to recipients across any supported chain.',
              color: '#c084fc',
            },
            {
              phase: 'Q4 2026',
              status: 'Research & Architecture',
              title: 'Autonomous Escrow Oracles & Streaming Channels',
              desc: 'Release automated milestone verification hooks (ERC-8183) and real-time second-by-second streaming splits for autonomous agent swarms.',
              color: '#f59e0b',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="reso-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderLeft: `3px solid ${item.color}`,
              }}
            >
              <div style={{ minWidth: '90px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: item.color, fontWeight: '700' }}>
                  {item.phase}
                </span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {item.status}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', marginBottom: '4px' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: PATCH NOTES & CHANGELOG */}
      {activeSubTab === 'patchnotes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* v1.3.0 */}
          <div className="reso-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '3px 8px', borderRadius: 'var(--radius-xs)', background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', fontWeight: '700' }}>
                  v1.3.0
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                  Arc App Kit Fiat Onramp & Passkey Smart Accounts
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>September 2026</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><strong>Arc App Kit Onramp:</strong> Integrated Circle's official <code className="mono">@circle-fin/onramp-kit</code> for instant Apple Pay, Google Pay, and Debit Card purchase of native Arc USDC.</li>
              <li><strong>Secure Serverless Sessions:</strong> Deployed <code className="mono">/api/onramp/sessions</code> serverless function to securely mint ephemeral Arc Onramp tokens with secret isolation.</li>
              <li><strong>Passkey Smart Accounts:</strong> Added full biometric WebAuthn / Passkey account architecture for keyless biometric access to Arc L1.</li>
              <li><strong>Interactive Onramp Modal:</strong> Embedded live <code className="mono">https://onramp.arc.io</code> responsive widget with automated wallet pre-population and settlement postMessage events.</li>
            </ul>
          </div>

          {/* v1.2.0 */}
          <div className="reso-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '3px 8px', borderRadius: 'var(--radius-xs)', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', fontWeight: '700' }}>
                  v1.2.0
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                  Production Mainnet Deploy & Reso Serif Redesign
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>September 2026</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><strong>Arc Mainnet Launch:</strong> Deployed and confirmed on Arc Mainnet at <code className="mono">0x57B02Be99573B4aD4d744278821932f5b8742535</code>.</li>
              <li><strong>Wallet Disconnect Fix:</strong> Solved the EIP-1193 automatic reconnect loop by isolating manual disconnect flags in localStorage and removing cyclic hook dependencies.</li>
              <li><strong>Aesthetic Evolution:</strong> Integrated Google Fonts <em>Instrument Serif</em> and <em>Newsreader</em> with ordered Bayer dot-matrix dither textures for a retro-digital high-reso luxury aesthetic.</li>
              <li><strong>Relay.link Bridge Integration:</strong> Added multi-chain USDC ingestion modal for seamless funding from Base, Arbitrum, Ethereum, Polygon, and Solana.</li>
              <li><strong>Vercel Production Deployment:</strong> Configured SPA URL rewriting in <code className="mono">vercel.json</code> and aliased to <a href="https://arcsplit-two.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#00f0ff' }}>arcsplit-two.vercel.app</a>.</li>
            </ul>
          </div>

          {/* v1.1.0 */}
          <div className="reso-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '3px 8px', borderRadius: 'var(--radius-xs)', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontWeight: '700' }}>
                  v1.1.0
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                  Agentic Economy Standards & Shareable Permalinks
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>September 2026</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><strong>AI Agent Swarm SDK:</strong> Integrated ready-to-run TypeScript and Python code generators matching Arc's ERC-8004 and ERC-8183 standards.</li>
              <li><strong>Tip Jar Permalinks:</strong> Implemented URL query parameter parsing (<code className="mono">?split=...&memo=...</code>) allowing one-click shareable split invoices.</li>
              <li><strong>Atmosphere Canvas:</strong> Interactive procedural lightning scene with calm, storm, and supercharge modes.</li>
            </ul>
          </div>

          {/* v1.0.0 */}
          <div className="reso-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '3px 8px', borderRadius: 'var(--radius-xs)', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontWeight: '700' }}>
                  v1.0.0
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                  Genesis ArcSplit Smart Contract Architecture
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>September 2026</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              <li><strong>Core Contract:</strong> Authored <code className="mono">ArcSplit.sol</code> with <code className="mono">splitNative</code> and <code className="mono">splitERC20</code>.</li>
              <li><strong>Optimizer Setup:</strong> Compiled with Solidity 0.8.28, viaIR pipeline enabled, and 200 optimizer runs.</li>
              <li><strong>Arc Testnet Deploy:</strong> Verified on Arc Testnet (Chain ID 5042002).</li>
            </ul>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VERIFIED CONTRACTS & PARAMETERS */}
      {activeSubTab === 'contracts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mainnet Card */}
          <div className="reso-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 8px #00f0ff' }}></div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>Arc Mainnet (Production)</h3>
              </div>
              <a
                href={`${ARC_MAINNET.explorerUrl}/address/${ARC_MAINNET.defaultContract}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.76rem', padding: '5px 12px' }}
              >
                <span>Open in Arc Explorer</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>CHAIN ID</div>
                <div className="mono" style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700' }}>{ARC_MAINNET.chainId} ({ARC_MAINNET.chainIdHex})</div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>RPC ENDPOINT</div>
                <div className="mono" style={{ fontSize: '0.84rem', color: '#00f0ff' }}>{ARC_MAINNET.rpcUrl}</div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>GAS TOKEN</div>
                <div className="mono" style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: '700' }}>Native USDC (18 Decimals)</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(0, 240, 255, 0.25)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginRight: '8px' }}>Contract:</span>
                <span className="mono" style={{ fontSize: '0.84rem', color: '#ffffff', wordBreak: 'break-all' }}>{ARC_MAINNET.defaultContract}</span>
              </div>
              <button
                onClick={() => copyToClipboard(ARC_MAINNET.defaultContract, 'mainnet')}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 8px', marginLeft: '10px' }}
              >
                {copiedContract === 'mainnet' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedContract === 'mainnet' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Testnet Card */}
          <div className="reso-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>Arc Testnet</h3>
              </div>
              <a
                href={`${ARC_TESTNET.explorerUrl}/address/${ARC_TESTNET.defaultContract}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '0.76rem', padding: '5px 12px' }}
              >
                <span>Open in Testnet Explorer</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>CHAIN ID</div>
                <div className="mono" style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700' }}>{ARC_TESTNET.chainId} ({ARC_TESTNET.chainIdHex})</div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>RPC ENDPOINT</div>
                <div className="mono" style={{ fontSize: '0.84rem', color: '#f59e0b' }}>{ARC_TESTNET.rpcUrl}</div>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>GAS TOKEN</div>
                <div className="mono" style={{ fontSize: '0.88rem', color: '#f59e0b', fontWeight: '700' }}>Testnet USDC</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginRight: '8px' }}>Contract:</span>
                <span className="mono" style={{ fontSize: '0.84rem', color: '#ffffff', wordBreak: 'break-all' }}>{ARC_TESTNET.defaultContract}</span>
              </div>
              <button
                onClick={() => copyToClipboard(ARC_TESTNET.defaultContract, 'testnet')}
                className="btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 8px', marginLeft: '10px' }}
              >
                {copiedContract === 'testnet' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedContract === 'testnet' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
