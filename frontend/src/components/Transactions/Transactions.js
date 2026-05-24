import React, { useEffect, useState } from 'react';
import { transactionAPI, accountAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState({ type:'', startDate:'', endDate:'' });
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [modal, setModal]               = useState(null); // 'deposit' | 'withdraw'
  const [form, setForm]                 = useState({ accountId:'', amount:'', description:'', category:'other' });
  const [submitting, setSubmitting]     = useState(false);

  const loadTxns = (p = 1) => {
    setLoading(true);
    transactionAPI.getAll({ page: p, limit:15, ...filter })
      .then(r => { setTransactions(r.data.transactions); setTotalPages(r.data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { accountAPI.getAll().then(r => setAccounts(r.data.accounts)); }, []);
  useEffect(() => { loadTxns(page); }, [page]);

  const applyFilter = () => { setPage(1); loadTxns(1); };

  const submit = async () => {
    if (!form.accountId || !form.amount) return toast.error('Fill all required fields');
    setSubmitting(true);
    try {
      if (modal === 'deposit')  await transactionAPI.deposit({ ...form, amount: Number(form.amount) });
      if (modal === 'withdraw') await transactionAPI.withdraw({ ...form, amount: Number(form.amount) });
      toast.success(`${modal === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
      setModal(null);
      setForm({ accountId:'', amount:'', description:'', category:'other' });
      loadTxns(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const typeColor = { deposit:'#10b981', withdrawal:'#ef4444', transfer:'#3b82f6', payment:'#f59e0b' };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={styles.heading}>Transactions</h2>
        <div style={styles.actions}>
          <button style={styles.greenBtn} onClick={() => setModal('deposit')}>⬇ Deposit</button>
          <button style={styles.redBtn}   onClick={() => setModal('withdraw')}>⬆ Withdraw</button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={styles.filterInput} value={filter.type} onChange={e => setFilter({...filter, type:e.target.value})}>
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
        <input style={styles.filterInput} type="date" value={filter.startDate} onChange={e => setFilter({...filter,startDate:e.target.value})} />
        <input style={styles.filterInput} type="date" value={filter.endDate}   onChange={e => setFilter({...filter,endDate:e.target.value})} />
        <button style={styles.filterBtn} onClick={applyFilter}>Apply</button>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Reference','Type','Amount','Description','Date','Status'].map(h =>
                <th key={h} style={styles.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={styles.loading}>Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} style={styles.loading}>No transactions found.</td></tr>
            ) : transactions.map(txn => (
              <tr key={txn._id} style={styles.tr}>
                <td style={styles.td}><span style={styles.ref}>{txn.reference}</span></td>
                <td style={styles.td}><span style={{...styles.typeBadge, background:`${typeColor[txn.type]}22`, color:typeColor[txn.type]}}>{txn.type}</span></td>
                <td style={{...styles.td, color: txn.type==='deposit'?'#10b981':'#ef4444', fontWeight:700}}>
                  {txn.type==='deposit'?'+':'-'}${txn.amount.toFixed(2)}
                </td>
                <td style={styles.td}>{txn.description || '—'}</td>
                <td style={styles.td}>{new Date(txn.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}><span style={styles.status}>{txn.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
        <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button style={styles.pageBtn} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
      </div>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{modal==='deposit'?'💵 Make a Deposit':'💸 Withdraw Funds'}</h3>
            <div style={styles.field}>
              <label style={styles.label}>Account</label>
              <select style={styles.input} value={form.accountId} onChange={e=>setForm({...form,accountId:e.target.value})}>
                <option value="">Select account</option>
                {accounts.map(a=><option key={a._id} value={a._id}>{a.accountNumber} (${a.balance.toFixed(2)})</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Amount ($)</label>
              <input style={styles.input} type="number" min="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <input style={styles.input} type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Optional note" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {['food','utilities','entertainment','transfer','salary','other'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={()=>setModal(null)}>Cancel</button>
              <button style={modal==='deposit'?styles.greenBtn:styles.redBtn} onClick={submit} disabled={submitting}>
                {submitting?'Processing...':(modal==='deposit'?'Deposit':'Withdraw')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:       { maxWidth:1100, margin:'0 auto' },
  topbar:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  heading:    { color:'#f1f5f9', fontSize:22, fontWeight:700 },
  actions:    { display:'flex', gap:10 },
  greenBtn:   { background:'#10b981', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', cursor:'pointer', fontWeight:600, fontSize:13 },
  redBtn:     { background:'#ef4444', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', cursor:'pointer', fontWeight:600, fontSize:13 },
  filters:    { display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' },
  filterInput:{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'8px 12px', color:'#f1f5f9', fontSize:13 },
  filterBtn:  { background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer' },
  tableWrap:  { background:'#1e293b', borderRadius:12, overflow:'hidden' },
  table:      { width:'100%', borderCollapse:'collapse' },
  thead:      { background:'#0f172a' },
  th:         { color:'#64748b', padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 },
  tr:         { borderBottom:'1px solid #334155' },
  td:         { color:'#f1f5f9', padding:'12px 16px', fontSize:13 },
  loading:    { color:'#64748b', padding:40, textAlign:'center' },
  ref:        { fontFamily:'monospace', color:'#64748b', fontSize:12 },
  typeBadge:  { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, textTransform:'uppercase' },
  status:     { color:'#10b981', fontSize:12 },
  pagination: { display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:20 },
  pageBtn:    { background:'#1e293b', border:'1px solid #334155', color:'#f1f5f9', padding:'8px 16px', borderRadius:8, cursor:'pointer' },
  pageInfo:   { color:'#94a3b8', fontSize:14 },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal:      { background:'#1e293b', borderRadius:16, padding:32, width:400 },
  modalTitle: { color:'#f1f5f9', fontWeight:700, marginBottom:20, fontSize:18 },
  field:      { marginBottom:16 },
  label:      { color:'#94a3b8', fontSize:13, display:'block', marginBottom:6 },
  input:      { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'10px 14px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' },
  modalBtns:  { display:'flex', gap:10, marginTop:8 },
  cancelBtn:  { flex:1, padding:10, background:'#334155', border:'none', borderRadius:8, color:'#f1f5f9', cursor:'pointer' },
};
