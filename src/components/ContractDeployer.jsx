import React, { useState } from 'react';
import { Terminal, Rocket, CheckCircle, ExternalLink, RefreshCw, Key, ShieldCheck } from 'lucide-react';
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
      setErrorMsg('Invalid contract address format.');
      return;
    }
    setCustomContract(manualAddress.trim());
    setManualAddress('');
    setErrorMsg('');
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Rocket size={20} color="#10b981" />
          <span>Arc Network Contract Management & 1-Click Deployer</span>
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Deploy your own dedicated, non-custodial ArcSplit instance on Arc Mainnet, or use the pre-deployed reference contract.
        </p>
      </div>

      {/* Current Contract Status */}
      <div
        style={{
          background: 'rgba(10, 16, 30, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            Active ArcSplit Contract ({targetNetwork.name})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="tag-badge"
              style={{
                background: isCustom ? 'rgba(168, 85, 247, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                color: isCustom ? '#c084fc' : '#38bdf8',
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
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
          >
            <ExternalLink size={13} />
            <span>View on Arc Explorer</span>
          </a>
        </div>
      </div>

      {/* 1-Click Deploy Section */}
      <div
        style={{
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          background: 'rgba(16, 185, 129, 0.04)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="#34d399" />
              <span>Deploy Dedicated Contract from Browser</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '520px' }}>
              Deploys the compiled ArcSplit bytecode directly using your connected Web3 wallet. Arc’s sub-cent USDC gas keeps deployment cost negligible (approx. ~$0.05–$0.15 USDC).
            </p>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '10px 18px',
              fontSize: '0.88rem',
            }}
          >
            {isDeploying ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Deploying to Arc...</span>
              </>
            ) : (
              <>
                <Rocket size={16} />
                <span>Deploy to {targetNetwork.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Deploy Success feedback */}
        {deployResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '600', marginBottom: '6px' }}>
              <CheckCircle size={16} />
              <span>Successfully Deployed to Arc!</span>
            </div>
            <div className="mono" style={{ fontSize: '0.82rem', color: '#f8fafc', marginBottom: '6px' }}>
              Address: {deployResult.address}
            </div>
            <a
              href={deployResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View Verified Contract on Explorer</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '12px', color: '#f87171', fontSize: '0.84rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Manual or CLI Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Set Custom Address */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Or Link Existing Contract Address:
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
            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>CLI Deployment with Node.js & Ethers:</span>
          </div>
          <pre
            className="mono"
            style={{
              fontSize: '0.78rem',
              color: '#38bdf8',
              overflowX: 'auto',
              padding: '8px',
              background: 'rgba(0,0,0,0.4)',
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
