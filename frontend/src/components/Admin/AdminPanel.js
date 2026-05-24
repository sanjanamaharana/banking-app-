import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminPanel() {
  const [tab, setTab]          = useState('dashboard');
  const [stats, setStats]      = useState(null);
  const [users, setUsers]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');

  useEffect(() => {
    adminAPI.getDashboard().then(r => { setStats(r.data.stats); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') adminAPI.getUsers({ search }).then(r => setUsers(r.data.users));
    if (tab === 'transactions') adminAPI.getTransactions().then(r => setTransactions(r.data.transactions));
  }, [tab, search]);

  const toggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      toast.success(res.data.message);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div style={styles.loading}>Loading admin data...</div>;

  const txnMap = {};
  (stats?.transactions || []).forEach(t => { txnMap[t._id] = t; });

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>🛡️ Admin Panel</h2>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['dashboard','users','transactions'].map(t => (
          <button key={t} style={{...styles.tab,...(tab===t?styles.activeTab:{})}} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && stats && (
        <div>
          <div style={styles.statsGrid}>
            <StatCard label="Total Customers" value={stats.totalUsers}    icon="👥" color="#3b82f6" />
            <StatCard label="Active Accounts"  value={stats.totalAccounts} icon="💳" color="#10b981" />
            <StatCard label="Total Deposits"   value={`$${(txnMap['deposit']?.total||0).toLocaleString('en-US',{minimumFractionDigits:2})}`} icon="⬇️" color="#f59e0b" />
            <StatCard label="Total Funds"      value={`$${(stats.totalBalance||0).toLocaleString('en-US',{minimumFractionDigits:2})}`} icon="💰" color="#8b5cf6" />
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Transaction Summary</h3>
            <table style={styles.table}>
              <thead><tr style={styles.thead}>
                {['Type','Count','Total Amount'].map(h=><th key={h} style={styles.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {(stats.transactions||[]).map(t => (
                  <tr key={t._id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.typeBadge}>{t._id}</span></td>
                    <td style={styles.td}>{t.count}</td>
                    <td style={styles.td}>${t.total.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={styles.card}>
          <div style={styles.searchRow}>
            <input style={styles.searchInput} placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <table style={styles.table}>
            <thead><tr style={styles.thead}>
              {['Name','Email','Phone','Joined','Status','Action'].map(h=><th key={h} style={styles.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={styles.tr}>
                  <td style={styles.td}>{u.firstName} {u.lastName}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone}</td>
                  <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}><span style={{color: u.isActive?'#10b981':'#ef4444'}}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td style={styles.td}>
                    <button onClick={() => toggleUser(u._id)} style={u.isActive ? styles.deactivateBtn : styles.activateBtn}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead><tr style={styles.thead}>
              {['Reference','Type','Amount','From','To','Date'].map(h=><th key={h} style={styles.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id} style={styles.tr}>
                  <td style={{...styles.td,fontFamily:'monospace',fontSize:11}}>{t.reference}</td>
                  <td style={styles.td}>{t.type}</td>
                  <td style={{...styles.td,fontWeight:700}}>${t.amount.toFixed(2)}</td>
                  <td style={styles.td}>{t.fromAccount?.user?.firstName||'—'}</td>
                  <td style={styles.td}>{t.toAccount?.user?.firstName||'—'}</td>
                  <td style={styles.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{...styles.statCard, borderTop:`3px solid ${color}`}}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statVal}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page:         { maxWidth:1100, margin:'0 auto' },
  headerRow:    { marginBottom:20 },
  heading:      { color:'#f1f5f9', fontSize:22, fontWeight:700 },
  loading:      { color:'#94a3b8', padding:40, textAlign:'center' },
  tabs:         { display:'flex', gap:4, marginBottom:20, background:'#1e293b', borderRadius:10, padding:4, width:'fit-content' },
  tab:          { padding:'9px 20px', background:'transparent', border:'none', color:'#64748b', cursor:'pointer', borderRadius:8, fontSize:14 },
  activeTab:    { background:'#0f172a', color:'#f1f5f9', fontWeight:600 },
  statsGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  statCard:     { background:'#1e293b', borderRadius:12, padding:20 },
  statIcon:     { fontSize:24, marginBottom:8 },
  statVal:      { color:'#f1f5f9', fontSize:22, fontWeight:800 },
  statLabel:    { color:'#64748b', fontSize:13, marginTop:4 },
  card:         { background:'#1e293b', borderRadius:12, overflow:'hidden', padding:20 },
  cardTitle:    { color:'#f1f5f9', fontWeight:700, marginBottom:16 },
  searchRow:    { marginBottom:16 },
  searchInput:  { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'9px 14px', color:'#f1f5f9', fontSize:13, width:280 },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#0f172a' },
  th:           { color:'#64748b', padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:.5 },
  tr:           { borderBottom:'1px solid #334155' },
  td:           { color:'#f1f5f9', padding:'11px 14px', fontSize:13 },
  typeBadge:    { background:'rgba(59,130,246,.15)', color:'#3b82f6', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 },
  activateBtn:  { background:'rgba(16,185,129,.15)', color:'#10b981', border:'1px solid rgba(16,185,129,.3)', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 },
  deactivateBtn:{ background:'rgba(239,68,68,.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,.3)', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 },
};
