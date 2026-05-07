import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Input, Button, Alert } from '../components/UI'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      // Always show success — backend never reveals whether email exists
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">

        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoMark}>S</div>
          <span style={styles.logoText}>SecureFinX</span>
        </div>

        {success ? (
          <SuccessState email={email} />
        ) : (
          <>
            {/* Icon */}
            <div style={styles.iconWrap}>
              <LockIcon />
            </div>

            <h2 style={styles.heading}>Forgot your password?</h2>
            <p style={styles.sub}>
              Enter your account email and we'll send you a secure link to reset your password.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <Alert message={error} type="error" />

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />

              <Button type="submit" loading={loading} style={{ width: '100%' }}>
                Send reset link
              </Button>
            </form>
          </>
        )}

        <p style={styles.footer}>
          Remembered it?{' '}
          <Link to="/login" style={styles.link}>Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}

function SuccessState({ email }) {
  return (
    <div style={styles.successWrap}>
      {/* Animated checkmark */}
      <div style={styles.checkCircle}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={styles.heading}>Check your inbox</h2>
      <p style={styles.sub}>
        We sent a password reset link to
      </p>
      <p style={styles.emailPill}>{email}</p>
      <p style={styles.subSmall}>
        The link expires in <strong style={{ color: 'var(--text)' }}>1 hour</strong>.
        If you don't see it, check your spam folder.
      </p>

      {/* Resend hint */}
      <div style={styles.resendBox}>
        <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Didn't get it? </span>
        <button
          onClick={() => window.location.reload()}
          style={{ background: 'none', color: 'var(--accent)', fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
        >
          Send again
        </button>
      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────
function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── Styles ───────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoMark: {
    width: 36, height: 36, background: 'var(--accent)',
    borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'var(--font-head)',
    fontWeight: 800, fontSize: 18, color: '#000', flexShrink: 0,
  },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem' },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14,
    background: 'var(--accent-dim)', border: '1px solid #00e5a030',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: '1.4rem', letterSpacing: '-0.03em',
    color: 'var(--text)', marginBottom: 8,
  },
  sub: {
    fontSize: '0.88rem', color: 'var(--muted)',
    lineHeight: 1.6, marginBottom: 24,
  },
  subSmall: {
    fontSize: '0.82rem', color: 'var(--muted)',
    lineHeight: 1.6, marginTop: 12,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  footer: {
    textAlign: 'center', marginTop: 24,
    fontSize: '0.85rem', color: 'var(--muted)',
  },
  link: { color: 'var(--accent)' },

  // Success state
  successWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  checkCircle: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'var(--accent-dim)', border: '1px solid #00e5a040',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    animation: 'pulse-ring 2s ease-out 1',
  },
  emailPill: {
    display: 'inline-block', background: 'var(--bg-input)',
    border: '1px solid var(--border-md)', borderRadius: 8,
    padding: '6px 14px', fontSize: '0.88rem', color: 'var(--accent)',
    fontFamily: 'var(--font-mono)', marginTop: 4,
  },
  resendBox: {
    marginTop: 20, padding: '12px 16px',
    background: 'var(--bg-input)', borderRadius: 10,
    border: '1px solid var(--border)',
  },
}
