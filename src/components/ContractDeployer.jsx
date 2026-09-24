import React, { useState } from 'react';
import { Terminal, Rocket, CheckCircle, ExternalLink, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
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
}) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isCustom = deployedContractAddress !== targetNetwork.defaultContract;

  const handleDeploy = async () => {
    setErrorMsg('');
    setDeployResult(null);

    if (!account) {
      await connectWallet();
      return;
    }
    if (!isArc) {
      await switchNetwork();
      return;
    }

    setIsDeploying(true);
    try {
      const res = await deployFreshContract();
      setDeployResult(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.reason || err.message || 'Deployment failed on Arc.');
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
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={22} color="#00f0ff" />
          <span>Arc Network Contract Deployer & Instance Router</span>
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Deploy your dedicated ArcSplit instance directly from your browser wallet. Arc’s native USDC gas makes deployment cost pennies.
        </p>
      </div>

      {/* Active Contract Card */}
      <div
        style={{
          background: 'rgba(8, 13, 26, 0.75)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            Active ArcSplit Instance ({targetNetwork.name})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="tag-badge"
              style={{
                background: isCustom ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                color: isCustom ? '#c084fc' : '#00f0ff',
                border: isCustom ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(0, 240, 255, 0.3)',
              }}
            >
              {isCustom ? 'Custom Instance' : 'Reference Instance'}
            </span>
            {isCustom && (
              <button
                onClick={resetContract}
                style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textDecoration: 'underline' }}
                title="Reset to default reference contract"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span className="mono" style={{ fontSize: '0.9rem', color: '#f8fafc', wordBreak: 'break-all' }}>
            {deployedContractAddress}
          </span>
          <a
            href={`${targetNetwork.explorerUrl}/address/${deployedContractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <ExternalLink size={13} />
            <span>View on Explorer</span>
          </a>
        </div>
      </div>

      {/* 1-Click Deploy Section */}
      <div
        style={{
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(121, 40, 202, 0.06) 100%)',
          marginBottom: '24px',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)',
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

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="btn-primary"
            style={{ padding: '12px 22px', fontSize: '0.92rem' }}
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
        </div>

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

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} flexShrink={0} style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '700', marginBottom: '2px' }}>Deployment Notice:</div>
              <div>{errorMsg}</div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Address Input & CLI snippet */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
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
            <button onClick={handleManualSave} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              Set Active
            </button>
          </div>
        </div>

        {/* CLI Deployment Guide snippet */}
        <div
          style={{
            background: 'rgba(5, 8, 16, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Terminal size={16} />
            <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>CLI Deployment Script:</span>
          </div>
          <pre
            className="mono"
            style={{
              fontSize: '0.78rem',
              color: '#00f0ff',
              overflowX: 'auto',
              padding: '8px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {`node scripts/deploy.cjs --network mainnet --private-key <YOUR_PRIVATE_KEY>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
