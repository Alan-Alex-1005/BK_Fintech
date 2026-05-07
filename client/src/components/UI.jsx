// ── Card ────────────────────────────────────────────────
export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      boxShadow: 'var(--shadow)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Input ────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          background: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-md)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '11px 14px',
          color: 'var(--text)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)' }}
        onBlur={e  => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-md)' }}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}

// ── Button ───────────────────────────────────────────────
export function Button({ children, variant = 'primary', loading = false, style = {}, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '11px 22px', borderRadius: 'var(--radius-sm)',
    fontWeight: 500, fontSize: '0.9rem', transition: 'opacity 0.15s, transform 0.1s',
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
    fontFamily: 'var(--font-mono)',
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#000' },
    secondary: { background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border-md)' },
    danger: { background: 'var(--danger)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.6' : '1' }}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 'spin 0.6s linear infinite', display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  )
}

// ── Badge ────────────────────────────────────────────────
export function Badge({ children, type = 'neutral' }) {
  const colors = {
    credit:  { bg: '#00e5a015', color: 'var(--accent)',   border: '#00e5a030' },
    debit:   { bg: '#ff4f6a15', color: 'var(--danger)',   border: '#ff4f6a30' },
    neutral: { bg: '#ffffff10', color: 'var(--muted)',    border: 'var(--border)' },
    success: { bg: '#00e5a015', color: 'var(--accent)',   border: '#00e5a030' },
    failed:  { bg: '#ff4f6a15', color: 'var(--danger)',   border: '#ff4f6a30' },
  }
  const c = colors[type] || colors.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  )
}

// ── Alert ────────────────────────────────────────────────
export function Alert({ message, type = 'error' }) {
  if (!message) return null
  const colors = {
    error:   { bg: '#ff4f6a12', border: '#ff4f6a40', color: '#ff8099' },
    success: { bg: '#00e5a012', border: '#00e5a040', color: 'var(--accent)' },
  }
  const c = colors[type]
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: '0.85rem',
    }}>
      {message}
    </div>
  )
}

// ── Page Shell ───────────────────────────────────────────
export function PageShell({ children }) {
  return (
    <div style={{ padding: '36px 40px', maxWidth: 900, margin: '0 auto' }}>
      {children}
    </div>
  )
}

// ── Section Title ────────────────────────────────────────
export function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
