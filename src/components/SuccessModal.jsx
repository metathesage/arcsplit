import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ExternalLink, Copy, Check, X, ArrowUpRight } from 'lucide-react';

export function SuccessModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#38bdf8', '#10b981', '#a855f7'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const truncate = (str) => {
    if (!str) return '';
    return `${str.slice(0, 8)}...${str.slice(-6)}`;
  };

  const copyReceipt = () => {
    const text = `ArcSplit Receipt:
Tx: ${data.hash}
Total: ${data.totalAmount} USDC
Memo: ${data.memo || 'N/A'}
Explorer: ${data.explorerUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', textAlign: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
          Payment Split Confirmed on Arc!
        </h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Your transaction has been processed and settled on Arc Network.
        </p>

        {/* Transaction Summary Box */}
        <div
          style={{
            background: 'rgba(10, 16, 30, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            textAlign: 'left',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Total Settled:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8' }}>
              {data.totalAmount} USDC
            </span>
          </div>

          {data.memo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Memo Note:</span>
              <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500' }}>
                {data.memo}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Transaction Hash:</span>
            <a
              href={data.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mono"
              style={{ fontSize: '0.82rem', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{truncate(data.hash)}</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Breakdown items */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Distributed Shares:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.recipients?.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.label || `Wallet #${i + 1}`}:</span>
                  <span className="mono" style={{ color: '#f8fafc' }}>
                    {((data.totalAmount * r.share) / 100).toFixed(4)} USDC ({r.share}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={copyReceipt} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied Receipt' : 'Copy Receipt'}</span>
          </button>
          <a
            href={data.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <span>View on Explorer</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
