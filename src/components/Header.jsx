import React from 'react';
import { Wallet, Globe, PlusCircle, CheckCircle, AlertTriangle, Award, ExternalLink } from 'lucide-react';

export function Header({
  account,
  chainId,
  balance,
  isConnecting,
  isArc,
  targetNetwork,
  connectWallet,
  disconnectWallet,
  switchNetwork,
  toggleTargetNetwork,
  onOpenGrantModal,
}) {
  const isTestnet = targetNetwork.chainId === 5042002;

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
              color: 'white',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ArcSplit
              </h1>
              <span className="pulse-badge">
                <span className="pulse-dot"></span>
                Arc L1 Native
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Zero-friction multi-party USDC payments & creator tip jars
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Microgrants Button */}
          <button
            onClick={onOpenGrantModal}
            className="btn-secondary"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '0.85rem',
            }}
            title="Arc Microgrants Submission Kit"
          >
            <Award size={16} />
            <span>$500 Microgrant Kit</span>
          </button>

          {/* Network Switcher & Add Chain */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => toggleTargetNetwork(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: !isTestnet ? '#0ea5e9' : 'var(--text-dim)',
                background: !isTestnet ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
              }}
            >
              Mainnet
            </button>
            <button
              onClick={() => toggleTargetNetwork(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: isTestnet ? '#a855f7' : 'var(--text-dim)',
                background: isTestnet ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              }}
            >
              Testnet
            </button>
          </div>

          {/* Add Arc to Wallet Button */}
          <button
            onClick={() => switchNetwork(targetNetwork)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            title={`Add ${targetNetwork.name} (Chain ID ${targetNetwork.chainId}) to your wallet`}
          >
            <PlusCircle size={15} />
            <span>Add Arc to Wallet</span>
          </button>

          {/* Wallet Status / Connect Button */}
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isArc ? (
                <button
                  onClick={() => switchNetwork(targetNetwork)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>Switch to {targetNetwork.name}</span>
                </button>
              ) : (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Arc ({targetNetwork.chainId})</span>
                </div>
              )}

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#38bdf8' }}>
                    {balance} USDC
                  </div>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {truncateAddress(account)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textDecoration: 'underline' }}
                  title="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              <Wallet size={16} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
