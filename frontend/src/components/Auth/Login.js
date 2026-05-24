import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.bgGlow1} /><div style={S.bgGlow2} />
      <div style={S.container}>
        {/* Left branding */}
        <div style={S.left}>
          <div style={S.logoBox}>
            <div style={S.logoCircle}><span style={S.logoIcon}>🏦</span></div>
            <h1 style={S.brand}>SecureBank</h1>
            <p style={S.tagline}>"Your Money, Secured Forever"</p>
          </div>
          <div style={S.statsRow}>
            <div style={S.stat}><div style={S.statNum}>50K+</div><div style={S.statLbl}>Customers</div></div>
            <div style={S.statDiv} />
            <div style={S.stat}><div style={S.statNum}>$2B+</div><div style={S.statLbl}>Managed</div></div>
            <div style={S.statDiv} />
            <div style={S.stat}><div style={S.statNum}>99.9%</div><div style={S.statLbl}>Uptime</div></div>
          </div>
          <div style={S.featureList}>
            {['🔐 256-bit Encryption','⚡ Instant Transfers','📊 Real-time Analytics','🌍 24/7 Support'].map(f=>(
              <div key={f} style={S.feat}><span style={S.featDot}>◆</span>{f}</div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div style={S.right}>
          <div style={S.card}>
            <div style={S.cardTop}>
              <div style={S.goldLine} />
              <h2 style={S.title}>Sign In</h2>
              <p style={S.sub}>Access your banking dashboard</p>
            </div>
            <form onSubmit={handleSubmit} style={S.form}>
              <div style={S.field}>
                <label style={S.label}>EMAIL ADDRESS</label>
                <input style={S.input} type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div style={S.field}>
                <label style={S.label}>PASSWORD</label>
                <input style={S.input} type="password" name="password" value={form.password}
                  onChange={handleChange} placeholder="••••••••" required />
              </div>
              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? '⏳ Signing In...' : '→ Sign In to Dashboard'}
              </button>
            </form>
            <p style={S.footer}>New customer? <Link to="/register" style={S.link}>Open an Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:      { minHeight:'100vh', background:'#060d06', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Trebuchet MS', sans-serif", position:'relative', overflow:'hidden' },
  bgGlow1:   { position:'fixed', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(22,163,74,.12) 0%, transparent 70%)', pointerEvents:'none' },
  bgGlow2:   { position:'fixed', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(234,179,8,.08) 0%, transparent 70%)', pointerEvents:'none' },
  container: { display:'grid', gridTemplateColumns:'55% 45%', width:'100%', maxWidth:1000, minHeight:'100vh' },
  left:      { background:'linear-gradient(160deg, #052e16 0%, #0a3d1f 40%, #0d4a26 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem', gap:40, borderRight:'1px solid rgba(74,222,128,.1)' },
  logoBox:   { textAlign:'center' },
  logoCircle:{ width:90, height:90, borderRadius:'50%', background:'rgba(234,179,8,.1)', border:'2px solid rgba(234,179,8,.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 0 40px rgba(234,179,8,.15)' },
  logoIcon:  { fontSize:40 },
  brand:     { color:'#f0fdf4', fontSize:34, fontWeight:800, letterSpacing:3, margin:'0 0 8px' },
  tagline:   { color:'#fbbf24', fontSize:14, fontStyle:'italic', opacity:.9 },
  statsRow:  { display:'flex', justifyContent:'center', alignItems:'center', gap:24, background:'rgba(255,255,255,.03)', borderRadius:14, padding:20, border:'1px solid rgba(74,222,128,.1)' },
  stat:      { textAlign:'center' },
  statNum:   { color:'#4ade80', fontSize:22, fontWeight:800 },
  statLbl:   { color:'rgba(187,247,208,.6)', fontSize:12, marginTop:2 },
  statDiv:   { width:1, height:40, background:'rgba(74,222,128,.2)' },
  featureList:{ display:'flex', flexDirection:'column', gap:12 },
  feat:      { display:'flex', alignItems:'center', gap:12, color:'#bbf7d0', fontSize:14, padding:'10px 16px', background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(74,222,128,.08)' },
  featDot:   { color:'#fbbf24', fontSize:10 },
  right:     { background:'#070f07', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' },
  card:      { width:'100%', maxWidth:400 },
  cardTop:   { marginBottom:32 },
  goldLine:  { width:50, height:3, background:'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius:2, marginBottom:20 },
  title:     { color:'#f0fdf4', fontSize:30, fontWeight:800, margin:'0 0 8px', letterSpacing:.5 },
  sub:       { color:'#4b7c5a', fontSize:14 },
  form:      { display:'flex', flexDirection:'column', gap:18 },
  field:     { display:'flex', flexDirection:'column', gap:7 },
  label:     { color:'#4ade80', fontSize:11, fontWeight:700, letterSpacing:1.5 },
  input:     { background:'#0a1a0a', border:'1px solid rgba(74,222,128,.2)', borderRadius:10, padding:'13px 16px', color:'#f0fdf4', fontSize:15, outline:'none', transition:'border-color .2s' },
  btn:       { background:'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color:'#fff', border:'none', borderRadius:10, padding:'14px', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:6, boxShadow:'0 4px 24px rgba(22,163,74,.35)', letterSpacing:.3 },
  footer:    { color:'#4b7c5a', textAlign:'center', marginTop:24, fontSize:14 },
  link:      { color:'#4ade80', textDecoration:'none', fontWeight:600 },
};