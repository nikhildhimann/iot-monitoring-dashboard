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
          Open Alerts
        </button>
        <button
          className={`dashboard-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => onTabChange("history")}
        >
          Alert History
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
                <div className="dashboard-list-row">
                  <p className="dashboard-list-title">{alert.type}</p>
                  <div className="dashboard-list-actions">
                    <span className={`status-badge status-${alert.status}`}>
                      {alert.status}
                    </span>
                    {activeTab === "open" && alert.status === "open" && (
                      <button className="dashboard-list-action" onClick={() => onClear(alert._id)}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <p className="dashboard-list-subtitle">{alert.message}</p>
                <div className="dashboard-list-row">
                  <p className="dashboard-list-meta">Severity: {alert.severity}</p>
                  <div className="alert-timestamps">
                    <p className="dashboard-list-meta">Triggered: {formatDateTime(alert.triggeredAt)}</p>
                    {alert.status === "resolved" && alert.resolvedAt && (
                      <p className="dashboard-list-meta">Resolved: {formatDateTime(alert.resolvedAt)}</p>
                    )}
                    {alert.status === "cleared" && alert.clearedAt && (
                      <p className="dashboard-list-meta">Cleared: {formatDateTime(alert.clearedAt)}</p>
                    )}
                  </div>
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
