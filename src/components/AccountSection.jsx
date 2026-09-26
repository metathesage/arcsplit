import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  CreditCard,
  History,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Fingerprint,
  Mail,
  Zap,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Wallet,
  Bookmark
} from 'lucide-react';
import { ARC_MAINNET } from '../config/constants';

export function AccountSection({
  account,
  balance,
  arcBalance,
  isArc,
  targetNetwork,
  connectWallet,
  onLoadRecipientsToSplitter,
}) {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('arcsplit_user_name') || ''
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Passkey Simulation State
  const [passkeyEmail, setPasskeyEmail] = useState('');
  const [passkeyStatus, setPasskeyStatus] = useState('idle'); // idle | creating | created
  const [createdPasskeyWallet, setCreatedPasskeyWallet] = useState(
    () => localStorage.getItem('arcsplit_passkey_wallet') || null
  );

  // Address Book state
  const [addressBook, setAddressBook] = useState(() => {
    try {
      const saved = localStorage.getItem('arcsplit_address_book');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: '1', name: 'Lead Developer', address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', share: 50 },
      { id: '2', name: 'AI Swarm Worker', address: '0x8004A818BFB912233c491871b3d84c89A494BD9e', share: 30 },
      { id: '3', name: 'Treasury Reserve', address: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', share: 20 },
    ];
  });
  const [newContactName, setNewContactName] = useState('');
  const [newContactAddr, setNewContactAddr] = useState('');
  const [newContactShare, setNewContactShare] = useState('25');

  // Split history from localStorage
  const [splitHistory, setSplitHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('arcsplit_payment_history');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: 'tx-1',
        txHash: '0xee3190065aa156c9945abdb900de8aaf021463ff3e811b5b2c3a19ba28b91500',
        amount: '10.00',
        recipientsCount: 2,
        memo: 'Genesis ArcSplit Launch Bounty',
        timestamp: '2026-09-25T21:22:00Z',
      },
    ];
  });

  const handleSaveName = () => {
    setUserName(nameInput.trim());
    localStorage.setItem('arcsplit_user_name', nameInput.trim());
    setIsEditingName(false);
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  // Passkey Creation simulation via Circle Developer Services mock
  const handleCreatePasskey = () => {
    if (!passkeyEmail || !passkeyEmail.includes('@')) {
      alert('Please enter a valid email address for Passkey registration.');
      return;
    }
    setPasskeyStatus('creating');
    setTimeout(() => {
      const mockAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setCreatedPasskeyWallet(mockAddr);
      localStorage.setItem('arcsplit_passkey_wallet', mockAddr);
      setPasskeyStatus('created');
    }, 1200);
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !/^0x[a-fA-F0-9]{40}$/.test(newContactAddr.trim())) {
      alert('Please enter a contact label and a valid 0x Ethereum address.');
      return;
    }
    const updated = [
      ...addressBook,
      {
        id: Date.now().toString(),
        name: newContactName.trim(),
        address: newContactAddr.trim(),
        share: Number(newContactShare) || 25,
      },
    ];
    setAddressBook(updated);
    localStorage.setItem('arcsplit_address_book', JSON.stringify(updated));
    setNewContactName('');
    setNewContactAddr('');
  };

  const handleDeleteContact = (id) => {
    const updated = addressBook.filter((c) => c.id !== id);
    setAddressBook(updated);
    localStorage.setItem('arcsplit_address_book', JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Transaction Hash', 'Amount (USDC)', 'Recipients', 'Memo', 'Date'],
      ...splitHistory.map((item) => [
        item.txHash,
        item.amount,
        item.recipientsCount,
        `"${item.memo}"`,
        item.timestamp,
      ]),
    ];
    const blob = new Blob([csvRows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arcsplit-history-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f0ff',
                border: '1px solid rgba(0, 240, 255, 0.25)',
              }}
            >
              <User size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: '400', color: 'white', letterSpacing: '-0.01em' }}>
              Account Hub & Circle Passkey Profiles
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Manage your verified payout profile, address book, execution logs, and gasless Circle Developer Wallets.
          </p>
        </div>
      </div>

      {/* Grid: Profile Card & Circle Passkey Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Profile Card */}
        <div className="reso-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #00f0ff 0%, #7928ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#030712',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
              }}
            >
              {userName ? userName.slice(0, 2).toUpperCase() : '⚡'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter display name"
                      style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                    />
                    <button onClick={handleSaveName} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
                      {userName || 'Anonymous Splitter'}
                    </h3>
                    <button
                      onClick={() => setIsEditingName(true)}
                      style={{ fontSize: '0.7rem', color: '#00f0ff', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      [Edit]
                    </button>
                  </>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Arc Network Genesis User
              </div>
            </div>
          </div>

          {/* Wallet Address & Balance */}
          {account ? (
            <div style={{ background: 'rgba(0, 0, 0, 0.45)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>CONNECTED ADDRESS</span>
                <button
                  onClick={() => copyAddress(account)}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {copiedAddr ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedAddr ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="mono" style={{ fontSize: '0.78rem', color: '#ffffff', wordBreak: 'break-all' }}>
                {account}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Arc USDC Gas Balance:</span>
                <span className="mono" style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: '700' }}>
                  {balance} USDC
                </span>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginBottom: '8px' }}>
                No Web3 wallet currently connected.
              </div>
              <button onClick={connectWallet} className="btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                <Wallet size={12} />
                <span>Connect Wallet</span>
              </button>
            </div>
          )}

          {/* User Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span className="tag-badge" style={{ background: 'rgba(0, 240, 255, 0.12)', color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
              ⚡ Arc Pioneer
            </span>
            <span className="tag-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              🛡️ Non-Custodial
            </span>
            <span className="tag-badge" style={{ background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
              🤖 Agent Operator
            </span>
          </div>
        </div>

        {/* Circle Programmable Wallets / Passkey Signup Card */}
        <div
          className="reso-card"
          style={{
            borderColor: 'rgba(192, 132, 252, 0.3)',
            background: 'linear-gradient(180deg, rgba(14, 18, 32, 0.85) 0%, rgba(20, 15, 30, 0.85) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Fingerprint size={20} color="#c084fc" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff' }}>
              Circle Passkey Onboarding (WebAuthn)
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
            Powered by Circle Developer Services. Create an instant, non-custodial smart contract wallet using FaceID or TouchID—zero browser extension needed.
          </p>

          {createdPasskeyWallet ? (
            <div style={{ background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.35)', padding: '12px 14px', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
                <CheckCircle size={14} />
                <span>Circle Passkey Wallet Active</span>
              </div>
              <div className="mono" style={{ fontSize: '0.74rem', color: '#ffffff', wordBreak: 'break-all' }}>
                {createdPasskeyWallet}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                Gas Sponsored via Circle Paymaster on Arc L1
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="email"
                  value={passkeyEmail}
                  onChange={(e) => setPasskeyEmail(e.target.value)}
                  placeholder="Enter email for Passkey auth"
                  style={{ flex: 1, fontSize: '0.82rem', padding: '8px 12px' }}
                />
                <button
                  onClick={handleCreatePasskey}
                  disabled={passkeyStatus === 'creating'}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #c084fc 0%, #0077ff 100%)',
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Key size={13} />
                  <span>{passkeyStatus === 'creating' ? 'Signing...' : 'Create Passkey'}</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <Shield size={12} color="#34d399" />
                <span>100% Non-custodial MPC key-shares backed by Circle</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Book & Team Directory */}
      <div className="reso-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
              Beneficiary Address Book & Swarm Directory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Save team members, co-founders, and AI agent endpoints to instantly populate payouts.
            </p>
          </div>
          {onLoadRecipientsToSplitter && (
            <button
              onClick={() => onLoadRecipientsToSplitter(addressBook)}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              <span>Load Team into Splitter</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {/* Contact List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {addressBook.map((contact) => (
            <div
              key={contact.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff' }}>{contact.name}</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{contact.address}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="mono" style={{ fontSize: '0.76rem', color: '#00f0ff', background: 'rgba(0, 240, 255, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                  Default {contact.share}%
                </span>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  title="Remove contact"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Contact Row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px dashed rgba(255, 255, 255, 0.08)' }}>
          <input
            type="text"
            placeholder="Label (e.g. Frontend Dev)"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            style={{ flex: 1, minWidth: '140px', fontSize: '0.82rem', padding: '7px 12px' }}
          />
          <input
            type="text"
            placeholder="0x Address"
            value={newContactAddr}
            onChange={(e) => setNewContactAddr(e.target.value)}
            style={{ flex: 2, minWidth: '220px', fontSize: '0.82rem', padding: '7px 12px' }}
          />
          <input
            type="number"
            placeholder="Share %"
            value={newContactShare}
            onChange={(e) => setNewContactShare(e.target.value)}
            style={{ width: '80px', fontSize: '0.82rem', padding: '7px 10px' }}
          />
          <button onClick={handleAddContact} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Split History & Tax Export */}
      <div className="reso-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff' }}>
              Execution Activity & Split History
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              On-chain records of splits and tip jars routed through ArcSplit.
            </p>
          </div>
          <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {splitHistory.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#ffffff' }}>
                  {item.memo}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {item.txHash ? `${item.txHash.slice(0, 10)}...${item.txHash.slice(-8)}` : 'Internal Tx'}
                  </span>
                  <a
                    href={`${ARC_MAINNET.explorerUrl}/tx/${item.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#00f0ff', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>Explorer</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '0.94rem', fontWeight: '700', color: '#00f0ff' }}>
                  {item.amount} USDC
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {item.recipientsCount} Recipients • {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
