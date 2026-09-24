import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { Header } from './components/Header';
import { SplitBuilder } from './components/SplitBuilder';
import { TipJarGenerator } from './components/TipJarGenerator';
import { ContractDeployer } from './components/ContractDeployer';
import { MicrograntChecklistModal } from './components/MicrograntChecklistModal';
import { SuccessModal } from './components/SuccessModal';
import { Sliders, Share2, Rocket, FileText, Heart, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { DEMO_RECIPIENTS } from './config/constants';

export function App() {
  const web3 = useWeb3();

  const [activeTab, setActiveTab] = useState('split');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Incoming payment link query state
  const [incomingSplit, setIncomingSplit] = useState(null);
  const [activeMemo, setActiveMemo] = useState('Arc Network Grant / Collaborative Sprint');
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
            memo: memoParam || 'Project Tip Jar',
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

  return (
    <div className="app-container">
      {/* Header */}
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
        onOpenGrantModal={() => setIsGrantModalOpen(true)}
      />

      {/* Incoming Shareable Link Banner (if loaded with ?split=) */}
      {incomingSplit && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Heart size={20} fill="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>
                You are paying a pre-configured split: "{incomingSplit.memo}"
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {incomingSplit.recipients.length} recipients configured. Enter your USDC amount below to execute.
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
            Clear / New Split
          </button>
        </div>
      )}

      {/* Hero Value Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(13, 18, 29, 0.6) 100%)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={18} color="#0ea5e9" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Built for Arc Network
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', lineHeight: '1.3', marginBottom: '8px' }}>
            Native USDC Splits. Sub-Cent Gas. Zero Wrapping.
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Arc is Circle's stablecoin-native Layer-1 where USDC powers transaction fees. ArcSplit eliminates approval txs, paying out multiple parties in a single atomic hop.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Zero Approvals</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>Direct Native USDC</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Precision Splitting</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981' }}>100.00% Basis Points</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Non-Custodial</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8' }}>Instant Pass-Through</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Grant Deadline</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fbbf24' }}>Oct 14, 2026</div>
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
          onClick={() => setActiveTab('tipjar')}
          className={`tab-btn ${activeTab === 'tipjar' ? 'active' : ''}`}
        >
          <Share2 size={16} />
          <span>Creator Tip Jar</span>
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
          <span>Architecture & Docs</span>
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
          />
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              ArcSplit Technical Specification & Architecture
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                  1. Stablecoin-Native Execution
                </h3>
                <p>
                  Arc is Circle's L1 designed around digital dollar rails. By utilizing USDC as its native gas currency, transactions do not require secondary gas token swapping (no ETH required) or standard ERC-20 approve/transferFrom steps for payments.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                  2. ArcSplit.sol Contract Safety
                </h3>
                <p>
                  The contract is stateless and non-custodial. Funds are not held in custody; they are distributed directly in the same execution frame using <code className="mono" style={{ color: '#38bdf8' }}>call&#123;value: amount&#125;("")</code> to each recipient. Remainder fractions are safely routed to avoid stuck capital.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                  3. Network Parameters for Arc
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="mono" style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                    Network: Arc Mainnet<br />
                    Chain ID: 5042 (0x13b2)<br />
                    RPC: https://rpc.mainnet.arc.io<br />
                    Currency: USDC<br />
                    Explorer: https://explorer.arc.io
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setIsGrantModalOpen(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  View $500 Microgrant Form Kit
                </button>
                <a
                  href="https://www.arc.io/app-kits"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Arc App Kits Documentation</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '50px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
          ArcSplit — Built for the Arc Network Microgrants Program ($500 USDC | Deadline Oct 14, 2026)
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <a href="https://www.arc.io/app-kits" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>
            Arc App Kits
          </a>
          <span>•</span>
          <a href="https://explorer.arc.io" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>
            Arc Explorer
          </a>
          <span>•</span>
          <span style={{ color: 'var(--text-dim)' }}>Native USDC Gas</span>
        </div>
      </footer>

      {/* Modals */}
      <MicrograntChecklistModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        activeContract={web3.deployedContractAddress}
      />

      <SuccessModal
        isOpen={!!successData}
        onClose={() => setSuccessData(null)}
        data={successData}
      />
    </div>
  );
}

export default App;
