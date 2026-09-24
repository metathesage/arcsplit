import React from 'react';
import { Wallet, PlusCircle, CheckCircle, AlertTriangle, Zap, ExternalLink } from 'lucide-react';

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
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #0066ff 50%, #7928ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.4)',
              color: '#030712',
            }}
          >
            <Zap size={28} fill="#030712" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                className="electric-glow"
                style={{
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #00f0ff 60%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ArcSplit
              </h1>
              <span className="pulse-badge">
                <span className="pulse-dot"></span>
                Arc L1 Native
              </span>
            </div>
            {/* Metathesage Builder Credit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Built by{' '}
                <a
                  href="https://x.com/metathesage"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#00f0ff',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  @metathesage
                </a>{' '}
                for Arc Network
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Mainnet / Testnet Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(10, 16, 32, 0.85)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <button
              onClick={() => toggleTargetNetwork(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: !isTestnet ? '#00f0ff' : 'var(--text-dim)',
                background: !isTestnet ? 'rgba(0, 240, 255, 0.18)' : 'transparent',
                boxShadow: !isTestnet ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none',
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
                fontWeight: '700',
                color: isTestnet ? '#a855f7' : 'var(--text-dim)',
                background: isTestnet ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
                boxShadow: isTestnet ? '0 0 10px rgba(168, 85, 247, 0.2)' : 'none',
              }}
            >
              Testnet
            </button>
          </div>

          {/* Add Arc to Wallet */}
          <button
            onClick={() => switchNetwork(targetNetwork)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            title={`Add ${targetNetwork.name} (Chain ID ${targetNetwork.chainId}) to your wallet`}
          >
            <PlusCircle size={15} />
            <span>Add Arc Network</span>
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
                    fontWeight: '700',
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
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00f0ff',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Arc ({targetNetwork.chainId})</span>
                </div>
              )}

              <div
                style={{
                  background: 'rgba(10, 16, 32, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#00f0ff' }}>
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
