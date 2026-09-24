import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Link, Share2, Heart, Zap } from 'lucide-react';

export function TipJarGenerator({ currentRecipients, currentMemo, defaultAmount = '5.0' }) {
  const [copied, setCopied] = useState(false);

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
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={22} color="#a855f7" />
          <span>Shareable Creator Tip Jar & Payment Link</span>
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Generate a permanent payment permalink for your co-creators, team, or project. Anyone opening this link can split payments in native USDC with 1 click.
        </p>
      </div>

      {/* Share Link Box */}
      <div
        style={{
          background: 'rgba(8, 13, 26, 0.75)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Link size={18} />
          <span style={{ fontSize: '0.84rem', fontWeight: '700' }}>Permalink:</span>
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
            background: 'rgba(0,0,0,0.4)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {shareableUrl}
        </div>
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{
            background: copied ? '#10b981' : 'linear-gradient(135deg, #a855f7 0%, #0066ff 100%)',
            padding: '10px 18px',
            fontSize: '0.85rem',
            boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(168, 85, 247, 0.35)',
            color: copied ? 'white' : '#fff',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Live Preview Card */}
      <div
        style={{
          border: '1px dashed rgba(168, 85, 247, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          background: 'rgba(168, 85, 247, 0.04)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span className="tag-badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            Live Visitor Preview
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Supporter Interface
          </span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '460px', margin: '0 auto' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
              color: '#030712',
            }}
          >
            <Heart size={28} fill="#030712" />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
            {currentMemo || 'Support This Project'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Instant, direct pass-through distribution on Arc Network:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '22px' }}>
            {currentRecipients.map((r, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                {r.label || `Wallet ${i + 1}`}: <strong style={{ color: '#00f0ff' }}>{r.share}%</strong>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a
              href={shareableUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '9px 16px' }}
            >
              <ExternalLink size={14} />
              <span>Test Link in New Window</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
