import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { Input, Button, Alert } from '../components/UI'

const STATUS = {
  VALIDATING: 'validating',
  VALID:      'valid',
  INVALID:    'invalid',
  SUCCESS:    'success',
}

export default function ResetPassword() {
  const { token }  = useParams()
  const navigate   = useNavigate()

  const [status, setStatus]   = useState(STATUS.VALIDATING)
  const [form, setForm]       = useState({ password: '', confirm: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Step 1: validate the token before showing the form
  useEffect(() => {
    if (!token) { setStatus(STATUS.INVALID); return }

    api.get(`/auth/reset-password/${token}/validate`)
      .then(() => setStatus(STATUS.VALID))
      .catch(() => setStatus(STATUS.INVALID))
  }, [token])

  // Step 2: auto-redirect after success
  useEffect(() => {
    if (status !== STATUS.SUCCESS) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); navigate('/login'); }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status, navigate])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (form.password.length < 6)            e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)       e.confirm  = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password:        form.password,
        confirmPassword: form.confirm,
      })
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Reset failed. Please try again.')
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

        {/* ── State: Validating token ── */}
        {status === STATUS.VALIDATING && (
          <div style={styles.centeredState}>
            <div style={styles.spinner} />
            <p style={styles.stateText}>Verifying your reset link…</p>
          </div>
        )}

        {/* ── State: Invalid / expired token ── */}
        {status === STATUS.INVALID && (
          <div style={styles.centeredState}>
            <div style={styles.errorCircle}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="var(--danger)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 style={styles.heading}>Link expired</h2>
            <p style={{ ...styles.sub, textAlign: 'center' }}>
              This reset link is invalid or has expired. Reset links are valid for 1 hour.
            </p>
            <Link to="/forgot-password" style={{ width: '100%' }}>
              <Button variant="primary" style={{ width: '100%', marginTop: 8 }}>
                Request a new link
              </Button>
            </Link>
            <Link to="/login" style={styles.backLink}>← Back to sign in</Link>
          </div>
        )}

        {/* ── State: Success ── */}
        {status === STATUS.SUCCESS && (
          <div style={styles.centeredState}>
            <div style={styles.successCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={styles.heading}>Password updated!</h2>
            <p style={{ ...styles.sub, textAlign: 'center' }}>
              Your password has been reset successfully.
            </p>
            <div style={styles.countdownBox}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                Redirecting to login in{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{countdown}s</span>
              </span>
            </div>
            <Link to="/login" style={{ width: '100%' }}>
              <Button variant="primary" style={{ width: '100%' }}>
                Sign in now →
              </Button>
            </Link>
          </div>
        )}

        {/* ── State: Valid — show form ── */}
        {status === STATUS.VALID && (
          <>
            <div style={styles.iconWrap}>
              <KeyIcon />
            </div>
            <h2 style={styles.heading}>Set new password</h2>
            <p style={styles.sub}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <Alert message={apiError} type="error" />

              <Input
                label="New password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                autoFocus
              />

              <Input
                label="Confirm new password"
                type="password"
                placeholder="Repeat new password"
                value={form.confirm}
                onChange={set('confirm')}
                error={errors.confirm}
              />

              {/* Password strength hint */}
              {form.password && (
                <StrengthMeter password={form.password} />
              )}

              <Button type="submit" loading={loading} style={{ width: '100%' }}>
                Reset password
              </Button>
            </form>
          </>
        )}

        {/* Footer link — always show unless success */}
        {status !== STATUS.SUCCESS && status !== STATUS.INVALID && (
          <p style={styles.footer}>
            <Link to="/login" style={styles.linkMuted}>← Back to sign in</Link>
          </p>
        )}

      </div>
    </div>
  )
}

// ── Password strength meter ──────────────────────────────
function StrengthMeter({ password }) {
  const score = getStrengthScore(password)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'var(--danger)', '#f59e0b', '#3b82f6', 'var(--accent)']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 4,
            background: i <= score ? colors[score] : 'var(--bg-input)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: '0.72rem', color: colors[score] }}>
          {labels[score]}
        </span>
      )}
    </div>
  )
}

function getStrengthScore(pw) {
  let score = 0
  if (pw.length >= 6)                     score++
  if (pw.length >= 10)                    score++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw))           score++
  return Math.min(4, score)
}

// ── Icons ────────────────────────────────────────────────
function KeyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
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
  heading: { fontSize: '1.4rem', letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8 },
  sub: { fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.85rem' },
  linkMuted: { color: 'var(--muted)', textDecoration: 'none' },
  backLink: { color: 'var(--muted)', fontSize: '0.84rem', marginTop: 16, display: 'block', textAlign: 'center' },

  // States
  centeredState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center', gap: 4,
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '2.5px solid var(--border-md)',
    borderTopColor: 'var(--accent)',
    animation: 'spin 0.7s linear infinite',
    marginBottom: 16,
  },
  stateText: { fontSize: '0.9rem', color: 'var(--muted)' },
  successCircle: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'var(--accent-dim)', border: '1px solid #00e5a040',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, animation: 'pulse-ring 2s ease-out 1',
  },
  errorCircle: {
    width: 60, height: 60, borderRadius: '50%',
    background: '#ff4f6a12', border: '1px solid #ff4f6a40',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  countdownBox: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 16px', marginBottom: 16, marginTop: 8,
  },
}
