import React, { useState } from 'react';
import {
  Terminal,
  Rocket,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
  ArrowLeftRight,
  Wallet,
  AlertTriangle,
  RefreshCw,
  Coins
} from 'lucide-react';
import { ARC_MAINNET, ARC_TESTNET } from '../config/constants';

export function ContractDeployer({
  account,
  isArc,
  targetNetwork,
  deployedContractAddress,
  setCustomContract,
  resetContract,
  deployFreshContract,
  connectWallet,
  switchNetwork,
  balance = '0.00',
  arcBalance = '0.00',
  isSwitchingNetwork,
  reloadBalance,
  openRelayBridge,
}) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState('');
  const [pendingTxHash, setPendingTxHash] = useState('');
  const [deployResult, setDeployResult] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isCustom = deployedContractAddress !== targetNetwork.defaultContract;
  const activeBalance = isArc ? balance : arcBalance;
  const numBalance = Number(activeBalance);
  const hasLowBalance = numBalance <= 0.0001;

  const handleDeploy = async () => {
    setErrorMsg('');
    setDeployResult(null);
    setPendingTxHash('');
    setIsDeploying(true);
    setDeployStep('Initializing deployment...');

    try {
      if (!account) {
        setDeployStep('Please connect your wallet...');
        await connectWallet();
      }

      if (!isArc) {
        setDeployStep(`Switching network to ${targetNetwork.name}...`);
        await switchNetwork();
      }

      const res = await deployFreshContract((msg, txHash) => {
        setDeployStep(msg);
        if (txHash) setPendingTxHash(txHash);
      });
      setDeployResult(res);
      setDeployStep('');
    } catch (err) {
      console.error('Deployment failure:', err);
      setErrorMsg(err.reason || err.message || 'Deployment failed on Arc Network.');
      setDeployStep('');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleManualSave = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress.trim())) {
      setErrorMsg('Invalid contract address format (must be 0x followed by 40 hex chars).');
      return;
    }
    setCustomContract(manualAddress.trim());
    setManualAddress('');
    setErrorMsg('');
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '400', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.01em' }}>
          <Zap size={22} color="#00f0ff" />
          <span>Arc Network Contract Deployer & Instance Router</span>
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Deploy your dedicated ArcSplit instance directly from your browser wallet. Arc’s native USDC gas makes deployment cost pennies.
        </p>
      </div>

      {/* Pre-Flight Checklist Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        {/* Wallet Status */}
        <div className="apple-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '6px' }}>1. Connected Wallet</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: '0.86rem', color: account ? '#34d399' : '#f59e0b', fontWeight: '600' }}>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
            </span>
            {!account && (
              <button onClick={connectWallet} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Network Status */}
        <div className="apple-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '6px' }}>2. Target Network</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.86rem', color: isArc ? '#00f0ff' : '#f59e0b', fontWeight: '600' }}>
              {targetNetwork.name}
            </span>
            {account && !isArc && (
              <button onClick={() => switchNetwork()} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Gas Balance */}
        <div className="apple-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>3. Native USDC Gas (Arc)</span>
            {reloadBalance && (
              <button onClick={reloadBalance} title="Refresh balance" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <RefreshCw size={11} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.88rem', color: hasLowBalance ? '#f59e0b' : '#34d399', fontWeight: '700' }}>
              {activeBalance} USDC
            </span>
            {openRelayBridge && (
              <button
                onClick={openRelayBridge}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 9px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00f0ff',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600'
                }}
              >
                <ArrowLeftRight size={11} />
                <span>Bridge</span>
              </button>
            )}
          </div>
        </div>

        {/* Bytecode Status */}
        <div className="apple-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '6px' }}>4. Bytecode Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={15} color="#10b981" />
            <span style={{ fontSize: '0.86rem', color: '#10b981', fontWeight: '600' }}>
              ArcSplit v1.0 Audited
            </span>
          </div>
        </div>
      </div>

      {/* Active Contract Card */}
      <div
        className="apple-card"
        style={{
          padding: '20px 22px',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            Active ArcSplit Instance ({targetNetwork.name})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="tag-badge"
              style={{
                background: isCustom ? 'rgba(168, 85, 247, 0.16)' : 'rgba(0, 240, 255, 0.12)',
                color: isCustom ? '#c084fc' : '#00f0ff',
                border: isCustom ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid rgba(0, 240, 255, 0.28)',
              }}
            >
              {isCustom ? 'Custom Instance' : 'Reference Instance'}
            </span>
            {isCustom && (
              <button
                onClick={resetContract}
                style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Reset to default reference contract"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span className="mono" style={{ fontSize: '0.88rem', color: '#f8fafc', wordBreak: 'break-all' }}>
            {deployedContractAddress}
          </span>
          <a
            href={`${targetNetwork.explorerUrl}/address/${deployedContractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <ExternalLink size={13} />
            <span>View on Explorer</span>
          </a>
        </div>
      </div>

      {/* 1-Click Deploy Section */}
      <div
        className="apple-card"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '26px',
          background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.04) 0%, rgba(121, 40, 202, 0.04) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          marginBottom: '26px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={20} color="#00f0ff" />
              <span>1-Click Deploy from Browser</span>
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '520px' }}>
              Instantly deploys <code className="mono" style={{ color: '#00f0ff' }}>ArcSplit.sol</code> bytecode to {targetNetwork.name}. Gas is paid natively in USDC (~$0.05–$0.15 USDC).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!account ? (
              <button
                onClick={connectWallet}
                className="btn-primary"
                style={{ padding: '12px 22px', fontSize: '0.92rem' }}
              >
                <Wallet size={17} />
                <span>Connect Wallet to Deploy</span>
              </button>
            ) : !isArc ? (
              <button
                onClick={() => switchNetwork()}
                className="btn-primary"
                style={{
                  padding: '12px 22px',
                  fontSize: '0.92rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                }}
              >
                <AlertTriangle size={17} />
                <span>Switch to {targetNetwork.name}</span>
              </button>
            ) : (
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="btn-primary"
                style={{
                  padding: '12px 22px',
                  fontSize: '0.92rem',
                  opacity: isDeploying ? 0.8 : 1,
                }}
              >
                {isDeploying ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 0, 0, 0.3)',
                        borderTopColor: '#000',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span>Deploying to Arc...</span>
                  </>
                ) : (
                  <>
                    <Rocket size={17} />
                    <span>Deploy to {targetNetwork.name}</span>
                  </>
                )}
              </button>
            )}

            {hasLowBalance && openRelayBridge && (
              <button
                onClick={openRelayBridge}
                className="btn-secondary"
                style={{
                  padding: '12px 18px',
                  fontSize: '0.92rem',
                  border: '1px solid rgba(0, 240, 255, 0.5)',
                  background: 'rgba(0, 240, 255, 0.1)',
                  color: '#00f0ff',
                }}
              >
                <ArrowLeftRight size={16} />
                <span>Bridge Gas with Relay</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Step Tracker during deploy */}
        {isDeploying && deployStep && (
          <div
            className="apple-card"
            style={{
              marginTop: '18px',
              padding: '14px 18px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00f0ff',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={15} className="spin-animation" />
              <span>{deployStep}</span>
            </div>

            {pendingTxHash && (
              <a
                href={`${targetNetwork.explorerUrl}/tx/${pendingTxHash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                }}
              >
                <span>View Pending Tx</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {/* Deploy Success feedback */}
        {deployResult && (
          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', marginBottom: '6px' }}>
              <CheckCircle size={17} />
              <span>Deployment Confirmed on Arc!</span>
            </div>
            <div className="mono" style={{ fontSize: '0.85rem', color: '#f8fafc', marginBottom: '8px', wordBreak: 'break-all' }}>
              Contract: {deployResult.address}
            </div>
            <a
              href={deployResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.82rem', color: '#00f0ff', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View Verified Contract on Arc Explorer</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Error Alert with Quick Help & Relay Bridge Link */}
        {errorMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.84rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Deployment Notice:</div>
                <div style={{ lineHeight: '1.4' }}>{errorMsg}</div>
                {errorMsg.toLowerCase().includes('usdc') || errorMsg.toLowerCase().includes('balance') || errorMsg.toLowerCase().includes('gas') ? (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={openRelayBridge}
                      className="btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
                      }}
                    >
                      <ArrowLeftRight size={13} />
                      <span>Open Relay.link Bridge to get Arc USDC Gas</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Relay.link Quick Bridge Callout Card */}
      <div
        className="apple-card"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(121, 40, 202, 0.08) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          padding: '20px 22px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030712',
              boxShadow: '0 4px 14px rgba(0, 240, 255, 0.3)',
            }}
          >
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Need Arc Gas or USDC? Swap & Bridge via Relay.link</span>
              <span className="tag-badge" style={{ background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                Instant (~2s)
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Bridge assets directly from Base, Arbitrum, Ethereum, or Solana into Arc Native USDC gas in seconds.
            </div>
          </div>
        </div>

        <button
          onClick={openRelayBridge}
          className="btn-primary"
          style={{
            padding: '9px 18px',
            fontSize: '0.85rem',
          }}
        >
          <ArrowLeftRight size={14} />
          <span>Launch Relay Bridge</span>
        </button>
      </div>

      {/* Manual Address Input & CLI snippet */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Or Link an Existing Deployed Address:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="0x..."
              className="mono"
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button onClick={handleManualSave} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '9px 18px' }}>
              Set Active
            </button>
          </div>
        </div>

        <div className="apple-card" style={{ padding: '16px 18px', background: 'rgba(0, 0, 0, 0.45)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Terminal size={14} color="#00f0ff" />
            <span style={{ fontWeight: '600' }}>CLI Deployment (Alternative for CI / Automated Agents):</span>
          </div>
          <pre className="mono" style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, overflowX: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            node scripts/deploy.cjs --network mainnet --private-key 0xYOUR_KEY
          </pre>
        </div>
      </div>
    </div>
  );
}
