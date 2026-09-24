import React, { useState } from 'react';
import { X, Award, CheckCircle2, Copy, Check, ExternalLink, Calendar, DollarSign, Globe, Code } from 'lucide-react';
import { ARC_MAINNET } from '../config/constants';

export function MicrograntChecklistModal({ isOpen, onClose, activeContract }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const projectPitch = `ArcSplit is a lightweight, non-custodial multi-party USDC payment router and creator tip jar built specifically for the Arc Network.

Why Arc?
Traditional split contracts on Ethereum or other L2s suffer from token approvals and volatile ETH gas requirements. On Arc, USDC is the native gas currency. ArcSplit leverages this architectural advantage to provide 1-click splits directly in native USDC with zero wrapping, zero token approvals, and predictable sub-cent gas fees.

Features:
• Instant non-custodial distribution based on configurable basis points (100.00% precision)
• Shareable permalinks for creator tip jars and team invoices with URL query states
• On-chain memo logging via the PaymentSplit event for transparent auditing
• Zero protocol fees or custodial risk — direct pass-through via Solidity call value`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>
                Arc Microgrant Submission Kit
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Arc Network Microgrants Program (20 x $500 USDC)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-dim)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Grant Summary Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grant Pool</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fbbf24' }}>$500 USDC</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>20 Grants Awarded</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Deadline</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>Oct 14, 2026</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Working app required</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chain Deployment</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>Arc Mainnet</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chain ID: 5042</div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
            Submission Criteria Checklist
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Working Mini-App / Prototype (Complete & functional)', done: true },
              { label: 'Deployed on Arc Mainnet (Chain ID 5042)', done: true },
              { label: 'Public GitHub Repository with README', done: true },
              { label: 'Utilizes native USDC or Circle App Kits', done: true },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                }}
              >
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ color: 'var(--text-main)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-filled Form Values to Copy */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
            Ready-to-Submit Form Answers:
          </h4>

          {/* Project Name */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Project Name</span>
              <button
                onClick={() => copyToClipboard('ArcSplit', 'name')}
                style={{ color: copiedField === 'name' ? '#10b981' : '#38bdf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                {copiedField === 'name' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === 'name' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#f8fafc' }}>
              ArcSplit
            </div>
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Tagline / One-liner</span>
              <button
                onClick={() => copyToClipboard('Instant, non-custodial multi-party USDC payments and creator tip jars powered by Arc Network’s native USDC gas.', 'tagline')}
                style={{ color: copiedField === 'tagline' ? '#10b981' : '#38bdf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                {copiedField === 'tagline' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === 'tagline' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#f8fafc' }}>
              Instant, non-custodial multi-party USDC payments and creator tip jars powered by Arc Network’s native USDC gas.
            </div>
          </div>

          {/* Contract Address */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Arc Mainnet Contract Address</span>
              <button
                onClick={() => copyToClipboard(activeContract || ARC_MAINNET.defaultContract, 'contract')}
                style={{ color: copiedField === 'contract' ? '#10b981' : '#38bdf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                {copiedField === 'contract' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === 'contract' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="mono" style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#38bdf8' }}>
              {activeContract || ARC_MAINNET.defaultContract}
            </div>
          </div>

          {/* Full Pitch */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Project Pitch / Description</span>
              <button
                onClick={() => copyToClipboard(projectPitch, 'pitch')}
                style={{ color: copiedField === 'pitch' ? '#10b981' : '#38bdf8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                {copiedField === 'pitch' ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedField === 'pitch' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                maxHeight: '120px',
                overflowY: 'auto',
                whiteSpace: 'pre-line',
              }}
            >
              {projectPitch}
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <a
            href="https://www.arc.io/app-kits"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <ExternalLink size={13} />
            <span>Arc App Kits</span>
          </a>
          <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 18px' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
