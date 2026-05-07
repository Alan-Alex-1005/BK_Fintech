import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
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

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Alert message={error} type="error" />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              required
              style={{
                width: '100%', background: 'var(--bg-input)',
                border: '1px solid var(--border-md)', borderRadius: 'var(--radius-sm)',
                padding: '11px 14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border-md)' }}
            />
          </div>

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 4 }}>
            Sign in
          </Button>
        </form>

        <p style={styles.footer}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoMark: {
    width: 36, height: 36, background: 'var(--accent)',
    borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'var(--font-head)',
    fontWeight: 800, fontSize: 18, color: '#000',
  },
  logoText: { fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem' },
  heading: { fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: 4 },
  sub: { color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--muted)' },
}
