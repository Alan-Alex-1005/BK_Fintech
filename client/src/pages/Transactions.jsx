import { useEffect, useState } from "react";
import { Card, Badge, PageShell, SectionTitle, Button } from "../components/UI";
import api from "../api/axios";

const FILTERS = ["all", "credit", "debit"];

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // ✅ FIXED: Inline fetch (no ESLint warning)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const { data } = await api.get(
          `/transactions?page=${page}&limit=10`
        );

        setTxns(data?.transactions || []);
        setPagination(data?.pagination || {});
      } catch (err) {
        console.error("Failed to load transactions:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const displayed = txns.filter(
    (t) => filter === "all" || t.type === filter
  );

  return (
    <PageShell>
      <SectionTitle
        title="Transaction history"
        subtitle="All your sends and receives"
      />

      {/* Filters */}
      <div style={styles.tabs}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.tab,
              background: filter === f ? "var(--bg-card)" : "transparent",
              color: filter === f ? "var(--text)" : "var(--muted)",
              border: `1px solid ${
                filter === f ? "var(--border-md)" : "transparent"
              }`,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        {pagination?.total > 0 && (
          <span style={styles.totalBadge}>
            {pagination.total} total
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      ) : displayed.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>📭</p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {filter === "all"
              ? "No transactions yet."
              : `No ${filter} transactions.`}
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={styles.tableHead}>
            <span style={{ flex: 2 }}>Description</span>
            <span style={{ flex: 1, textAlign: "right" }}>Amount</span>
            <span style={{ flex: 1, textAlign: "right" }}>
              Balance after
            </span>
            <span style={{ flex: 1, textAlign: "right" }}>Status</span>
            <span style={{ flex: 1.4, textAlign: "right" }}>Date</span>
          </div>

          {displayed.map((tx, i) => (
            <TxRow
              key={tx._id}
              tx={tx}
              isLast={i === displayed.length - 1}
            />
          ))}
        </Card>
      )}

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div style={styles.pagination}>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            style={{ padding: "8px 16px", fontSize: "0.82rem" }}
          >
            ← Prev
          </Button>

          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            Page {page} of {pagination.pages}
          </span>

          <Button
            variant="ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.pages}
            style={{ padding: "8px 16px", fontSize: "0.82rem" }}
          >
            Next →
          </Button>
        </div>
      )}
    </PageShell>
  );
}

function TxRow({ tx, isLast }) {
  const isCredit = tx.type === "credit";
  const isTopUp = tx.note === "Wallet top-up";

  const label = isTopUp
    ? "Wallet top-up"
    : isCredit
    ? `Received from ${tx.counterparty?.name || "Unknown"}`
    : `Sent to ${tx.counterparty?.name || "Unknown"}`;

  const date = new Date(tx.createdAt || tx.timestamp);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "13px 20px",
        gap: 12,
        borderBottom: isLast ? "none" : "1px solid var(--border)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: isCredit ? "var(--accent-dim)" : "#ff4f6a12",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isCredit ? "var(--accent)" : "var(--danger)",
        }}
      >
        {isTopUp ? "↓" : isCredit ? "↙" : "↗"}
      </div>

      {/* Description */}
      <div style={{ flex: 2 }}>
        <p>{label}</p>
        {tx.note && !isTopUp && <small>{tx.note}</small>}
      </div>

      {/* Amount */}
      <p style={{ flex: 1, textAlign: "right" }}>
        {isCredit ? "+" : "-"}${Number(tx.amount || 0).toFixed(2)}
      </p>

      {/* Balance */}
      <p style={{ flex: 1, textAlign: "right" }}>
        {tx.balanceAfter
          ? `$${Number(tx.balanceAfter).toFixed(2)}`
          : "—"}
      </p>

      {/* Status */}
      <div style={{ flex: 1, textAlign: "right" }}>
        <Badge type={tx.status}>{tx.status}</Badge>
      </div>

      {/* Date */}
      <p style={{ flex: 1.4, textAlign: "right" }}>
        {date.toLocaleDateString()}
        <br />
        {date.toLocaleTimeString()}
      </p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", padding: 14 }}>
      <div style={{ width: 34, height: 34, background: "#333" }} />
    </div>
  );
}

const styles = {
  tabs: { display: "flex", gap: 6, marginBottom: 16 },
  tab: { padding: "6px 16px", borderRadius: 20, cursor: "pointer" },
  totalBadge: { marginLeft: "auto", fontSize: 12 },
  tableHead: {
    display: "flex",
    padding: "10px 20px 10px 68px",
    fontSize: 12,
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
};