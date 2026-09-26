import React from 'react';
import { Wallet, PlusCircle, CheckCircle, AlertTriangle, Zap, ExternalLink, ArrowLeftRight, LogOut, User } from 'lucide-react';

const KNOWN_CHAINS = {
  1: 'Ethereum',
  5042: 'Arc Mainnet',
  5042002: 'Arc Testnet',
  8453: 'Base',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
  11155111: 'Sepolia',
};

export function Header({
  account,
  chainId,
  balance,
  arcBalance = '0.00',
  isConnecting,
  isSwitchingNetwork,
  isArc,
  targetNetwork,
  connectWallet,
  disconnectWallet,
  switchNetwork,
  toggleTargetNetwork,
  openRelayBridge,
  onNavigateAccount,
  activeTab,
}) {
  const isTestnet = targetNetwork.chainId === 5042002;
  const currentChainName = KNOWN_CHAINS[chainId] || (chainId ? `Chain ${chainId}` : 'Unknown Chain');

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand / Logo with Editorial Serif Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0b1220 0%, #03060d 100%)',
              backgroundImage: 'var(--dither-fine)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
              color: '#00f0ff',
            }}
          >
            <Zap size={22} fill="#00f0ff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.9rem',
                  fontWeight: '400',
                  letterSpacing: '-0.01em',
                  color: '#ffffff',
                  lineHeight: '1.1',
                }}
              >
                ArcSplit
              </h1>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.05em',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: '#00f0ff',
                  textTransform: 'uppercase',
                }}
              >
                L1 USDC
              </span>
            </div>
            {/* Metathesage Builder Credit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
                by{' '}
                <a
                  href="https://x.com/metathesage"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00f0ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  @metathesage
                </a>{' '}
                for Arc Network
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Wallet Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mainnet / Testnet Segmented Reso Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(10, 14, 24, 0.8)',
              backgroundImage: 'var(--dither-fine)',
              padding: '2px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => toggleTargetNetwork(false)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                color: !isTestnet ? '#ffffff' : 'var(--text-dim)',
                background: !isTestnet ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: !isTestnet ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
              }}
            >
              Mainnet
            </button>
            <button
              onClick={() => toggleTargetNetwork(true)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                color: isTestnet ? '#ffffff' : 'var(--text-dim)',
                background: isTestnet ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: isTestnet ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
              }}
            >
              Testnet
            </button>
          </div>

          {/* Relay Bridge Button */}
          {openRelayBridge && (
            <button
              onClick={openRelayBridge}
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '7px 12px',
                borderColor: 'rgba(0, 240, 255, 0.25)',
                color: '#38bdf8',
              }}
              title="Bridge funds to Arc Network via Relay.link"
            >
              <ArrowLeftRight size={13} />
              <span>Bridge</span>
            </button>
          )}

          {/* Add Arc Network */}
          <button
            onClick={() => switchNetwork(targetNetwork)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '7px 12px' }}
            title={`Add ${targetNetwork.name} (Chain ID ${targetNetwork.chainId}) to your wallet`}
          >
            <PlusCircle size={13} />
            <span>Add Arc</span>
          </button>

          {/* Account Hub Button */}
          {onNavigateAccount && (
            <button
              onClick={onNavigateAccount}
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '7px 12px',
                borderColor: activeTab === 'account' ? 'rgba(0, 240, 255, 0.4)' : undefined,
                color: activeTab === 'account' ? '#00f0ff' : undefined,
                background: activeTab === 'account' ? 'rgba(0, 240, 255, 0.08)' : undefined,
              }}
              title="Open Account Profile & Circle Passkeys"
            >
              <User size={13} />
              <span>Account</span>
            </button>
          )}

          {/* Wallet Status / Connect Button */}
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isArc ? (
                <button
                  onClick={() => switchNetwork(targetNetwork)}
                  disabled={isSwitchingNetwork}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                  title={`Click to switch your wallet from ${currentChainName} to ${targetNetwork.name}`}
                >
                  <AlertTriangle size={13} color="#f87171" />
                  <span>{isSwitchingNetwork ? 'Switching...' : `Switch to Arc`}</span>
                </button>
              ) : (
                <div
                  style={{
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    color: '#00f0ff',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <CheckCircle size={12} />
                  <span>Arc {targetNetwork.chainId}</span>
                </div>
              )}

              {/* Balance & Address Box */}
              <div
                style={{
                  background: 'rgba(10, 14, 24, 0.85)',
                  backgroundImage: 'var(--dither-fine)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '0.84rem', fontWeight: '700', color: '#ffffff' }}>
                    {isArc ? `${balance} USDC` : `${arcBalance} USDC`}
                  </div>
                  <div className="mono" style={{ fontSize: '0.68rem', color: isArc ? 'var(--text-dim)' : '#f59e0b' }}>
                    {truncateAddress(account)}
                  </div>
                </div>

                {/* Explicit Disconnect Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    disconnectWallet();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#f87171',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                  }}
                  title="Disconnect wallet"
                >
                  <LogOut size={12} />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <Wallet size={14} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
