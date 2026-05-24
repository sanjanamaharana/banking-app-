import React, { useEffect, useState } from 'react';
import { transactionAPI, accountAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm]         = useState({ fromAccountId:'', toAccountNumber:'', amount:'', description:'' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(null);

  useEffect(() => { accountAPI.getAll().then(r => setAccounts(r.data.accounts)); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.fromAccountId || !form.toAccountNumber || !form.amount) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      const res = await transactionAPI.transfer({ ...form, amount: Number(form.amount) });
      setSuccess(res.data);
      toast.success('Transfer successful!');
      setForm({ fromAccountId:'', toAccountNumber:'', amount:'', description:'' });
      // refresh accounts
      accountAPI.getAll().then(r => setAccounts(r.data.accounts));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Transfer Money</h2>
      <div style={styles.layout}>
        {/* Form */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📤 Send Funds</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>From Account *</label>
              <select style={styles.input} name="fromAccountId" value={form.fromAccountId} onChange={handleChange} required>
                <option value="">Select your account</option>
                {accounts.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.accountNumber} — {a.accountType} (${a.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>To Account Number *</label>
              <input style={styles.input} name="toAccountNumber" value={form.toAccountNumber}
                onChange={handleChange} placeholder="e.g. ACC12345678" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Amount (USD) *</label>
              <div style={styles.amountWrap}>
                <span style={styles.dollar}>$</span>
                <input style={styles.amountInput} name="amount" type="number" min="0.01"
                  step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <input style={styles.input} name="description" value={form.description}
                onChange={handleChange} placeholder="e.g. Rent payment" />
            </div>
            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Processing Transfer...' : '📤 Send Money'}
            </button>
          </form>
        </div>

        {/* Info + Success */}
        <div style={styles.right}>
          {success && (
            <div style={styles.successCard}>
              <div style={styles.successIcon}>✅</div>
              <h4 style={styles.successTitle}>Transfer Complete!</h4>
              <div style={styles.successRow}><span>Amount</span><strong>${success.transaction?.amount?.toFixed(2)}</strong></div>
              <div style={styles.successRow}><span>New Balance</span><strong>${success.newBalance?.toFixed(2)}</strong></div>
              <div style={styles.successRow}><span>Reference</span><code style={styles.code}>{success.transaction?.reference}</code></div>
            </div>
          )}
          <div style={styles.infoCard}>
            <h4 style={styles.infoTitle}>ℹ️ Transfer Info</h4>
            <ul style={styles.infoList}>
              <li>Transfers are instant within SecureBank</li>
              <li>No fees for internal transfers</li>
              <li>Minimum transfer: $0.01</li>
              <li>Recipient must have an active account</li>
              <li>You cannot transfer to your own account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:        { maxWidth:900, margin:'0 auto' },
  heading:     { color:'#f1f5f9', fontSize:22, fontWeight:700, marginBottom:24 },
  layout:      { display:'grid', gridTemplateColumns:'1fr 320px', gap:20 },
  card:        { background:'#1e293b', borderRadius:12, padding:28 },
  cardTitle:   { color:'#f1f5f9', fontWeight:700, fontSize:18, marginBottom:24 },
  form:        { display:'flex', flexDirection:'column', gap:18 },
  field:       { display:'flex', flexDirection:'column', gap:6 },
  label:       { color:'#94a3b8', fontSize:13, fontWeight:500 },
  input:       { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none' },
  amountWrap:  { display:'flex', alignItems:'center', background:'#0f172a', border:'1px solid #334155', borderRadius:8 },
  dollar:      { padding:'0 12px', color:'#64748b', fontSize:18, fontWeight:700 },
  amountInput: { flex:1, background:'transparent', border:'none', padding:'11px 14px 11px 0', color:'#f1f5f9', fontSize:18, fontWeight:700, outline:'none' },
  submitBtn:   { background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:14, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4 },
  right:       { display:'flex', flexDirection:'column', gap:16 },
  successCard: { background:'#052e16', border:'1px solid #16a34a', borderRadius:12, padding:24 },
  successIcon: { fontSize:32, textAlign:'center', marginBottom:12 },
  successTitle:{ color:'#4ade80', textAlign:'center', fontWeight:700, marginBottom:16 },
  successRow:  { display:'flex', justifyContent:'space-between', color:'#86efac', fontSize:14, marginBottom:8 },
  code:        { fontFamily:'monospace', fontSize:12, color:'#4ade80' },
  infoCard:    { background:'#1e293b', borderRadius:12, padding:24 },
  infoTitle:   { color:'#f1f5f9', fontWeight:700, marginBottom:14 },
  infoList:    { color:'#94a3b8', fontSize:13, paddingLeft:18, lineHeight:2 },
};
