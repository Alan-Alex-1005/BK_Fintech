import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, Input, Button, Alert, PageShell, SectionTitle } from '../components/UI'
import api from '../api/axios'

export default function Send() {
  const { wallet, refreshWallet } = useAuth()
  const [form, setForm] = useState({ receiverEmail: '', amount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSend = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(null)
    const parsed = parseFloat(form.amount)
    if (!parsed || parsed <= 0) { setError('Enter a valid amount.'); return }
    if (!form.receiverEmail)    { setError('Enter a recipient email.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/transactions/send', {
        receiverEmail: form.receiverEmail,
        amount: parsed,
        note: form.note,
      })
      setSuccess(data)
      setForm({ receiverEmail: '', amount: '', note: '' })
      refreshWallet()
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendAnother = () => setSuccess(null)

  return (
    <PageShell>
      <SectionTitle title="Send money" subtitle="Transfer funds to another SecureFinX user" />

      <div style={styles.wrap}>
        {/* Balance indicator */}
        <div style={styles.balanceBar}>
          <span style={styles.balLabel}>Your balance</span>
          <span style={styles.balAmount}>${wallet?.balance?.toFixed(2) ?? '0.00'} {wallet?.currency}</span>
        </div>

        <Card style={{ maxWidth: 480 }}>
          {success ? (
            <SuccessView data={success} onReset={handleSendAnother} />
          ) : (
            <form onSubmit={handleSend} style={styles.form}>
              <Alert message={error} type="error" />

              <Input
                label="Recipient email"
                type="email"
                placeholder="recipient@example.com"
                value={form.receiverEmail}
                onChange={set('receiverEmail')}
                required
                autoFocus
              />
              <Input
                label="Amount (USD)"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={set('amount')}
                required
              />
              <Input
                label="Note (optional)"
                type="text"
                placeholder="Dinner, rent, etc."
                value={form.note}
                onChange={set('note')}
                style={{ maxLength: 100 }}
              />

              {/* Preview row */}
              {parseFloat(form.amount) > 0 && (
                <div style={styles.preview}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Sending</span>
                  <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--danger)', fontSize: '1.1rem' }}>
                    -${parseFloat(form.amount).toFixed(2)}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                style={{ width: '100%' }}
                disabled={!form.receiverEmail || !form.amount}
              >
                Send money →
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

function SuccessView({ data, onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={styles.successIcon}>✓</div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', marginBottom: 8 }}>
        Transfer complete
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20 }}>
        {data.message}
      </p>

      <div style={styles.receiptCard}>
        <ReceiptRow label="Amount"    value={`$${data.transaction.amount.toFixed(2)}`} accent />
        <ReceiptRow label="To"        value={`${data.transaction.receiver.name}`} />
        <ReceiptRow label="Email"     value={data.transaction.receiver.email} />
        {data.transaction.note && <ReceiptRow label="Note" value={data.transaction.note} />}
        <ReceiptRow label="New balance" value={`$${data.newBalance.toFixed(2)}`} />
        <ReceiptRow label="Ref"       value={data.transaction.id.slice(-8).toUpperCase()} mono />
      </div>

      <Button onClick={onReset} variant="secondary" style={{ width: '100%', marginTop: 20 }}>
        Send another
      </Button>
    </div>
  )
}

function ReceiptRow({ label, value, accent, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{
        fontSize: accent ? '1rem' : '0.88rem',
        fontWeight: accent ? 700 : 400,
        color: accent ? 'var(--accent)' : 'var(--text)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      }}>{value}</span>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  balanceBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '12px 18px', maxWidth: 480,
  },
  balLabel: { fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  balAmount: { fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  preview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '10px 16px',
  },
  successIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'var(--accent-dim)', border: '1px solid #00e5a040',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--accent)', fontSize: '1.4rem', fontWeight: 700,
    margin: '0 auto 20px',
  },
  receiptCard: {
    background: 'var(--bg-input)', borderRadius: 10,
    padding: '4px 16px', textAlign: 'left',
  },
}
