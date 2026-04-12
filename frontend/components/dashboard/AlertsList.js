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
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Alerts</h2>
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

      {isLoading ? <p className="dashboard-loading">Loading alerts...</p> : null}

      {!isLoading && alerts.length === 0 ? (
        <p className="dashboard-list-empty">No {activeTab} alerts for this device.</p>
      ) : null}

      {!isLoading && alerts.length > 0 ? (
        <>
          <div className="dashboard-list">
            {alerts.map((alert) => (
              <article key={alert._id} className="dashboard-list-item">
                <div className="dashboard-list-row" style={{ marginBottom: '0.5rem' }}>
                  <p className="dashboard-list-title">{alert.type}</p>
                  <span className={`status-badge status-${alert.status}`}>
                    {alert.status}
                  </span>
                </div>
                
                <div className="dashboard-list-content">
                  <p className="dashboard-list-subtitle">{alert.message}</p>
                  
                  <div className="dashboard-list-row" style={{ marginTop: '0.75rem', alignItems: 'flex-end' }}>
                    <div>
                        <p className="dashboard-list-meta">Severity: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{alert.severity}</span></p>
                    </div>
                    <div className="alert-timestamps" style={{ textAlign: 'right' }}>
                      <p className="dashboard-list-meta">{formatDateTime(alert.triggeredAt)}</p>
                    </div>
                  </div>

                  {activeTab === "open" && alert.status === "open" && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button className="dashboard-list-action" onClick={() => onClear(alert._id)}>
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="dashboard-pagination">
            <button
              className="dashboard-pagination-btn"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
            >
              Previous
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
        </>
      ) : null}
    </section>
  );
}
