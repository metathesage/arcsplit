import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { Header } from './components/Header';
import { SplitBuilder } from './components/SplitBuilder';
import { TipJarGenerator } from './components/TipJarGenerator';
import { ContractDeployer } from './components/ContractDeployer';
import { AgenticSplitter } from './components/AgenticSplitter';
import { SuccessModal } from './components/SuccessModal';
import { LightningCanvas } from './components/LightningCanvas';
import { Sliders, Share2, Rocket, FileText, Heart, Zap, Bot, ExternalLink } from 'lucide-react';
import { DEMO_RECIPIENTS } from './config/constants';

export function App() {
  const web3 = useWeb3();

  const [activeTab, setActiveTab] = useState('split');
  const [successData, setSuccessData] = useState(null);
  const [lightningIntensity, setLightningIntensity] = useState('storm');

  // Incoming payment link query state
  const [incomingSplit, setIncomingSplit] = useState(null);
  const [activeMemo, setActiveMemo] = useState('High-Voltage Arc USDC Payment');
  const [activeRecipients, setActiveRecipients] = useState(DEMO_RECIPIENTS);

  // Check URL parameters for shareable split link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const splitParam = params.get('split');
      const memoParam = params.get('memo');

      if (splitParam) {
        const parsedRecipients = splitParam.split(';').map((entry, idx) => {
          const [addr, share, label] = entry.split(':');
          return {
            address: addr || '',
            share: Number(share) || 0,
            label: label ? decodeURIComponent(label) : `Recipient ${idx + 1}`,
          };
        });

        if (parsedRecipients.length > 0) {
          setIncomingSplit({
            recipients: parsedRecipients,
            memo: memoParam || 'Project Payment',
          });
          setActiveRecipients(parsedRecipients);
          if (memoParam) setActiveMemo(memoParam);
        }
      }
    } catch (err) {
      console.error('Error parsing query params:', err);
    }
  }, []);

  const handleGenerateTipJar = ({ recipients, memo }) => {
    setActiveRecipients(recipients);
    setActiveMemo(memo);
    setActiveTab('tipjar');
  };

  const handleLoadAgentPreset = (preset) => {
    setActiveRecipients(preset.recipients);
    setActiveMemo(preset.memo);
    setActiveTab('split');
  };

  return (
    <>
      {/* Background Interactive Lightning Storm Scene */}
      <LightningCanvas intensity={lightningIntensity} />

      <div className="app-container">
        {/* Header with @metathesage credits */}
        <Header
          account={web3.account}
          chainId={web3.chainId}
          balance={web3.balance}
          isConnecting={web3.isConnecting}
          isArc={web3.isArc}
          targetNetwork={web3.targetNetwork}
          connectWallet={web3.connectWallet}
          disconnectWallet={web3.disconnectWallet}
          switchNetwork={web3.switchNetwork}
          toggleTargetNetwork={web3.toggleTargetNetwork}
        />

        {/* Incoming Shareable Link Banner (if loaded with ?split=) */}
        {incomingSplit && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(121, 40, 202, 0.18) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#030712',
                }}
              >
                <Heart size={20} fill="#030712" />
              </div>
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: 'white' }}>
                  Pre-Configured Split: "{incomingSplit.memo}"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {incomingSplit.recipients.length} recipients locked in. Enter total USDC amount below to execute.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIncomingSplit(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Clear / Reset
            </button>
          </div>
        )}

        {/* High-Voltage Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(10, 16, 32, 0.75) 50%, rgba(121, 40, 202, 0.08) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            boxShadow: '0 0 35px rgba(0, 240, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap size={18} color="#00f0ff" />
              <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Electric Financial Rails • Arc L1
              </span>
            </div>
            <h2
              className="electric-glow"
              style={{
                fontSize: '1.65rem',
                fontWeight: '900',
                color: 'white',
                lineHeight: '1.25',
                marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}
            >
              High-Voltage USDC Splits for Humans & AI Agents.
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Built for Arc’s Agentic Economy (ERC-8004 / ERC-8183). Route native USDC payouts across AI swarms and human teams with sub-second finality and sub-cent fees.
            </p>

            {/* Storm Intensity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600' }}>⚡ Lightning Scene:</span>
              {['calm', 'storm', 'supercharge'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLightningIntensity(lvl)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    background: lightningIntensity === lvl ? 'rgba(0, 240, 255, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    border: lightningIntensity === lvl ? '1px solid #00f0ff' : '1px solid var(--border-subtle)',
                    color: lightningIntensity === lvl ? '#00f0ff' : 'var(--text-muted)',
                    boxShadow: lightningIntensity === lvl ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(8, 14, 28, 0.85)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gas Token</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#00f0ff' }}>Native USDC</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero approvals needed</div>
            </div>
            <div style={{ background: 'rgba(8, 14, 28, 0.85)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Agent Standards</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981' }}>ERC-8004 / 8183</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Autonomous job splits</div>
            </div>
            <div style={{ background: 'rgba(8, 14, 28, 0.85)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Security</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38bdf8' }}>Audited & Guarded</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>OpenZeppelin ReentrancyGuard</div>
            </div>
            <div style={{ background: 'rgba(8, 14, 28, 0.85)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Built By</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#a855f7' }}>@metathesage</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arc Network ecosystem</div>
            </div>
          </div>
        </div>

        {/* Pill Navigation Tabs */}
        <nav className="tabs-nav">
          <button
            onClick={() => setActiveTab('split')}
            className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
          >
            <Sliders size={16} />
            <span>Instant Split</span>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
          >
            <Bot size={16} />
            <span>Agentic Economy</span>
          </button>
          <button
            onClick={() => setActiveTab('tipjar')}
            className={`tab-btn ${activeTab === 'tipjar' ? 'active' : ''}`}
          >
            <Share2 size={16} />
            <span>Payment Permalinks</span>
          </button>
          <button
            onClick={() => setActiveTab('deployer')}
            className={`tab-btn ${activeTab === 'deployer' ? 'active' : ''}`}
          >
            <Rocket size={16} />
            <span>Contract Deployer</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
          >
            <FileText size={16} />
            <span>Protocol Specs</span>
          </button>
        </nav>

        {/* Main Tab Content */}
        <main>
          {activeTab === 'split' && (
            <SplitBuilder
              account={web3.account}
              isArc={web3.isArc}
              targetNetwork={web3.targetNetwork}
              connectWallet={web3.connectWallet}
              switchNetwork={web3.switchNetwork}
              executeSplit={web3.executeSplit}
              onPaymentSuccess={(data) => setSuccessData(data)}
              onGenerateTipJar={handleGenerateTipJar}
              onNavigateDeployer={() => setActiveTab('deployer')}
            />
          )}

          {activeTab === 'agent' && (
            <AgenticSplitter onLoadPreset={handleLoadAgentPreset} />
          )}

          {activeTab === 'tipjar' && (
            <TipJarGenerator
              currentRecipients={activeRecipients}
              currentMemo={activeMemo}
            />
          )}

          {activeTab === 'deployer' && (
            <ContractDeployer
              account={web3.account}
              isArc={web3.isArc}
              targetNetwork={web3.targetNetwork}
              deployedContractAddress={web3.deployedContractAddress}
              setCustomContract={web3.setCustomContract}
              resetContract={web3.resetContract}
              deployFreshContract={web3.deployFreshContract}
              connectWallet={web3.connectWallet}
              switchNetwork={web3.switchNetwork}
            />
          )}

          {activeTab === 'docs' && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Zap size={24} color="#00f0ff" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
                  ArcSplit Protocol Specification & High-Voltage Architecture
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.02rem', fontWeight: '700', marginBottom: '6px' }}>
                    1. The Power of Native USDC Gas
                  </h3>
                  <p>
                    Arc is Circle's stablecoin-native Layer-1 designed specifically for programmable digital dollar finance. Unlike standard EVM rollups or L1s where users must hold volatile gas tokens (ETH/SOL/MATIC) and submit two transactions (approve + transfer), Arc transactions are paid directly in native USDC. ArcSplit takes full advantage of this to deliver zero-approval, single-click payouts.
                  </p>
                </div>

                <div>
                  <h3 style={{ color: 'white', fontSize: '1.02rem', fontWeight: '700', marginBottom: '6px' }}>
                    2. Mathematical Precision & Safety
                  </h3>
                  <p>
                    Allocations are defined in basis points (10,000 bps = 100.00%). Each recipient receives <code className="mono" style={{ color: '#00f0ff' }}>(msg.value * basisPoints[i]) / 10000</code>. Any fractional integer remainder from integer division is automatically forwarded to the primary recipient, guaranteeing zero locked wei.
                  </p>
                </div>

                <div>
                  <h3 style={{ color: 'white', fontSize: '1.02rem', fontWeight: '700', marginBottom: '6px' }}>
                    3. Agentic Economy Compatibility
                  </h3>
                  <p>
                    ArcSplit natively integrates with Arc’s <strong>ERC-8004</strong> (Agent Identity & Reputation) and <strong>ERC-8183</strong> (Job Escrows), enabling AI agents to programmatically distribute bounties and API fees.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <a
                    href="https://docs.arc.io/build/agentic-economy"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <span>Read Arc Agentic Economy Docs</span>
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://x.com/metathesage"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <span>Follow @metathesage</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer with @metathesage branding */}
        <footer style={{ marginTop: '55px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            <Zap size={18} color="#00f0ff" />
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>
              ArcSplit
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Built by{' '}
              <a
                href="https://x.com/metathesage"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#00f0ff',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                @metathesage
              </a>{' '}
              for the Arc Network Ecosystem
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            <a href="https://docs.arc.io/build/agentic-economy" target="_blank" rel="noreferrer" style={{ color: '#00f0ff' }}>
              Arc Agentic Economy
            </a>
            <span>•</span>
            <a href="https://explorer.arc.io" target="_blank" rel="noreferrer" style={{ color: '#00f0ff' }}>
              Arc Explorer
            </a>
            <span>•</span>
            <a href="https://arc.io" target="_blank" rel="noreferrer" style={{ color: '#00f0ff' }}>
              Arc Network
            </a>
            <span>•</span>
            <span>USDC Native Gas Rails</span>
          </div>
        </footer>

        {/* Success Modal */}
        <SuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          data={successData}
        />
      </div>
    </>
  );
}

export default App;
