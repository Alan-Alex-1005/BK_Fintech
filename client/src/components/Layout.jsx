import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',    label: 'Overview',     icon: IconGrid },
  { to: '/wallet',       label: 'Wallet',        icon: IconWallet },
  { to: '/send',         label: 'Send',          icon: IconSend },
  { to: '/transactions', label: 'History',       icon: IconHistory },
]

export default function Layout() {
  const { user, wallet, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoMark}>S</span>
          <span style={styles.logoText}>SecureFinX</span>
        </div>

        {/* Balance pill */}
        <div style={styles.balancePill}>
          <p style={styles.balanceLabel}>Available</p>
          <p style={styles.balanceAmount}>
            ${wallet?.balance?.toFixed(2) ?? '0.00'}
          </p>
          <p style={styles.balanceCurrency}>{wallet?.currency ?? 'USD'}</p>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}>
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--muted)'} />
                  <span style={{ color: isActive ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
                  {isActive && <div style={styles.navDot} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={styles.userArea}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <IconLogout size={16} color="var(--muted)" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────
const styles = {
  sidebar: {
    width: 240, minHeight: '100vh', background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '28px 16px', gap: 8,
    position: 'sticky', top: 0, height: '100vh',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 28, paddingLeft: 6,
  },
  logoMark: {
    width: 32, height: 32, background: 'var(--accent)',
    borderRadius: 8, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'var(--font-head)',
    fontWeight: 800, fontSize: 16, color: '#000',
  },
  logoText: {
    fontFamily: 'var(--font-head)', fontWeight: 700,
    fontSize: '1rem', letterSpacing: '-0.02em',
  },
  balancePill: {
    background: 'var(--accent-dim)', border: '1px solid #00e5a030',
    borderRadius: 12, padding: '16px 18px', marginBottom: 20,
  },
  balanceLabel: {
    fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.12em',
    textTransform: 'uppercase', fontWeight: 500, marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: 'var(--font-head)', fontWeight: 700,
    fontSize: '1.5rem', color: 'var(--text)', letterSpacing: '-0.02em',
  },
  balanceCurrency: {
    fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2,
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 10,
    fontSize: '0.88rem', fontWeight: 400, transition: 'background 0.15s',
    position: 'relative', textDecoration: 'none',
  },
  navItemActive: { background: '#ffffff08' },
  navDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: 'var(--accent)', marginLeft: 'auto',
  },
  userArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 10px', borderTop: '1px solid var(--border)',
    marginTop: 8,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--accent-2)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '0.7rem', color: 'var(--muted)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none', padding: 4, borderRadius: 6, flexShrink: 0,
    display: 'flex', alignItems: 'center',
  },
  main: { flex: 1, overflow: 'auto', background: 'var(--bg)' },
}

// ── Inline SVG Icons ─────────────────────────────────────
function IconGrid({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconWallet({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M16 12a2 2 0 0 0 0 4h5v-4h-5z"/></svg>
}
function IconSend({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}
function IconHistory({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.51"/><polyline points="12 7 12 12 15 15"/></svg>
}
function IconLogout({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
