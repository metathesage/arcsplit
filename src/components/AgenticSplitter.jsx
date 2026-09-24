import React, { useState } from 'react';
import { Bot, Cpu, Sparkles, ArrowRight, ExternalLink, Code2, ShieldCheck, CheckCircle2, Copy, Check, Zap } from 'lucide-react';

const AGENT_PRESETS = [
  {
    title: 'Autonomous Swarm',
    tagline: 'Split earnings between primary LLM agent, data retrieval worker, and operator treasury',
    recipients: [
      { address: '0x8004A818BFB912233c491871b3d84c89A494BD9e', share: 45, label: '🤖 Core Planner Agent (ERC-8004)' },
      { address: '0x8004B663056A597Dffe9eCcC1965A193B7388713', share: 30, label: '⚡ Execution Sub-Agent' },
      { address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', share: 25, label: '🏛️ Human Treasury / Creator' },
    ],
    memo: 'ERC-8004 Swarm Coordination Payout',
  },
  {
    title: 'ERC-8183 Job Bounty Split',
    tagline: 'Automated milestone distribution: task worker agent, validator oracle, and platform fee',
    recipients: [
      { address: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272', share: 70, label: '🛠️ Worker Agent' },
      { address: '0x8004B663056A597Dffe9eCcC1965A193B7388713', share: 20, label: '🔍 Verification Oracle' },
      { address: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', share: 10, label: '🌐 Protocol Network Fee' },
    ],
    memo: 'ERC-8183 Job Milestone Settlement',
  },
  {
    title: 'Creator & AI Co-Pilot',
    tagline: 'Human author splitting revenue with autonomous agent compute reserve on Arc',
    recipients: [
      { address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', share: 65, label: '👤 Human Creator' },
      { address: '0x8004A818BFB912233c491871b3d84c89A494BD9e', share: 35, label: '🤖 Agent Compute Reserve' },
    ],
    memo: 'Co-Pilot Creative Revenue Share',
  },
];

export function AgenticSplitter({ onLoadPreset }) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeLang, setCodeLang] = useState('ts');

  const activePreset = AGENT_PRESETS[selectedPresetIndex];

  const tsCode = `// Autonomous Agent payout execution on Arc Network
import { ethers } from 'ethers';
import ArcSplitABI from './ArcSplit.json';

const provider = new ethers.JsonRpcProvider('https://rpc.mainnet.arc.io');
const agentWallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY!, provider);

const splitter = new ethers.Contract('0x8A14c33076e0c651F10705E3f757270275C68b81', ArcSplitABI, agentWallet);

async function distributeAgentRevenue() {
  const recipients = [
    '${activePreset.recipients[0].address}',
    '${activePreset.recipients[1].address}'
  ];
  const basisPoints = [${activePreset.recipients[0].share * 100}, ${activePreset.recipients[1].share * 100}]; // 100.00%
  const memo = '${activePreset.memo}';

  // Arc native USDC gas makes this single-hop with zero token approval transactions!
  const tx = await splitter.splitNative(recipients, basisPoints, memo, {
    value: ethers.parseEther('25.0') // 25 native USDC
  });
  console.log('⚡ Agent split broadcast on Arc:', tx.hash);
  await tx.wait();
}

distributeAgentRevenue();`;

  const pyCode = `# Autonomous Agent payout execution on Arc Network (Python)
from web3 import Web3
import json, os

w3 = Web3(Web3.HTTPProvider('https://rpc.mainnet.arc.io'))
account = w3.eth.account.from_key(os.getenv('AGENT_PRIVATE_KEY'))

splitter = w3.eth.contract(
    address='0x8A14c33076e0c651F10705E3f757270275C68b81',
    abi=arc_split_abi
)

recipients = ['${activePreset.recipients[0].address}', '${activePreset.recipients[1].address}']
basis_points = [${activePreset.recipients[0].share * 100}, ${activePreset.recipients[1].share * 100}]

tx = splitter.functions.splitNative(
    recipients,
    basis_points,
    '${activePreset.memo}'
).build_transaction({
    'from': account.address,
    'value': w3.to_wei(25, 'ether'), # Native USDC on Arc L1
    'nonce': w3.eth.get_transaction_count(account.address),
})

signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"⚡ Agent split transaction sent: {tx_hash.hex()}")`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeLang === 'ts' ? tsCode : pyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Bot size={24} color="#00f0ff" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>
              Arc Agentic Economy & Autonomous Payouts
            </h2>
            <span className="tag-badge" style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.35)' }}>
              ERC-8004 & ERC-8183
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '700px' }}>
            Arc is engineered for autonomous AI agents to contract, coordinate, and settle value in real time. ArcSplit serves as the high-velocity revenue distribution rail between AI agent swarms, tool providers, and human supervisors.
          </p>
        </div>

        <a
          href="https://docs.arc.io/build/agentic-economy"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <span>Arc Agentic Docs</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Swarm Visualizer Diagram */}
      <div
        style={{
          background: 'rgba(5, 8, 18, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
          ⚡ Autonomous Value Flow on Arc L1
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Step 1: Client/Job */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🎯</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'white' }}>ERC-8183 Job</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Task Completed</div>
          </div>

          <div style={{ textAlign: 'center', color: '#00f0ff' }}>
            <ArrowRight size={20} style={{ margin: '0 auto' }} />
          </div>

          {/* Step 2: Agent Swarm */}
          <div style={{ background: 'rgba(0, 240, 255, 0.08)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.35)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🤖</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#00f0ff' }}>ERC-8004 Agent</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Circle Agent Wallet</div>
          </div>

          <div style={{ textAlign: 'center', color: '#00f0ff' }}>
            <ArrowRight size={20} style={{ margin: '0 auto' }} />
          </div>

          {/* Step 3: ArcSplit Router */}
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.4)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⚡</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#c084fc' }}>ArcSplit Router</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Atomic Pass-Through</div>
          </div>

          <div style={{ textAlign: 'center', color: '#00f0ff' }}>
            <ArrowRight size={20} style={{ margin: '0 auto' }} />
          </div>

          {/* Step 4: Multi-Wallet Payout */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.35)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💰</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#34d399' }}>Settled USDC</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sub-second finality</div>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Select Agentic Archetype Preset:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {AGENT_PRESETS.map((preset, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPresetIndex(idx)}
                style={{
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid #00f0ff' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: '800', color: isSelected ? '#00f0ff' : 'white' }}>
                    {preset.title}
                  </span>
                  {isSelected && <CheckCircle2 size={16} color="#00f0ff" />}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {preset.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown of Selected Archetype */}
      <div
        style={{
          background: 'rgba(8, 14, 28, 0.8)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'white' }}>
            {activePreset.title} — Split Distribution Breakdown:
          </span>
          <button
            onClick={() => onLoadPreset(activePreset)}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <span>Load into Splitter</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activePreset.recipients.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ fontWeight: '600', color: '#f8fafc' }}>{r.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {r.address.slice(0, 6)}...{r.address.slice(-4)}
                </span>
                <span style={{ fontWeight: '800', color: '#00f0ff' }}>{r.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Programmatic Agent Code Snippet */}
      <div
        style={{
          background: 'rgba(5, 8, 16, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} color="#00f0ff" />
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'white' }}>
              Autonomous Agent Integration Script
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
              <button
                onClick={() => setCodeLang('ts')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: codeLang === 'ts' ? '#00f0ff' : 'var(--text-dim)',
                  background: codeLang === 'ts' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                }}
              >
                TypeScript
              </button>
              <button
                onClick={() => setCodeLang('py')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: codeLang === 'py' ? '#00f0ff' : 'var(--text-dim)',
                  background: codeLang === 'py' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                }}
              >
                Python
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <pre
          className="mono"
          style={{
            fontSize: '0.78rem',
            color: '#93c5fd',
            overflowX: 'auto',
            padding: '12px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 'var(--radius-sm)',
            lineHeight: '1.5',
          }}
        >
          {codeLang === 'ts' ? tsCode : pyCode}
        </pre>
      </div>
    </div>
  );
}
