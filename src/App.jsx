import React, { useState, useEffect } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { Header } from './components/Header';
import { SplitBuilder } from './components/SplitBuilder';
import { TipJarGenerator } from './components/TipJarGenerator';
import { ContractDeployer } from './components/ContractDeployer';
import { AgenticSplitter } from './components/AgenticSplitter';
import { DocsSection } from './components/DocsSection';
import { AccountSection } from './components/AccountSection';
import { SuccessModal } from './components/SuccessModal';
import { LightningCanvas } from './components/LightningCanvas';
import { RelayBridgeModal } from './components/RelayBridgeModal';
import { OnrampModal } from './components/OnrampModal';
import { Sliders, Share2, Rocket, FileText, Heart, Zap, Bot, ExternalLink, ArrowLeftRight, BookOpen, User } from 'lucide-react';
import { DEMO_RECIPIENTS } from './config/constants';

export function App() {
  const web3 = useWeb3();

  const [activeTab, setActiveTab] = useState('split');
  const [successData, setSuccessData] = useState(null);
  const [lightningIntensity, setLightningIntensity] = useState('storm');
  const [isRelayOpen, setIsRelayOpen] = useState(false);
  const [isOnrampOpen, setIsOnrampOpen] = useState(false);

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

  const handleLoadAddressBookToSplitter = (recipients) => {
    setActiveRecipients(recipients);
    setActiveMemo('Address Book Batch Split');
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
          arcBalance={web3.arcBalance}
          isConnecting={web3.isConnecting}
          isSwitchingNetwork={web3.isSwitchingNetwork}
          isArc={web3.isArc}
          targetNetwork={web3.targetNetwork}
          connectWallet={web3.connectWallet}
          disconnectWallet={web3.disconnectWallet}
          switchNetwork={web3.switchNetwork}
          toggleTargetNetwork={web3.toggleTargetNetwork}
          openRelayBridge={() => setIsRelayOpen(true)}
          openOnrampModal={() => setIsOnrampOpen(true)}
          onNavigateAccount={() => setActiveTab('account')}
          activeTab={activeTab}
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

        {/* Reso Dithered Hero Section */}
        <div
          className="glass-panel"
          style={{
            padding: '30px',
            marginBottom: '26px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '26px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(0, 240, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f0ff',
                }}
              >
                <Zap size={13} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: '600', color: '#00f0ff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Electric Financial Rails • Arc L1
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.3rem',
                fontWeight: '400',
                lineHeight: '1.12',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
                color: '#ffffff',
              }}
            >
              High-Voltage USDC Splits for <span className="serif-italic" style={{ color: '#00f0ff' }}>Humans</span> & <span className="serif-italic" style={{ color: '#c084fc' }}>AI Agents</span>.
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
              Engineered for Arc's Agentic Economy (ERC-8004 / ERC-8183). Route native USDC payouts across autonomous AI swarms and human teams with sub-second finality.
            </p>

            {/* Reso Atmosphere Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '18px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atmosphere:</span>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'rgba(5, 8, 15, 0.7)',
                  backgroundImage: 'var(--dither-fine)',
                  padding: '2px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {['calm', 'storm', 'supercharge'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLightningIntensity(lvl)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: lightningIntensity === lvl ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: lightningIntensity === lvl ? '#ffffff' : 'var(--text-dim)',
                      border: lightningIntensity === lvl ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reso Dithered Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div
              style={{
                background: 'rgba(10, 14, 24, 0.8)',
                backgroundImage: 'var(--dither-fine)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gas Token</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#00f0ff', marginTop: '1px' }}>Native USDC</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero approvals needed</div>
            </div>
            <div
              style={{
                background: 'rgba(10, 14, 24, 0.8)',
                backgroundImage: 'var(--dither-fine)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agent Standard</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#10b981', marginTop: '1px' }}>ERC-8004 / 8183</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Autonomous job splits</div>
            </div>
            <div
              style={{
                background: 'rgba(10, 14, 24, 0.8)',
                backgroundImage: 'var(--dither-fine)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Execution</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#38bdf8', marginTop: '1px' }}>Sub-Second</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Guarded non-custodial</div>
            </div>
            <div
              style={{
                background: 'rgba(10, 14, 24, 0.8)',
                backgroundImage: 'var(--dither-fine)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Architect</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#c084fc', marginTop: '1px' }}>@metathesage</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arc Network ecosystem</div>
            </div>
          </div>
        </div>

        {/* Streamlined Reso Navigation Tabs */}
        <nav className="tabs-nav">
          <button
            onClick={() => setActiveTab('split')}
            className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
          >
            <Sliders size={15} />
            <span>Splitter</span>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
          >
            <Bot size={15} />
            <span>AI Swarms</span>
          </button>
          <button
            onClick={() => setActiveTab('tipjar')}
            className={`tab-btn ${activeTab === 'tipjar' ? 'active' : ''}`}
          >
            <Share2 size={15} />
            <span>Permalinks</span>
          </button>
          <button
            onClick={() => setActiveTab('deployer')}
            className={`tab-btn ${activeTab === 'deployer' ? 'active' : ''}`}
          >
            <Rocket size={15} />
            <span>Deploy</span>
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`tab-btn ${activeTab === 'bridge' ? 'active' : ''}`}
          >
            <ArrowLeftRight size={15} />
            <span>Bridge</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
          >
            <BookOpen size={15} />
            <span>Docs</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          >
            <User size={15} />
            <span>Account</span>
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
              openOnrampModal={() => setIsOnrampOpen(true)}
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
              balance={web3.balance}
              arcBalance={web3.arcBalance}
              isSwitchingNetwork={web3.isSwitchingNetwork}
              reloadBalance={web3.reloadBalance}
              openRelayBridge={() => setIsRelayOpen(true)}
            />
          )}

          {activeTab === 'bridge' && (
            <RelayBridgeModal
              isOpen={true}
              isFullView={true}
              account={web3.account}
              targetNetwork={web3.targetNetwork}
              onSuccessRefresh={web3.reloadBalance}
            />
          )}

          {activeTab === 'docs' && (
            <DocsSection onNavigateSplit={() => setActiveTab('split')} />
          )}

          {activeTab === 'account' && (
            <AccountSection
              account={web3.account}
              balance={web3.balance}
              arcBalance={web3.arcBalance}
              isArc={web3.isArc}
              targetNetwork={web3.targetNetwork}
              connectWallet={web3.connectWallet}
              onLoadRecipientsToSplitter={handleLoadAddressBookToSplitter}
              openOnrampModal={() => setIsOnrampOpen(true)}
            />
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
            <a href="https://docs.arc.io/app-kit/onramp" target="_blank" rel="noreferrer" style={{ color: '#00f0ff' }}>
              Arc App Kit Onramp
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

        {/* Relay.link Bridge & Swap Modal */}
        <RelayBridgeModal
          isOpen={isRelayOpen}
          onClose={() => setIsRelayOpen(false)}
          account={web3.account}
          targetNetwork={web3.targetNetwork}
          onSuccessRefresh={web3.reloadBalance}
        />

        {/* Arc App Kit Onramp Modal (Buy with Card / Apple Pay) */}
        <OnrampModal
          isOpen={isOnrampOpen}
          onClose={() => setIsOnrampOpen(false)}
          account={web3.account}
          targetNetwork={web3.targetNetwork}
          onSuccessRefresh={web3.reloadBalance}
        />
      </div>
    </>
  );
}

export default App;
