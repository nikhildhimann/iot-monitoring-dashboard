"use client";

import { formatDateTime } from "@/utils/formatters";

export default function AlertsList({
  alerts,
  isLoading = false,
  meta = { page: 1, totalPages: 0 },
  onPageChange,
  onClear,
  onClearAll,
  activeTab = "open",
  onTabChange,
}) {
  return (
    <section className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 600 }}>
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Device Alerts</h2>
        {activeTab === "open" && alerts.length > 0 && (
          <button className="dashboard-action-link" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === "open" ? "active" : ""}`}
          onClick={() => onTabChange("open")}
        >
          Open
        </button>
        <button
          className={`dashboard-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => onTabChange("history")}
        >
          History
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {isLoading ? (
          <div className="dashboard-list-empty" style={{ borderStyle: 'none', background: 'transparent' }}>
            <p>Loading alerts...</p>
          </div>
        ) : null}

        {!isLoading && alerts.length === 0 ? (
          <div className="dashboard-list-empty">
            <p>No {activeTab} alerts for this device.</p>
          </div>
        ) : null}

        {!isLoading && alerts.length > 0 ? (
          <div className="dashboard-list">
            {alerts.map((alert) => (
              <article key={alert._id} className="dashboard-list-item">
                <div className="dashboard-list-row" style={{ marginBottom: '0.75rem' }}>
                  <p className="dashboard-list-title" style={{ fontSize: '0.875rem' }}>{alert.type}</p>
                  <span className={`status-badge status-${alert.status}`}>
                    {alert.status}
                  </span>
                </div>
                
                <div className="dashboard-list-content">
                  <p className="dashboard-list-subtitle">{alert.message}</p>
                  
                  <div className="dashboard-list-row" style={{ marginTop: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <p className="dashboard-list-meta">Severity: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{alert.severity}</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="dashboard-list-meta">{formatDateTime(alert.triggeredAt)}</p>
                    </div>
                  </div>

                  {activeTab === "open" && alert.status === "open" && (
                    <div style={{ marginTop: '1rem' }}>
                      <button className="dashboard-list-action" style={{ width: '100%' }} onClick={() => onClear(alert._id)}>
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {!isLoading && alerts.length > 0 && (
        <div className="dashboard-pagination">
          <button
            className="dashboard-pagination-btn"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Prev
          </button>
          <span className="dashboard-pagination-info">
            {meta.page} / {meta.totalPages || 1}
          </span>
          <button
            className="dashboard-pagination-btn"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
