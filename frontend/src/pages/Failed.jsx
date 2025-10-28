import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getFailedReminders, resendReminder } from "../api/reminders";

export default function Failed() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await getFailedReminders(token);
        if (mounted) setItems(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [token]);

  const handleResend = async (id) => {
    if (!token) return;
    setBusyId(id);
    try {
      const res = await resendReminder(id, token);
      // if delivered, remove from list
      if (res.status === 200) {
        setItems((prev) => prev.filter((p) => p._id !== id));
      } else {
        // update item with lastError if available
        setItems((prev) =>
          prev.map((it) =>
            it._id === id
              ? {
                  ...it,
                  lastError: res.data?.lastError,
                  retryCount: res.data?.retryCount,
                }
              : it
          )
        );
      }
    } catch (err) {
      const data = err?.response?.data;
      setItems((prev) =>
        prev.map((it) =>
          it._id === id
            ? {
                ...it,
                lastError: data?.lastError,
                retryCount: data?.retryCount,
              }
            : it
        )
      );
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <h2>Failed Reminders</h2>
      <p style={{ color: "var(--muted)" }}>
        Reminders that failed delivery — you can attempt a manual resend below.
      </p>

      {loading && <div className="loader">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">No failed reminders. Nice work.</div>
      )}

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <div key={item._id} className="feature-card card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{item.message}</div>
                <div className="reminder-meta">
                  To: {item.recipientEmail || item.recipientPhone} •{" "}
                  {new Date(item.remindAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  Retries: {item.retryCount || 0}
                </div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 8 }}
                  onClick={() => handleResend(item._id)}
                  disabled={busyId === item._id}
                >
                  {busyId === item._id ? "Resending…" : "Resend"}
                </button>
              </div>
            </div>
            {item.lastError && (
              <div style={{ marginTop: 10, color: "#ffb4b4", fontSize: 13 }}>
                Last error: {item.lastError}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
