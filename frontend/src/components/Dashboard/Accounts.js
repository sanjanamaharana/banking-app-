import React, { useEffect, useState } from 'react';
import { accountAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType]   = useState('savings');
  const [creating, setCreating] = useState(false);

  const load = () => {
    accountAPI.getAll().then(r => setAccounts(r.data.accounts)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAccount = async () => {
    setCreating(true);
    try {
      await accountAPI.create({ accountType: newType });
      toast.success('New account opened!');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  };

  const typeConfig = {
    savings:       { color: '#B45309', bg: '#FFFBEB', border: '#F59E0B', label: 'Savings' },
    checking:      { color: '#065F46', bg: '#ECFDF5', border: '#10B981', label: 'Checking' },
    fixed_deposit: { color: '#7C3AED', bg: '#F5F3FF', border: '#8B5CF6', label: 'Fixed Deposit' },
  };

  if (loading) return <div style={styles.loading}>Loading accounts...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Overview</p>
          <h2 style={styles.heading}>My Accounts</h2>
        </div>
        <button style={styles.newBtn} onClick={() => setShowModal(true)}>+ Open New Account</button>
      </div>

      <div style={styles.grid}>
        {accounts.map(acc => {
          const cfg = typeConfig[acc.accountType] || typeConfig.savings;
          return (
            <div key={acc._id} style={{ ...styles.card, borderTop: `3px solid ${cfg.border}` }}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.typePill, background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
                <span style={styles.badge}>Active</span>
              </div>

              <div style={styles.balanceRow}>
                <span style={styles.currencySign}>$</span>
                <span style={styles.balance}>{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <p style={styles.currency}>{acc.currency}</p>

              <div style={styles.divider} />

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Account No.</span>
                  <span style={styles.infoVal}>{acc.accountNumber}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Interest Rate</span>
                  <span style={styles.infoVal}>{acc.interestRate}% p.a.</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Opened</span>
                  <span style={styles.infoVal}>{new Date(acc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Open New Account</h3>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p style={styles.modalSubtitle}>Choose the type of account you'd like to open.</p>

            <div style={styles.typeOptions}>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <div
                  key={key}
                  onClick={() => setNewType(key)}
                  style={{
                    ...styles.typeOption,
                    border: newType === key
                      ? `2px solid ${cfg.border}`
                      : '2px solid #E2E8F0',
                    background: newType === key ? cfg.bg : '#fff',
                  }}
                >
                  <span style={{ ...styles.typeOptionLabel, color: newType === key ? cfg.color : '#64748B' }}>
                    {cfg.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={openAccount} disabled={creating}>
                {creating ? 'Opening…' : 'Open Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:         { maxWidth: 1020, margin: '0 auto', padding: '0 4px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 },
  eyebrow:      { color: '#94A3B8', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' },
  heading:      { color: '#0F172A', fontSize: 24, fontWeight: 700, margin: 0 },
  loading:      { color: '#94A3B8', padding: 40, textAlign: 'center' },
  newBtn:       {
    background: '#0F172A', color: '#F8FAFC', border: 'none',
    borderRadius: 10, padding: '11px 20px', cursor: 'pointer',
    fontWeight: 600, fontSize: 14, letterSpacing: '0.01em',
    transition: 'opacity .15s',
  },

  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 },

  card:         {
    background: '#FFFFFF', borderRadius: 14, padding: '22px 24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
  },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  typePill:     {
    fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
    padding: '4px 10px', borderRadius: 20,
  },
  badge:        {
    fontSize: 11, fontWeight: 600, color: '#059669',
    background: '#ECFDF5', padding: '3px 9px', borderRadius: 20,
    letterSpacing: '0.04em',
  },

  balanceRow:   { display: 'flex', alignItems: 'baseline', gap: 3 },
  currencySign: { color: '#94A3B8', fontSize: 18, fontWeight: 600, lineHeight: 1 },
  balance:      { color: '#0F172A', fontSize: 34, fontWeight: 800, lineHeight: 1 },
  currency:     { color: '#94A3B8', fontSize: 13, margin: '6px 0 18px' },

  divider:      { borderTop: '1px solid #F1F5F9', margin: '0 0 16px' },

  infoGrid:     { display: 'flex', flexDirection: 'column', gap: 10 },
  infoItem:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:    { color: '#94A3B8', fontSize: 13 },
  infoVal:      { color: '#334155', fontSize: 13, fontWeight: 600 },

  overlay:      {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
    backdropFilter: 'blur(2px)',
  },
  modal:        {
    background: '#FFFFFF', borderRadius: 18, padding: '28px 30px',
    width: 380, boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
  },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle:   { color: '#0F172A', fontSize: 18, fontWeight: 700, margin: 0 },
  closeBtn:     {
    background: 'none', border: 'none', color: '#94A3B8',
    fontSize: 16, cursor: 'pointer', padding: '2px 6px', borderRadius: 6,
  },
  modalSubtitle:{ color: '#64748B', fontSize: 14, margin: '0 0 20px' },

  typeOptions:  { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  typeOption:   {
    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
    transition: 'border-color .15s, background .15s',
  },
  typeOptionLabel: { fontSize: 14, fontWeight: 600 },

  modalBtns:    { display: 'flex', gap: 10 },
  cancelBtn:    {
    flex: 1, padding: '11px 0', background: '#F1F5F9',
    border: 'none', borderRadius: 10, color: '#475569',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  confirmBtn:   {
    flex: 1, padding: '11px 0', background: '#0F172A',
    border: 'none', borderRadius: 10, color: '#fff',
    cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
};