import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Button, PageShell, SectionTitle } from '../components/UI'
import api from '../api/axios'

export default function Dashboard() {
  const { user, wallet } = useAuth()
  const navigate = useNavigate()
  const [txns, setTxns]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/transactions?limit=5')
      .then(r => setTxns(r.data.transactions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalIn  = txns.filter(t => t.type === 'credit' && t.note !== 'Wallet top-up').reduce((s, t) => s + t.amount, 0)
  const totalOut = txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <PageShell>
      <SectionTitle
        title={`${greeting()}, ${user?.name?.split(' ')[0]}.`}
        subtitle="Here's your financial overview"
      />

      {/* Top stat cards */}
      <div style={styles.statsGrid}>
        <Card style={styles.balanceCard}>
          <p style={styles.cardLabel}>Total balance</p>
          <p style={styles.bigAmount}>${wallet?.balance?.toFixed(2) ?? '0.00'}</p>
          <p style={styles.cardSub}>{wallet?.currency ?? 'USD'} · Digital Wallet</p>
          <div style={styles.pulseRing} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={styles.miniCard}>
            <p style={styles.cardLabel}>Money in <span style={{ color: 'var(--accent)' }}>(recent)</span></p>
            <p style={styles.miniAmount}>+${totalIn.toFixed(2)}</p>
          </Card>
          <Card style={styles.miniCard}>
            <p style={styles.cardLabel}>Money out <span style={{ color: 'var(--danger)' }}>(recent)</span></p>
            <p style={{ ...styles.miniAmount, color: 'var(--danger)' }}>-${totalOut.toFixed(2)}</p>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div style={styles.actions}>
        <Button onClick={() => navigate('/wallet')} style={{ flex: 1 }}>
          Add funds
        </Button>
        <Button onClick={() => navigate('/send')} variant="secondary" style={{ flex: 1 }}>
          Send money
        </Button>
        <Button onClick={() => navigate('/transactions')} variant="ghost" style={{ flex: 1 }}>
          Full history
        </Button>
      </div>

      {/* Recent transactions */}
      <div style={{ marginTop: 36 }}>
        <h3 style={styles.sectionHead}>Recent activity</h3>

        {loading ? (
          <div style={styles.loadingRow}>
            {[1,2,3].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : txns.length === 0 ? (
          <Card style={styles.empty}>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>No transactions yet. Make your first transfer!</p>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {txns.map((tx, i) => (
              <TxRow key={tx.id} tx={tx} isLast={i === txns.length - 1} />
            ))}
          </Card>
        )}
      </div>
    </PageShell>
  )
}

function TxRow({ tx, isLast }) {
  const isCredit = tx.type === 'credit'
  const isTopUp  = tx.note === 'Wallet top-up'
  const label    = isTopUp ? 'Top-up' : isCredit ? `From ${tx.counterparty?.name}` : `To ${tx.counterparty?.name}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 20px',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: isCredit ? 'var(--accent-dim)' : '#ff4f6a15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {isTopUp ? '↓' : isCredit ? '↙' : '↗'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>
          {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {tx.note && !isTopUp ? ` · ${tx.note}` : ''}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: isCredit ? 'var(--accent)' : 'var(--danger)' }}>
          {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
        </p>
        <Badge type={tx.status}>{tx.status}</Badge>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 20px', alignItems: 'center' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-input)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, width: '55%', background: 'var(--bg-input)', borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 10, width: '35%', background: 'var(--bg-input)', borderRadius: 6 }} />
      </div>
    </div>
  )
}

const styles = {
  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 200px',
    gap: 14, marginBottom: 20,
  },
  balanceCard: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #0d1a14 0%, #111118 100%)',
    border: '1px solid #00e5a025',
  },
  cardLabel: { fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 },
  bigAmount: {
    fontFamily: 'var(--font-head)', fontSize: '2.4rem',
    fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1,
  },
  cardSub: { fontSize: '0.75rem', color: 'var(--muted)', marginTop: 8 },
  pulseRing: {
    position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
    width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  miniCard: { flex: 1, padding: '16px 20px' },
  miniAmount: {
    fontFamily: 'var(--font-head)', fontSize: '1.3rem',
    fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', marginTop: 6,
  },
  actions: {
    display: 'flex', gap: 10, marginTop: 6,
  },
  sectionHead: {
    fontSize: '0.85rem', color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontFamily: 'var(--font-mono)', fontWeight: 400, marginBottom: 14,
  },
  loadingRow: { display: 'flex', flexDirection: 'column', gap: 0 },
  empty: { padding: 24 },
}
