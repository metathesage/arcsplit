import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ExternalLink,
  Zap,
  ShieldCheck,
  Clock,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';

const SUPPORTED_CHAINS = [
  { id: 8453, name: 'Base', icon: '🔵', symbol: 'ETH', currency: '0x0000000000000000000000000000000000000000', usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { id: 42161, name: 'Arbitrum', icon: '🔷', symbol: 'ETH', currency: '0x0000000000000000000000000000000000000000', usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
  { id: 1, name: 'Ethereum', icon: '💎', symbol: 'ETH', currency: '0x0000000000000000000000000000000000000000', usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { id: 10, name: 'Optimism', icon: '🔴', symbol: 'ETH', currency: '0x0000000000000000000000000000000000000000', usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
  { id: 137, name: 'Polygon', icon: '🟣', symbol: 'POL', currency: '0x0000000000000000000000000000000000000000', usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' },
  { id: 792703990, name: 'Solana', icon: '☀️', symbol: 'SOL', currency: '11111111111111111111111111111111', isSolana: true },
];

export function RelayBridgeModal({
  isOpen,
  onClose,
  account,
  targetNetwork,
  onSuccessRefresh,
  isFullView = false,
}) {
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedToken, setSelectedToken] = useState('USDC'); // 'USDC' or 'ETH'
  const [amount, setAmount] = useState('10');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteData, setQuoteData] = useState(null);
  const [quoteError, setQuoteError] = useState('');

  // Auto-fetch live quote from Relay API
  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setQuoteData(null);
      setQuoteError('');
      return;
    }

    let isMounted = true;
    const fetchQuote = async () => {
      setIsLoadingQuote(true);
      setQuoteError('');

      try {
        const originCurrency = selectedToken === 'USDC' && selectedChain.usdc
          ? selectedChain.usdc
          : selectedChain.currency;

        const decimals = selectedToken === 'USDC' ? 6 : 18;
        // Convert to base units
        const rawAmount = (BigInt(Math.floor(Number(amount) * 100)) * (10n ** BigInt(decimals - 2))).toString();

        const payload = {
          user: account || '0x0000000000000000000000000000000000000001',
          originChainId: selectedChain.id,
          destinationChainId: 5042, // Arc Mainnet
          originCurrency,
          destinationCurrency: '0x0000000000000000000000000000000000000000', // Native Arc USDC Gas
          amount: rawAmount,
          tradeType: 'EXACT_INPUT',
        };

        const res = await fetch('https://api.relay.link/quote/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.error || !res.ok) {
          setQuoteError(data.message || data.error || 'Route not found for this amount.');
          setQuoteData(null);
        } else {
          setQuoteData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Relay quote fetch error:', err);
          setQuoteError('Could not fetch live quote. You can still bridge directly on Relay.link.');
        }
      } finally {
        if (isMounted) setIsLoadingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [amount, selectedChain, selectedToken, account]);

  // Construct Relay direct deep link
  const getRelayUrl = () => {
    const originCurrency = selectedToken === 'USDC' && selectedChain.usdc
      ? selectedChain.usdc
      : selectedChain.currency;

    const base = 'https://relay.link/bridge/arc';
    const params = new URLSearchParams({
      toCurrency: '0x0000000000000000000000000000000000000000', // Native Gas token on Arc
      fromChainId: selectedChain.id.toString(),
      currency: originCurrency,
    });

    if (account) {
      params.set('toAddress', account);
    }
    if (amount) {
      params.set('amount', amount);
    }

    return `${base}?${params.toString()}`;
  };

  const content = (
    <div
      className={isFullView ? "glass-panel" : "modal-content"}
      style={{
        padding: isFullView ? '32px' : '28px',
        color: '#f8fafc',
        maxWidth: isFullView ? '100%' : '580px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030712',
              boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
            }}
          >
            <ArrowLeftRight size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                Relay.link Bridge & Swap
              </h2>
              <span
                className="tag-badge"
                style={{
                  background: 'rgba(16, 185, 129, 0.16)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                }}
              >
                Instant (~2s)
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Convert any token from Base, Arbitrum, or Solana into native Arc USDC gas.
            </p>
          </div>
        </div>

        {!isFullView && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Target Notice Banner */}
      <div
        className="apple-card"
        style={{
          padding: '14px 18px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.06) 0%, rgba(121, 40, 202, 0.06) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#00f0ff" />
          <span style={{ fontSize: '0.85rem', color: 'white' }}>
            Destination: <strong style={{ color: '#00f0ff' }}>Arc Mainnet (Chain 5042)</strong>
          </span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Output Token: <strong style={{ color: '#38bdf8' }}>Native USDC (Gas Token)</strong>
        </div>
      </div>

      {/* Origin Chain Selector */}
      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          From Origin Chain:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '8px' }}>
          {SUPPORTED_CHAINS.map((chain) => {
            const isSelected = selectedChain.id === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => {
                  setSelectedChain(chain);
                  if (chain.isSolana) setSelectedToken('SOL');
                  else if (selectedToken === 'SOL') setSelectedToken('USDC');
                }}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(0, 240, 255, 0.16)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#00f0ff' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{chain.icon}</span>
                <span>{chain.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount and Token input */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            Amount to Bridge:
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['5', '10', '25', '50'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                style={{
                  background: amount === preset ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: amount === preset ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: amount === preset ? '#00f0ff' : 'var(--text-dim)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                }}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.5"
            step="any"
            placeholder="10.0"
            className="mono"
            style={{
              flex: 1,
              background: 'rgba(8, 14, 28, 0.9)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '1.05rem',
              color: 'white',
              outline: 'none',
            }}
          />

          {!selectedChain.isSolana && (
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              style={{
                background: 'rgba(8, 14, 28, 0.9)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0 14px',
                fontSize: '0.88rem',
                color: '#00f0ff',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">{selectedChain.symbol}</option>
            </select>
          )}
        </div>
      </div>

      {/* Recipient Wallet Display */}
      <div
        className="apple-card"
        style={{
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>Receiving Arc Address:</span>
        <span className="mono" style={{ color: account ? '#00f0ff' : '#f59e0b', fontWeight: '600' }}>
          {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : 'Connect wallet to autofill'}
        </span>
      </div>

      {/* Live Quote Breakdown Card */}
      <div
        className="apple-card"
        style={{
          padding: '18px 20px',
          marginBottom: '24px',
          background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.04) 0%, rgba(121, 40, 202, 0.03) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.22)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            <Sparkles size={14} color="#00f0ff" />
            <span>Relay Instant Route Quote</span>
          </span>
          {isLoadingQuote && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#00f0ff' }}>
              <RefreshCw size={12} className="spin-animation" />
              <span>Fetching live quote...</span>
            </div>
          )}
        </div>

        {quoteData ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>You Receive on Arc:</span>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#30d158', letterSpacing: '-0.02em' }}>
                ~{Number(quoteData.details?.currencyOut?.amountFormatted || amount).toFixed(4)} USDC
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
              <span>Bridge Speed:</span>
              <span style={{ color: '#00f0ff', fontWeight: '600' }}>~2 to 5 seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <span>Total Relay Fee:</span>
              <span style={{ color: 'white', fontWeight: '500' }}>
                ${Number(quoteData.fees?.relayer?.amountUsd || '0.05').toFixed(2)}
              </span>
            </div>
          </div>
        ) : quoteError ? (
          <div style={{ fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} />
            <span>{quoteError}</span>
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Enter amount to see live output quote and gas conversion.
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a
          href={getRelayUrl()}
          target="_blank"
          rel="noreferrer"
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textDecoration: 'none',
            padding: '14px',
            fontSize: '0.98rem',
            background: 'linear-gradient(135deg, #00f0ff 0%, #0066ff 50%, #7928ca 100%)',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
          }}
        >
          <ArrowLeftRight size={18} />
          <span>Launch Bridge on Relay.link</span>
          <ExternalLink size={16} />
        </a>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
            Powered by Relay Protocol (Official Arc Partner)
          </span>
          {onSuccessRefresh && (
            <button
              onClick={onSuccessRefresh}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00f0ff',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh Balance After Bridging</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isFullView) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {content}
    </div>
  );
}
