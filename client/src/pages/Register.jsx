import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Button, Alert } from '../components/UI'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email))        e.email = 'Enter a valid email'
    if (form.password.length < 6)                   e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)              e.confirm = 'Passwords do not match'
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
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-up">
        <div style={styles.brand}>
          <div style={styles.logoMark}>S</div>
          <span style={styles.logoText}>SecureFinX</span>
        </div>

        <h2 style={styles.heading}>Create account</h2>
        <p style={styles.sub}>Start managing your finances</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Alert message={apiError} type="error" />

          <Input
            label="Full name"
            type="text"
            placeholder="Alice Johnson"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
          />

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 4 }}>
            Create account
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
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
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--muted)' },
}
