import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Sliders, ArrowRight, Sparkles, AlertCircle, Share2, RefreshCw } from 'lucide-react';
import { PRESET_SPLITS, DEMO_RECIPIENTS } from '../config/constants';

const COLOR_PALETTE = ['#0ea5e9', '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

export function SplitBuilder({
  account,
  isArc,
  targetNetwork,
  connectWallet,
  switchNetwork,
  executeSplit,
  onPaymentSuccess,
  onGenerateTipJar,
}) {
  const [totalAmount, setTotalAmount] = useState('10.0');
  const [recipients, setRecipients] = useState(DEMO_RECIPIENTS);
  const [memo, setMemo] = useState('Arc Network Grant / Collaborative Sprint');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Total Percentage
  const totalPercentage = useMemo(() => {
    return recipients.reduce((sum, r) => sum + (Number(r.share) || 0), 0);
  }, [recipients]);

  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;

  // Amount parsing
  const parsedTotal = parseFloat(totalAmount) || 0;

  // Add Recipient
  const handleAddRecipient = () => {
    if (recipients.length >= 8) return;
    const remainingShare = Math.max(0, 100 - totalPercentage);
    setRecipients([
      ...recipients,
      {
        address: '',
        share: remainingShare > 0 ? remainingShare : 0,
        label: `Contributor ${recipients.length + 1}`,
      },
    ]);
  };

  // Remove Recipient
  const handleRemoveRecipient = (index) => {
    if (recipients.length <= 1) return;
    const updated = recipients.filter((_, i) => i !== index);
    setRecipients(updated);
  };

  // Update Recipient
  const handleUpdateRecipient = (index, field, value) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  // Apply Presets
  const applyPreset = (preset) => {
    if (preset.value === 'equal') {
      const count = recipients.length;
      const baseShare = Math.floor(100 / count);
      const remainder = 100 - baseShare * count;
      const updated = recipients.map((r, i) => ({
        ...r,
        share: i === 0 ? baseShare + remainder : baseShare,
      }));
      setRecipients(updated);
    } else if (preset.shares) {
      const updated = preset.shares.map((share, i) => ({
        address: recipients[i]?.address || '',
        share,
        label: recipients[i]?.label || `Recipient ${i + 1}`,
      }));
      setRecipients(updated);
    }
  };

  // Equalize
  const equalizeShares = () => {
    const count = recipients.length;
    if (count === 0) return;
    const baseShare = Math.floor(100 / count);
    const remainder = 100 - baseShare * count;
    setRecipients(
      recipients.map((r, i) => ({
        ...r,
        share: i === 0 ? baseShare + remainder : baseShare,
      }))
    );
  };

  // Form Validation
  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr?.trim());

  const handleExecute = async () => {
    setErrorMessage('');
    if (!account) {
      await connectWallet();
      return;
    }

    if (!isArc) {
      await switchNetwork();
      return;
    }

    if (parsedTotal <= 0) {
      setErrorMessage('Please enter a valid USDC amount greater than 0.');
      return;
    }

    if (!isPercentageValid) {
      setErrorMessage(`Total allocation must equal 100%. Currently at ${totalPercentage}%.`);
      return;
    }

    for (let i = 0; i < recipients.length; i++) {
      if (!isValidAddress(recipients[i].address)) {
        setErrorMessage(`Recipient #${i + 1} (${recipients[i].label || 'unnamed'}) has an invalid Ethereum address.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const recipientAddresses = recipients.map((r) => r.address.trim());
      // Convert percentage to basis points (e.g. 50% = 5000 bps)
      const basisPoints = recipients.map((r) => Math.round(Number(r.share) * 100));

      // Ensure sum is exactly 10,000
      const currentBpSum = basisPoints.reduce((a, b) => a + b, 0);
      if (currentBpSum !== 10000 && basisPoints.length > 0) {
        basisPoints[0] += 10000 - currentBpSum;
      }

      const result = await executeSplit({
        recipients: recipientAddresses,
        basisPoints,
        totalAmountUsdc: parsedTotal,
        memo,
      });

      onPaymentSuccess({
        ...result,
        recipients,
        totalAmount: parsedTotal,
        memo,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.reason || err.message || 'Transaction was rejected or failed on Arc.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      {/* Title & Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="#0ea5e9" />
            <span>Configure Instant USDC Split</span>
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Split native USDC on Arc instantly to multiple wallets in a single sub-cent transaction
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginRight: '4px' }}>Presets:</span>
          {PRESET_SPLITS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={equalizeShares}
            title="Distribute equally among existing recipients"
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} />
            <span>Equalize</span>
          </button>
        </div>
      </div>

      {/* Total Amount Input */}
      <div
        style={{
          background: 'rgba(10, 16, 30, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: '1', minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Total Payment Amount (Native USDC)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                width: '180px',
                padding: '8px 14px',
                color: '#38bdf8',
              }}
              placeholder="0.00"
            />
            <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>USDC</span>
          </div>
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['5', '10', '25', '50', '100'].map((amt) => (
            <button
              key={amt}
              onClick={() => setTotalAmount(amt)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: '600',
                background: totalAmount === amt ? 'rgba(14, 165, 233, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: totalAmount === amt ? '1px solid #0ea5e9' : '1px solid var(--border-subtle)',
                color: totalAmount === amt ? '#38bdf8' : 'var(--text-muted)',
              }}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Visualizer Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            Split Allocation Breakdown
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: '700',
              color: isPercentageValid ? '#34d399' : '#f87171',
            }}
          >
            {totalPercentage}% / 100% {isPercentageValid ? '✓ Balanced' : '⚠️ Must equal 100%'}
          </span>
        </div>

        <div className="split-bar-container">
          {recipients.map((r, i) => {
            const width = Math.min(100, Math.max(0, Number(r.share) || 0));
            return (
              <div
                key={i}
                className="split-bar-segment"
                style={{
                  width: `${width}%`,
                  backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length],
                }}
                title={`${r.label || `Recipient ${i + 1}`}: ${r.share}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Recipients List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {recipients.map((recipient, index) => {
          const sharePct = Number(recipient.share) || 0;
          const recipientPayout = ((parsedTotal * sharePct) / 100).toFixed(4);
          const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

          return (
            <div
              key={index}
              style={{
                background: 'rgba(13, 20, 36, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 1.2fr) minmax(220px, 3fr) minmax(100px, 1fr) minmax(90px, 1fr) 40px',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Contributor Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  value={recipient.label}
                  onChange={(e) => handleUpdateRecipient(index, 'label', e.target.value)}
                  placeholder={`Label #${index + 1}`}
                  style={{ fontSize: '0.85rem', padding: '6px 10px', width: '100%' }}
                />
              </div>

              {/* Wallet Address */}
              <div>
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => handleUpdateRecipient(index, 'address', e.target.value)}
                  placeholder="0x..."
                  className="mono"
                  style={{
                    fontSize: '0.82rem',
                    padding: '6px 10px',
                    width: '100%',
                    borderColor: recipient.address && !isValidAddress(recipient.address) ? '#ef4444' : undefined,
                  }}
                />
              </div>

              {/* Percentage Share */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={recipient.share}
                  onChange={(e) => handleUpdateRecipient(index, 'share', Number(e.target.value))}
                  style={{ fontSize: '0.88rem', fontWeight: '600', padding: '6px 8px', width: '65px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>%</span>
              </div>

              {/* Payout amount */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: color }}>
                  {recipientPayout}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>USDC</div>
              </div>

              {/* Delete button */}
              <div style={{ textAlign: 'center' }}>
                {recipients.length > 1 && (
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    style={{ color: 'var(--text-dim)', padding: '6px' }}
                    title="Remove recipient"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recipient & Share as Tip Jar link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={handleAddRecipient}
          disabled={recipients.length >= 8}
          className="btn-secondary"
          style={{ fontSize: '0.85rem', padding: '8px 14px' }}
        >
          <Plus size={16} />
          <span>Add Recipient ({recipients.length}/8)</span>
        </button>

        <button
          onClick={() => onGenerateTipJar({ recipients, memo, totalAmount })}
          className="btn-secondary"
          style={{
            fontSize: '0.85rem',
            padding: '8px 14px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
          }}
        >
          <Share2 size={16} />
          <span>Generate Shareable Tip Jar Link</span>
        </button>
      </div>

      {/* On-Chain Memo / Reference */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
          On-Chain Memo / Payment Note (Emitted in ArcSplit event)
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. Podcast revenue split, Hackathon prize, Project bounty..."
          style={{ width: '100%', fontSize: '0.88rem' }}
        />
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} flexShrink={0} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Execute Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleExecute}
          disabled={isSubmitting}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', letterSpacing: '0.01em' }}
        >
          {isSubmitting ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Processing Transaction on Arc...</span>
            </>
          ) : !account ? (
            <>
              <Sparkles size={18} />
              <span>Connect Wallet to Split {parsedTotal} USDC</span>
            </>
          ) : !isArc ? (
            <>
              <AlertCircle size={18} />
              <span>Switch to {targetNetwork.name} to Split</span>
            </>
          ) : (
            <>
              <ArrowRight size={18} />
              <span>Split {parsedTotal} USDC on Arc Mainnet</span>
            </>
          )}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', padding: '0 4px' }}>
          <span>Gas paid natively in USDC</span>
          <span>Target Network: {targetNetwork.name} ({targetNetwork.chainId})</span>
        </div>
      </div>
    </div>
  );
}
