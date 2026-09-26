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
    <div className="glass-panel" style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '400', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.01em' }}>
          <Zap size={22} color="#a855f7" />
          <span>Shareable Creator Tip Jar & Payment Link</span>
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Generate a permanent payment permalink for your co-creators, team, or project. Anyone opening this link can split payments in native USDC with 1 click.
        </p>
      </div>

      {/* Share Link Box */}
      <div
        className="apple-card"
        style={{
          padding: '18px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
          <Link size={18} />
          <span style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permalink:</span>
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
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '9px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {shareableUrl}
        </div>
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{
            background: copied ? '#10b981' : 'linear-gradient(135deg, #a855f7 0%, #0066ff 100%)',
            padding: '10px 20px',
            fontSize: '0.86rem',
            boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 4px 18px rgba(168, 85, 247, 0.35)',
            color: '#fff',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Live Preview Card */}
      <div
        className="apple-card"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.06) 0%, rgba(0, 113, 227, 0.03) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.22)',
          position: 'relative',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span className="tag-badge" style={{ background: 'rgba(168, 85, 247, 0.16)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)' }}>
            Live Visitor Preview
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '500' }}>
            Supporter Interface
          </span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.35)',
              color: '#030712',
            }}
          >
            <Heart size={28} fill="#030712" />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {currentMemo || 'Support This Project'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '22px' }}>
            Instant, direct pass-through distribution on Arc Network:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '26px' }}>
            {currentRecipients.map((r, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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
              style={{ fontSize: '0.86rem', padding: '9px 18px' }}
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
