import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab]     = useState('profile');
  const [form, setForm]   = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', phone: user?.phone||'', address: user?.address||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePwChange = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Profile</h2>

      {/* Avatar card */}
      <div style={styles.avatarCard}>
        <div style={styles.avatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
        <div>
          <div style={styles.name}>{user?.firstName} {user?.lastName}</div>
          <div style={styles.email}>{user?.email}</div>
          <div style={styles.roleTag}>{user?.role === 'admin' ? '🛡️ Administrator' : '👤 Customer'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['profile','password'].map(t => (
          <button key={t} style={{...styles.tab, ...(tab===t?styles.activeTab:{})}} onClick={() => setTab(t)}>
            {t === 'profile' ? '👤 Personal Info' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div style={styles.card}>
          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>First Name</label>
                <input style={styles.input} value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Last Name</label>
                <input style={styles.input} value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} required />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email Address (read-only)</label>
              <input style={{...styles.input, opacity:.5}} value={user?.email||''} readOnly />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <input style={styles.input} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
            </div>
            <button type="submit" style={styles.saveBtn} disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div style={styles.card}>
          <form onSubmit={handlePwChange} style={styles.form}>
            {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([k,l]) => (
              <div key={k} style={styles.field}>
                <label style={styles.label}>{l}</label>
                <input style={styles.input} type="password" value={pwForm[k]}
                  onChange={e=>setPwForm({...pwForm,[k]:e.target.value})} placeholder="••••••••" required />
              </div>
            ))}
            <button type="submit" style={styles.saveBtn} disabled={saving}>{saving?'Changing...':'Change Password'}</button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:      { maxWidth:700, margin:'0 auto' },
  heading:   { color:'#f1f5f9', fontSize:22, fontWeight:700, marginBottom:24 },
  avatarCard:{ background:'#1e293b', borderRadius:12, padding:24, display:'flex', alignItems:'center', gap:20, marginBottom:20 },
  avatar:    { width:70, height:70, borderRadius:'50%', background:'#3b82f6', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, flexShrink:0 },
  name:      { color:'#f1f5f9', fontSize:20, fontWeight:700 },
  email:     { color:'#64748b', fontSize:14, margin:'4px 0' },
  roleTag:   { color:'#3b82f6', fontSize:13, fontWeight:600 },
  tabs:      { display:'flex', gap:4, marginBottom:20, background:'#1e293b', borderRadius:10, padding:4 },
  tab:       { flex:1, padding:'10px 0', background:'transparent', border:'none', color:'#64748b', cursor:'pointer', borderRadius:8, fontSize:14 },
  activeTab: { background:'#0f172a', color:'#f1f5f9', fontWeight:600 },
  card:      { background:'#1e293b', borderRadius:12, padding:28 },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  row:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  field:     { display:'flex', flexDirection:'column', gap:6 },
  label:     { color:'#94a3b8', fontSize:13, fontWeight:500 },
  input:     { background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none' },
  saveBtn:   { background:'#3b82f6', color:'#fff', border:'none', borderRadius:8, padding:12, fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4 },
};
