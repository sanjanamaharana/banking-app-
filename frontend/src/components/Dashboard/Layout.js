import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path:'/dashboard',       icon:'📊', label:'Dashboard' },
  { path:'/accounts',        icon:'💳', label:'My Accounts' },
  { path:'/transactions',    icon:'↔️',  label:'Transactions' },
  { path:'/transfer',        icon:'📤', label:'Send Money' },
  { path:'/profile',         icon:'👤', label:'Profile' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={S.shell}>
      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: collapsed ? 68 : 240 }}>
        {/* Logo */}
        <div style={S.logoArea}>
          <div style={S.logoCircle}>🏦</div>
          {!collapsed && (
            <div>
              <div style={S.logoName}>SecureBank</div>
              <div style={S.logoSub}>Banking Portal</div>
            </div>
          )}
        </div>

        {/* Gold divider */}
        <div style={S.goldDivider} />

        {/* Nav */}
        <nav style={S.nav}>
          {navItems.map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ ...S.navItem, ...(active ? S.navActive : {}) }}>
                <span style={S.navIcon}>{icon}</span>
                {!collapsed && <span style={S.navLabel}>{label}</span>}
                {active && !collapsed && <span style={S.navPip} />}
              </Link>
            );
          })}

          {user?.role === 'admin' && (
            <>
              <div style={S.navSection}>{!collapsed && 'ADMIN'}</div>
              <Link to="/admin" style={{ ...S.navItem, ...(location.pathname.startsWith('/admin') ? S.navActive : {}) }}>
                <span style={S.navIcon}>🛡️</span>
                {!collapsed && <span style={S.navLabel}>Admin Panel</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User card at bottom */}
        {!collapsed && (
          <div style={S.userCard}>
            <div style={S.userAvatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div style={S.userInfo}>
              <div style={S.userName}>{user?.firstName} {user?.lastName}</div>
              <div style={S.userRole}>{user?.role === 'admin' ? '🛡️ Admin' : '👤 Customer'}</div>
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={S.logoutBtn}>
          <span>🚪</span>{!collapsed && ' Logout'}
        </button>
      </aside>

      {/* Main content */}
      <div style={S.main}>
        {/* Topbar */}
        <header style={S.topbar}>
          <div style={S.topLeft}>
            <button onClick={() => setCollapsed(!collapsed)} style={S.collapseBtn}>
              {collapsed ? '▶' : '◀'}
            </button>
            <div style={S.breadcrumb}>
              <span style={S.breadHome}>SecureBank</span>
              <span style={S.breadSep}>/</span>
              <span style={S.breadCurrent}>{navItems.find(n=>n.path===location.pathname)?.label || 'Panel'}</span>
            </div>
          </div>
          <div style={S.topRight}>
            <div style={S.notifBtn}>🔔</div>
            <div style={S.avatarSmall}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div style={S.headerName}>{user?.firstName}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={S.content}>{children}</main>

        {/* Footer */}
        <footer style={S.footer}>
          <span>© 2025 SecureBank</span>
          <span style={S.footerDot}>◆</span>
          <span>All transactions are encrypted & secure</span>
          <span style={S.footerDot}>◆</span>
          <span style={S.footerGold}>🔒 SSL Protected</span>
        </footer>
      </div>
    </div>
  );
}

const S = {
  shell:       { display:'flex', minHeight:'100vh', background:'#060d06', fontFamily:"'Trebuchet MS', sans-serif" },
  sidebar:     { background:'linear-gradient(180deg, #052e16 0%, #0a3d1f 60%, #052e16 100%)', display:'flex', flexDirection:'column', transition:'width .25s ease', overflow:'hidden', flexShrink:0, borderRight:'1px solid rgba(74,222,128,.1)', position:'relative' },
  logoArea:    { display:'flex', alignItems:'center', gap:12, padding:'22px 16px 18px', minWidth:0 },
  logoCircle:  { width:42, height:42, borderRadius:'50%', background:'rgba(234,179,8,.12)', border:'1px solid rgba(234,179,8,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 0 20px rgba(234,179,8,.1)' },
  logoName:    { color:'#f0fdf4', fontWeight:800, fontSize:16, letterSpacing:1, whiteSpace:'nowrap' },
  logoSub:     { color:'rgba(187,247,208,.4)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase' },
  goldDivider: { height:1, background:'linear-gradient(90deg, transparent, rgba(234,179,8,.4), transparent)', margin:'0 12px 10px' },
  nav:         { flex:1, padding:'8px 10px', display:'flex', flexDirection:'column', gap:3, overflowY:'auto' },
  navSection:  { color:'rgba(187,247,208,.3)', fontSize:10, letterSpacing:2, padding:'12px 10px 6px', textTransform:'uppercase', fontWeight:700 },
  navItem:     { display:'flex', alignItems:'center', gap:12, padding:'10px 12px', color:'rgba(187,247,208,.6)', textDecoration:'none', fontSize:14, borderRadius:10, transition:'all .15s', position:'relative', whiteSpace:'nowrap', border:'1px solid transparent' },
  navActive:   { color:'#4ade80', background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.15)', fontWeight:600 },
  navIcon:     { fontSize:17, flexShrink:0, width:22, textAlign:'center' },
  navLabel:    { flex:1 },
  navPip:      { width:6, height:6, borderRadius:'50%', background:'#fbbf24', flexShrink:0 },
  userCard:    { margin:'0 10px 10px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(74,222,128,.08)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 },
  userAvatar:  { width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, #16a34a, #fbbf24)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 },
  userInfo:    { minWidth:0 },
  userName:    { color:'#f0fdf4', fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  userRole:    { color:'#4ade80', fontSize:11, marginTop:2 },
  logoutBtn:   { margin:'0 10px 16px', padding:'10px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.15)', borderRadius:10, cursor:'pointer', fontSize:13, color:'#f87171', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' },
  main:        { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },
  topbar:      { background:'#070f07', borderBottom:'1px solid rgba(74,222,128,.08)', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  topLeft:     { display:'flex', alignItems:'center', gap:16 },
  collapseBtn: { background:'rgba(74,222,128,.06)', border:'1px solid rgba(74,222,128,.15)', color:'#4ade80', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:12 },
  breadcrumb:  { display:'flex', alignItems:'center', gap:8 },
  breadHome:   { color:'rgba(187,247,208,.4)', fontSize:13 },
  breadSep:    { color:'rgba(187,247,208,.2)', fontSize:13 },
  breadCurrent:{ color:'#4ade80', fontSize:13, fontWeight:600 },
  topRight:    { display:'flex', alignItems:'center', gap:14 },
  notifBtn:    { width:36, height:36, borderRadius:'50%', background:'rgba(74,222,128,.06)', border:'1px solid rgba(74,222,128,.12)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15 },
  avatarSmall: { width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, #16a34a, #fbbf24)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 },
  headerName:  { color:'#bbf7d0', fontSize:14, fontWeight:600 },
  content:     { flex:1, padding:'28px', overflowY:'auto', background:'#060d06' },
  footer:      { background:'#070f07', borderTop:'1px solid rgba(74,222,128,.06)', padding:'10px 28px', display:'flex', alignItems:'center', gap:10, color:'rgba(187,247,208,.3)', fontSize:12 },
  footerDot:   { color:'rgba(234,179,8,.3)', fontSize:8 },
  footerGold:  { color:'rgba(234,179,8,.5)' },
};