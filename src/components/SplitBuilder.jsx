import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Sliders, ArrowRight, Zap, AlertCircle, Share2, RefreshCw } from 'lucide-react';
import { PRESET_SPLITS, DEMO_RECIPIENTS } from '../config/constants';

const COLOR_PALETTE = ['#00f0ff', '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

export function SplitBuilder({
  account,
  isArc,
  targetNetwork,
  connectWallet,
  switchNetwork,
  executeSplit,
  onPaymentSuccess,
  onGenerateTipJar,
  onNavigateDeployer,
}) {
  const [totalAmount, setTotalAmount] = useState('10.0');
  const [recipients, setRecipients] = useState(DEMO_RECIPIENTS);
  const [memo, setMemo] = useState('High-Voltage Arc USDC Payment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalPercentage = useMemo(() => {
    return recipients.reduce((sum, r) => sum + (Number(r.share) || 0), 0);
  }, [recipients]);

  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;
  const parsedTotal = parseFloat(totalAmount) || 0;

  const handleAddRecipient = () => {
    if (recipients.length >= 8) return;
    const remainingShare = Math.max(0, 100 - totalPercentage);
    setRecipients([
      ...recipients,
      {
        address: '',
        share: remainingShare > 0 ? remainingShare : 0,
        label: `Wallet ${recipients.length + 1}`,
      },
    ]);
  };

  const handleRemoveRecipient = (index) => {
    if (recipients.length <= 1) return;
    const updated = recipients.filter((_, i) => i !== index);
    setRecipients(updated);
  };

  const handleUpdateRecipient = (index, field, value) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

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
      setErrorMessage(`Total allocation must equal exactly 100%. Currently at ${totalPercentage}%.`);
      return;
    }

    for (let i = 0; i < recipients.length; i++) {
      if (!isValidAddress(recipients[i].address)) {
        setErrorMessage(`Recipient #${i + 1} (${recipients[i].label || 'unnamed'}) is not a valid 0x address.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const recipientAddresses = recipients.map((r) => r.address.trim());
      const basisPoints = recipients.map((r) => Math.round(Number(r.share) * 100));

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

      // Save to localStorage history for Account view
      try {
        const existing = JSON.parse(localStorage.getItem('arcsplit_payment_history') || '[]');
        const newRecord = {
          id: `tx-${Date.now()}`,
          txHash: result?.hash || result?.transactionHash || '',
          amount: Number(parsedTotal).toFixed(2),
          recipientsCount: recipientAddresses.length,
          memo: memo || 'Instant Multi-Party Split',
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('arcsplit_payment_history', JSON.stringify([newRecord, ...existing.slice(0, 49)]));
      } catch (_) {}

      onPaymentSuccess({
        ...result,
        recipients,
        totalAmount: parsedTotal,
        memo,
      });
    } catch (err) {
      console.error(err);
      const msg = err.reason || err.message || 'Transaction was rejected or failed on Arc.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      {/* Title & Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '400', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.01em' }}>
            <Zap size={22} color="#00f0ff" />
            <span>Instant Multi-Party USDC Split</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Route native USDC across multiple wallets simultaneously in a single atomic transaction
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '600', marginRight: '4px' }}>Splits:</span>
          {PRESET_SPLITS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                fontSize: '0.74rem',
                fontWeight: '600',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={equalizeShares}
            title="Distribute equally among existing recipients"
            style={{
              fontSize: '0.74rem',
              fontWeight: '600',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--transition-fast)',
            }}
          >
            <RefreshCw size={11} />
            <span>Equalize</span>
          </button>
        </div>
      </div>

      {/* Total Amount Input */}
      <div
        className="apple-card"
        style={{
          padding: '24px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.22)',
        }}
      >
        <div style={{ flex: '1', minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Total Distribution Amount (Native USDC)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                width: '190px',
                padding: '8px 14px',
                color: '#ffffff',
                borderColor: 'rgba(0, 240, 255, 0.35)',
                letterSpacing: '-0.02em',
              }}
              placeholder="0.00"
            />
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#00f0ff' }}>USDC</span>
          </div>
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['5', '10', '25', '50', '100'].map((amt) => (
            <button
              key={amt}
              onClick={() => setTotalAmount(amt)}
              style={{
                padding: '7px 15px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: '700',
                background: totalAmount === amt ? 'rgba(0, 240, 255, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                border: totalAmount === amt ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                color: totalAmount === amt ? '#00f0ff' : 'var(--text-muted)',
                boxShadow: totalAmount === amt ? '0 2px 10px rgba(0, 240, 255, 0.25)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Voltage Allocation
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: '800',
              color: isPercentageValid ? '#00f0ff' : '#f87171',
            }}
          >
            {totalPercentage}% / 100% {isPercentageValid ? '⚡ Balanced' : '⚠️ Must equal 100%'}
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
                  boxShadow: `0 0 10px ${COLOR_PALETTE[i % COLOR_PALETTE.length]}`,
                }}
                title={`${r.label || `Recipient ${i + 1}`}: ${r.share}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Recipients List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
        {recipients.map((recipient, index) => {
          const sharePct = Number(recipient.share) || 0;
          const recipientPayout = ((parsedTotal * sharePct) / 100).toFixed(4);
          const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

          return (
            <div
              key={index}
              className="apple-card"
              style={{
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 1.2fr) minmax(220px, 3fr) minmax(95px, 0.9fr) minmax(90px, 1fr) 36px',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  value={recipient.label}
                  onChange={(e) => handleUpdateRecipient(index, 'label', e.target.value)}
                  placeholder={`Label #${index + 1}`}
                  style={{ fontSize: '0.84rem', padding: '7px 11px', width: '100%', background: 'rgba(0, 0, 0, 0.3)' }}
                />
              </div>

              <div>
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => handleUpdateRecipient(index, 'address', e.target.value)}
                  placeholder="0x..."
                  className="mono"
                  style={{
                    fontSize: '0.82rem',
                    padding: '7px 11px',
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: recipient.address && !isValidAddress(recipient.address) ? 'rgba(239, 68, 68, 0.7)' : undefined,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={recipient.share}
                  onChange={(e) => handleUpdateRecipient(index, 'share', Number(e.target.value))}
                  style={{ fontSize: '0.88rem', fontWeight: '700', padding: '7px 9px', width: '60px', textAlign: 'right', background: 'rgba(0, 0, 0, 0.3)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>%</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.94rem', fontWeight: '800', color: color }}>
                  {recipientPayout}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>USDC</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                {recipients.length > 1 && (
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    style={{ color: 'var(--text-dim)', padding: '6px', borderRadius: 'var(--radius-sm)', transition: 'all var(--transition-fast)' }}
                    title="Remove recipient"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Recipient & Share as Tip Jar link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '26px' }}>
        <button
          onClick={handleAddRecipient}
          disabled={recipients.length >= 8}
          className="btn-secondary"
          style={{ fontSize: '0.84rem', padding: '9px 16px' }}
        >
          <Plus size={15} />
          <span>Add Recipient ({recipients.length}/8)</span>
        </button>

        <button
          onClick={() => onGenerateTipJar({ recipients, memo, totalAmount })}
          className="btn-secondary"
          style={{
            fontSize: '0.84rem',
            padding: '9px 16px',
            background: 'rgba(168, 85, 247, 0.1)',
            borderColor: 'rgba(168, 85, 247, 0.35)',
            color: '#c084fc',
          }}
        >
          <Share2 size={15} />
          <span>Generate Shareable Payment Link</span>
        </button>
      </div>

      {/* On-Chain Memo */}
      <div style={{ marginBottom: '26px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          On-Chain Memo / Reference (Logged in ArcSplit PaymentSplit Event)
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. Creator squad split, Hackathon reward, Infrastructure payout..."
          style={{ width: '100%', fontSize: '0.88rem', padding: '11px 15px' }}
        />
      </div>

      {/* Error alert with Deployer helper if contract is missing */}
      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>Execution Error:</div>
            <div>{errorMessage}</div>
            {errorMessage.includes('Contract not found') && (
              <button
                onClick={onNavigateDeployer}
                className="btn-secondary"
                style={{
                  marginTop: '8px',
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  borderColor: '#00f0ff',
                  color: '#00f0ff',
                }}
              >
                Go to Contract Deployer Tab
              </button>
            )}
          </div>
        </div>
      )}

      {/* Execute Split Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleExecute}
          disabled={isSubmitting}
          className="btn-primary"
          style={{ width: '100%', padding: '15px', fontSize: '1.08rem', letterSpacing: '0.01em' }}
        >
          {isSubmitting ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 0, 0, 0.3)',
                  borderTopColor: '#000',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Broadcasting to Arc Network...</span>
            </>
          ) : !account ? (
            <>
              <Zap size={18} />
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
              <span>Split {parsedTotal} USDC with Sub-Cent Gas</span>
            </>
          )}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', padding: '0 4px' }}>
          <span>Native USDC Gas (No Approvals)</span>
          <span>Target Network: {targetNetwork.name} ({targetNetwork.chainId})</span>
        </div>
      </div>
    </div>
  );
}
