import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, Input, Button, Alert, PageShell, SectionTitle } from '../components/UI'
import api from '../api/axios'

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500]

export default function Wallet() {
  const { wallet, refreshWallet } = useAuth()
  const [amount, setAmount]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')
  const [error, setError]       = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    setSuccess(''); setError('')
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) { setError('Enter a valid amount greater than 0.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/wallet/add', { amount: parsed })
      setSuccess(data.message)
      setAmount('')
      refreshWallet()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add funds.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <SectionTitle title="Wallet" subtitle="Manage your balance" />

      <div style={styles.grid}>
        {/* Balance card */}
        <Card style={styles.balanceCard}>
          <p style={styles.label}>Current balance</p>
          <p style={styles.bigNum}>${wallet?.balance?.toFixed(2) ?? '0.00'}</p>
          <div style={styles.currencyTag}>{wallet?.currency ?? 'USD'}</div>

          <div style={styles.divider} />

          <div style={styles.metaRow}>
            <div>
              <p style={styles.metaLabel}>Currency</p>
              <p style={styles.metaVal}>{wallet?.currency ?? 'USD'}</p>
            </div>
            <div>
              <p style={styles.metaLabel}>Status</p>
              <p style={{ ...styles.metaVal, color: 'var(--accent)' }}>● Active</p>
            </div>
          </div>
        </Card>

        {/* Add money form */}
        <Card>
          <h3 style={styles.formTitle}>Add funds</h3>
          <p style={styles.formSub}>Simulated top-up — instant credit</p>

          <form onSubmit={handleAdd} style={styles.form}>
            <Alert message={error}   type="error" />
            <Alert message={success} type="success" />

            {/* Quick amount pills */}
            <div>
              <p style={styles.label}>Quick select</p>
              <div style={styles.pills}>
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    style={{
                      ...styles.pill,
                      background: amount === String(q) ? 'var(--accent)' : 'var(--bg-input)',
                      color:      amount === String(q) ? '#000' : 'var(--muted)',
                      border: `1px solid ${amount === String(q) ? 'var(--accent)' : 'var(--border-md)'}`,
                    }}
                  >
                    ${q}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Custom amount (USD)"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            <Button type="submit" loading={loading} style={{ width: '100%' }}>
              Add ${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : '0.00'} to wallet
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  balanceCard: {
    background: 'linear-gradient(145deg, #0d1a14 0%, #111118 100%)',
    border: '1px solid #00e5a025',
  },
  label: {
    fontSize: '0.72rem', color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
  },
  bigNum: {
    fontFamily: 'var(--font-head)', fontSize: '3rem',
    fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1,
  },
  currencyTag: {
    display: 'inline-block', marginTop: 12,
    padding: '3px 10px', borderRadius: 20,
    background: 'var(--accent-dim)', color: 'var(--accent)',
    fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em',
    border: '1px solid #00e5a030',
  },
  divider: { borderTop: '1px solid var(--border)', margin: '20px 0' },
  metaRow: { display: 'flex', gap: 32 },
  metaLabel: { fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' },
  metaVal: { fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 },
  formTitle: { fontSize: '1.1rem', letterSpacing: '-0.02em', marginBottom: 4 },
  formSub: { fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  pills: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  pill: {
    padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem',
    fontFamily: 'var(--font-mono)', cursor: 'pointer',
    transition: 'all 0.15s', fontWeight: 500,
  },
}
