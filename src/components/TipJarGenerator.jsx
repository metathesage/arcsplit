import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Link, Share2, Sparkles, Heart } from 'lucide-react';

export function TipJarGenerator({ currentRecipients, currentMemo, defaultAmount = '5.0' }) {
  const [copied, setCopied] = useState(false);
  const [tipAmount, setTipAmount] = useState(defaultAmount);

  // Encode recipients and shares into a compact query string
  const encodedQuery = React.useMemo(() => {
    try {
      const parts = currentRecipients
        .filter((r) => r.address)
        .map((r) => `${r.address}:${r.share}:${encodeURIComponent(r.label || '')}`);
      const params = new URLSearchParams();
      params.set('split', parts.join(';'));
      if (currentMemo) params.set('memo', currentMemo);
      return params.toString();
    } catch {
      return '';
    }
  }, [currentRecipients, currentMemo]);

  const shareableUrl = `${window.location.origin}${window.location.pathname}?${encodedQuery}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={20} color="#8b5cf6" />
          <span>Shareable Creator Tip Jar & Payment Link</span>
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Share this link with your community, audience, or clients. Anyone can tip or pay your team in native USDC with pre-split distribution.
        </p>
      </div>

      {/* Share Link Box */}
      <div
        style={{
          background: 'rgba(10, 16, 30, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' }}>
          <Link size={18} />
          <span style={{ fontSize: '0.84rem', fontWeight: '600' }}>Direct Link:</span>
        </div>
        <div
          className="mono"
          style={{
            flex: 1,
            minWidth: '220px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {shareableUrl}
        </div>
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{
            background: copied ? '#10b981' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            padding: '9px 16px',
            fontSize: '0.85rem',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Live Preview Card */}
      <div
        style={{
          border: '1px dashed rgba(139, 92, 246, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          background: 'rgba(139, 92, 246, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="tag-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
            Live Visitor Preview
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            What payers and supporters see
          </span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)',
              color: 'white',
            }}
          >
            <Heart size={26} fill="white" />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
            {currentMemo || 'Support This Project'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Tips are automatically split in real-time on Arc Network:
          </p>

          {/* Breakdown Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {currentRecipients.map((r, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                {r.label || `Wallet ${i + 1}`}: <strong style={{ color: '#38bdf8' }}>{r.share}%</strong>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <a
              href={shareableUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.84rem', padding: '8px 14px' }}
            >
              <ExternalLink size={14} />
              <span>Test Shareable Link in New Tab</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
