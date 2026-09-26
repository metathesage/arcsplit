import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Zap,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet
} from 'lucide-react';

export function OnrampModal({
  isOpen,
  onClose,
  account,
  targetNetwork,
  onSuccessRefresh,
}) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Onramp session when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchSession = async () => {
      setIsLoadingSession(true);
      setErrorMessage('');

      const destinationAddress = account || '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';

      try {
        const res = await fetch('/api/onramp/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationAddress,
            assets: {
              tokens: ['USDC'],
              chains: ['arc'],
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Could not mint Arc Onramp session.');
        }

        setSessionData(data);
      } catch (err) {
        console.error('Onramp session fetch error:', err);
        setErrorMessage(err.message || 'Failed to initialize Arc Onramp.');
      } finally {
        setIsLoadingSession(false);
      }
    };

    fetchSession();
  }, [isOpen, account]);

  // Listen to postMessage lifecycle events from onramp.arc.io
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin.includes('arc.io')) return;
      try {
        const { type, data } = event.data || {};
        if (type === 'DEPOSIT_SETTLED' || data?.type === 'DEPOSIT_SETTLED') {
          if (onSuccessRefresh) onSuccessRefresh();
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccessRefresh]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 4, 10, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.96) 0%, rgba(4, 7, 15, 0.98) 100%)',
          backgroundImage: 'var(--dither-fine)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
                    color: '#ffffff',
                    lineHeight: '1.2',
                  }}
                >
                  Buy USDC on Arc (Fiat Onramp)
                </h3>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#00f0ff',
                    background: 'rgba(0, 240, 255, 0.12)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                  }}
                >
                  Arc App Kit
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Debit Card • Apple Pay • Google Pay • Bank Transfer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Destination Wallet Badge */}
        <div
          style={{
            padding: '10px 24px',
            background: 'rgba(0, 240, 255, 0.04)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Wallet size={13} color="#00f0ff" />
            <span>Destination:</span>
            <span className="mono" style={{ color: '#ffffff', fontWeight: '600' }}>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
            <CheckCircle size={12} />
            <span>Arc Mainnet (USDC Native Gas)</span>
          </div>
        </div>

        {/* Modal Body / Iframe */}
        <div style={{ flex: 1, minHeight: '520px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {isLoadingSession && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(8, 12, 22, 0.95)',
                gap: '14px',
                zIndex: 2,
              }}
            >
              <RefreshCw className="animate-spin" size={28} color="#00f0ff" />
              <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: '600' }}>
                Minting Arc Onramp Session...
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Connecting to Circle Developer Services on Arc L1
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: '30px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <AlertCircle size={32} color="#f87171" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '1rem', color: '#ffffff', fontWeight: '700', marginBottom: '6px' }}>
                Unable to load Onramp session
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '20px' }}>
                {errorMessage}
              </div>
              <a
                href={`https://onramp-demo.arc.io/?walletAddress=${account || ''}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <span>Open Arc Onramp Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {sessionData?.widgetUrl && !isLoadingSession && (
            <iframe
              src={sessionData.widgetUrl}
              title="Arc App Kit Onramp"
              style={{
                width: '100%',
                height: '560px',
                border: 'none',
                background: '#030712',
              }}
              allow="camera; payment; accelerometer; gyroscope"
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(10, 15, 29, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>KYC & payment processing secured by Arc & Circle</span>
          </div>

          {sessionData?.widgetUrl && (
            <a
              href={sessionData.widgetUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#00f0ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600',
              }}
            >
              <span>Open in New Tab</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
