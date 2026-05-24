import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', phone:'', address:'', accountType:'savings' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('🎉 Account created! Welcome to SecureBank!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = (name, type='text', ph='') => (
    <input style={S.input} type={type} name={name} value={form[name]} onChange={handleChange} placeholder={ph} required />
  );

  return (
    <div style={S.page}>
      <div style={S.bgGlow} />
      <div style={S.wrapper}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.logoRow}>
            <div style={S.logoBox}><span style={S.logoIcon}>🏦</span></div>
            <div>
              <div style={S.brand}>SecureBank</div>
              <div style={S.brandSub}>Open Your Account Today</div>
            </div>
          </div>
          <div style={S.steps}>
            <div style={{...S.stepDot, ...(step>=1?S.stepActive:{})}}><span>1</span></div>
            <div style={S.stepLine} />
            <div style={{...S.stepDot, ...(step>=2?S.stepActive:{})}}><span>2</span></div>
          </div>
        </div>

        {/* Form card */}
        <div style={S.card}>
          <div style={S.goldAccent} />
          <h2 style={S.title}>Create Your Account</h2>
          <p style={S.sub}>Join 50,000+ satisfied customers</p>

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.grid2}>
              <div style={S.field}><label style={S.label}>FIRST NAME</label>{inp('firstName','text','John')}</div>
              <div style={S.field}><label style={S.label}>LAST NAME</label>{inp('lastName','text','Doe')}</div>
            </div>
            <div style={S.field}><label style={S.label}>EMAIL ADDRESS</label>{inp('email','email','you@example.com')}</div>
            <div style={S.field}><label style={S.label}>PASSWORD</label>{inp('password','password','Min 6 characters')}</div>
            <div style={S.grid2}>
              <div style={S.field}><label style={S.label}>PHONE</label>{inp('phone','tel','+91 9999999999')}</div>
              <div style={S.field}>
                <label style={S.label}>ACCOUNT TYPE</label>
                <select style={S.input} name="accountType" value={form.accountType} onChange={handleChange}>
                  <option value="savings">💰 Savings</option>
                  <option value="checking">🏧 Checking</option>
                  <option value="fixed_deposit">📈 Fixed Deposit</option>
                </select>
              </div>
            </div>
            <div style={S.field}><label style={S.label}>ADDRESS</label>{inp('address','text','123 Main Street, City')}</div>

            <div style={S.terms}>
              <input type="checkbox" required style={{ accentColor:'#4ade80' }} />
              <span style={S.termsText}>I agree to SecureBank's <span style={S.termsLink}>Terms & Conditions</span></span>
            </div>

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? '⏳ Creating Account...' : '🏦 Open My Account'}
            </button>
          </form>

          <p style={S.footer}>Already a member? <Link to="/login" style={S.link}>Sign In</Link></p>
        </div>

        {/* Trust badges */}
        <div style={S.badges}>
          {['🔒 SSL Secured','🏛️ RBI Licensed','✅ FDIC Insured','⭐ 4.9/5 Rated'].map(b=>(
            <div key={b} style={S.badge}>{b}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:      { minHeight:'100vh', background:'#060d06', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Trebuchet MS', sans-serif", padding:20, position:'relative' },
  bgGlow:    { position:'fixed', top:'30%', left:'50%', transform:'translateX(-50%)', width:800, height:400, borderRadius:'50%', background:'radial-gradient(ellipse, rgba(22,163,74,.06) 0%, transparent 70%)', pointerEvents:'none' },
  wrapper:   { width:'100%', maxWidth:580, display:'flex', flexDirection:'column', gap:20 },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center' },
  logoRow:   { display:'flex', alignItems:'center', gap:14 },
  logoBox:   { width:50, height:50, borderRadius:'50%', background:'rgba(234,179,8,.1)', border:'1px solid rgba(234,179,8,.4)', display:'flex', alignItems:'center', justifyContent:'center' },
  logoIcon:  { fontSize:24 },
  brand:     { color:'#f0fdf4', fontSize:20, fontWeight:800, letterSpacing:1 },
  brandSub:  { color:'#4ade80', fontSize:12 },
  steps:     { display:'flex', alignItems:'center', gap:8 },
  stepDot:   { width:32, height:32, borderRadius:'50%', border:'2px solid #334155', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', fontSize:13, fontWeight:700 },
  stepActive:{ borderColor:'#4ade80', color:'#4ade80', background:'rgba(74,222,128,.1)' },
  stepLine:  { width:30, height:2, background:'#1e3a2e' },
  card:      { background:'#070f07', border:'1px solid rgba(74,222,128,.12)', borderRadius:16, padding:32, position:'relative', overflow:'hidden' },
  goldAccent:{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, #16a34a, #fbbf24, #16a34a)' },
  title:     { color:'#f0fdf4', fontSize:26, fontWeight:800, margin:'0 0 6px' },
  sub:       { color:'#4b7c5a', fontSize:14, marginBottom:28 },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  grid2:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  field:     { display:'flex', flexDirection:'column', gap:6 },
  label:     { color:'#4ade80', fontSize:11, fontWeight:700, letterSpacing:1.5 },
  input:     { background:'#0a1a0a', border:'1px solid rgba(74,222,128,.18)', borderRadius:10, padding:'12px 14px', color:'#f0fdf4', fontSize:14, outline:'none' },
  terms:     { display:'flex', alignItems:'center', gap:10 },
  termsText: { color:'#4b7c5a', fontSize:13 },
  termsLink: { color:'#4ade80', cursor:'pointer' },
  btn:       { background:'linear-gradient(135deg, #16a34a, #15803d)', color:'#fff', border:'none', borderRadius:10, padding:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 24px rgba(22,163,74,.35)', marginTop:4 },
  footer:    { color:'#4b7c5a', textAlign:'center', marginTop:20, fontSize:14 },
  link:      { color:'#4ade80', textDecoration:'none', fontWeight:600 },
  badges:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 },
  badge:     { background:'rgba(255,255,255,.03)', border:'1px solid rgba(74,222,128,.08)', borderRadius:10, padding:'10px 6px', color:'#4b7c5a', fontSize:12, textAlign:'center' },
};