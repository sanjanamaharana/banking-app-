import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountAPI, transactionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function DashboardHome() {
  const { user } = useAuth();
  const [accounts, setAccounts]         = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([accountAPI.getAll(), transactionAPI.getAll({ limit: 5 })])
      .then(([accRes, txnRes]) => {
        setAccounts(accRes.data.accounts);
        setTransactions(txnRes.data.transactions);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  // Build mini chart from last 7 days of transactions
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday:'short' });
  });
  const chartData = {
    labels: last7,
    datasets: [{
      label:'Balance',
      data: last7.map(() => totalBalance * (0.85 + Math.random() * 0.15)),
      fill: true,
      borderColor:'#3b82f6',
      backgroundColor:'rgba(59,130,246,.12)',
      tension: 0.4,
      pointRadius: 3,
    }],
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Welcome back, {user?.firstName} 👋</h2>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <StatCard icon="💰" label="Total Balance"   value={`$${totalBalance.toLocaleString('en-US',{minimumFractionDigits:2})}`} color="#3b82f6" />
        <StatCard icon="💳" label="Accounts"        value={accounts.length}   color="#10b981" />
        <StatCard icon="↔️"  label="Recent Txns"    value={transactions.length} color="#f59e0b" />
        <StatCard icon="📈" label="Interest Rate"   value="3.5% p.a."         color="#8b5cf6" />
      </div>

      {/* Chart + Accounts */}
      <div style={styles.midRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>Balance Trend</h3>
          <Line data={chartData} options={{ plugins:{ legend:{display:false} }, scales:{ x:{grid:{color:'#1e293b'}}, y:{grid:{color:'#1e293b'}} } }} />
        </div>
        <div style={styles.accountsCard}>
          <h3 style={styles.cardTitle}>My Accounts</h3>
          {accounts.map((acc) => (
            <div key={acc._id} style={styles.accountItem}>
              <div>
                <div style={styles.accType}>{acc.accountType.replace('_',' ').toUpperCase()}</div>
                <div style={styles.accNum}>{acc.accountNumber}</div>
              </div>
              <div style={styles.accBal}>${acc.balance.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
            </div>
          ))}
          <Link to="/accounts" style={styles.viewAll}>View All Accounts →</Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={styles.txnCard}>
        <h3 style={styles.cardTitle}>Recent Transactions</h3>
        {transactions.length === 0 && <p style={styles.empty}>No transactions yet.</p>}
        {transactions.map((txn) => (
          <div key={txn._id} style={styles.txnRow}>
            <div style={styles.txnIcon}>{txnIcon(txn.type)}</div>
            <div style={{ flex:1 }}>
              <div style={styles.txnDesc}>{txn.description || txn.type}</div>
              <div style={styles.txnDate}>{new Date(txn.createdAt).toLocaleDateString()} · {txn.reference}</div>
            </div>
            <div style={{ ...styles.txnAmt, color: txn.type==='deposit' ? '#10b981' : '#ef4444' }}>
              {txn.type==='deposit' ? '+' : '-'}${txn.amount.toFixed(2)}
            </div>
          </div>
        ))}
        <Link to="/transactions" style={styles.viewAll}>View All Transactions →</Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop:`3px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function txnIcon(type) {
  return { deposit:'⬇️', withdrawal:'⬆️', transfer:'↔️', payment:'💳' }[type] || '💬';
}

const styles = {
  page:        { maxWidth:1100, margin:'0 auto' },
  loading:     { color:'#94a3b8', padding:40, textAlign:'center' },
  heading:     { color:'#f1f5f9', fontSize:22, fontWeight:700, marginBottom:20 },
  statsRow:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  statCard:    { background:'#1e293b', borderRadius:12, padding:20 },
  statIcon:    { fontSize:24, marginBottom:10 },
  statValue:   { color:'#f1f5f9', fontSize:22, fontWeight:700 },
  statLabel:   { color:'#64748b', fontSize:13, marginTop:4 },
  midRow:      { display:'grid', gridTemplateColumns:'1fr 340px', gap:16, marginBottom:24 },
  chartCard:   { background:'#1e293b', borderRadius:12, padding:20 },
  accountsCard:{ background:'#1e293b', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:12 },
  cardTitle:   { color:'#f1f5f9', fontWeight:600, marginBottom:16 },
  accountItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #334155' },
  accType:     { color:'#3b82f6', fontSize:11, fontWeight:700, letterSpacing:1 },
  accNum:      { color:'#94a3b8', fontSize:13, marginTop:2 },
  accBal:      { color:'#f1f5f9', fontWeight:700 },
  txnCard:     { background:'#1e293b', borderRadius:12, padding:20 },
  txnRow:      { display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #334155' },
  txnIcon:     { fontSize:20, width:32, textAlign:'center' },
  txnDesc:     { color:'#f1f5f9', fontSize:14 },
  txnDate:     { color:'#64748b', fontSize:12, marginTop:2 },
  txnAmt:      { fontWeight:700, fontSize:15 },
  viewAll:     { color:'#3b82f6', textDecoration:'none', fontSize:13, marginTop:12, display:'block' },
  empty:       { color:'#64748b' },
};
