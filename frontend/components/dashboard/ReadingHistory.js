"use client";

import { formatBoolean, formatDateTime, formatWeight } from "@/utils/formatters";

export default function ReadingHistory({
  readings,
  isLoading = false,
  meta = { page: 1, totalPages: 0 },
  onPageChange,
  filters = { vibration: "", startDate: "", endDate: "", sortOrder: "desc" },
  onFilterChange,
}) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">History Logs</h2>
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label className="filter-label">Vibration</label>
          <select
            className="filter-select"
            value={filters.vibration}
            onChange={(e) => handleFilterChange("vibration", e.target.value)}
          >
            <option value="">All Readings</option>
            <option value="true">Detected Only</option>
            <option value="false">Clear Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort Date</label>
          <select
              className="filter-select"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
      </div>

      {isLoading ? <p className="dashboard-loading">Accessing logs...</p> : null}

      {!isLoading && readings.length === 0 ? (
        <div className="dashboard-list-empty">
          <p>No activity recorded yet for this session.</p>
        </div>
      ) : null}

      {!isLoading && readings.length > 0 ? (
        <>
          <div className="dashboard-list">
            {readings.map((reading) => (
              <article key={reading._id} className="dashboard-list-item">
                <div className="dashboard-list-row" style={{ marginBottom: '0.75rem' }}>
                  <div className="dashboard-list-content">
                    <p className="dashboard-list-title" style={{ fontSize: '1.25rem' }}>
                      {formatWeight(reading.weight)}
                    </p>
                    <p className="dashboard-list-meta">{formatDateTime(reading.timestamp)}</p>
                  </div>
                  {reading.vibration && (
                    <span className="status-badge status-open" style={{ height: 'fit-content' }}>
                      Vibration
                    </span>
                  )}
                </div>
                
                <div className="dashboard-list-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div className="status-badge" style={{ background: 'var(--accent)', color: 'var(--secondary)', border: '1px solid var(--card-border)' }}>
                    Buzzer: {formatBoolean(reading.buzzerOn)}
                  </div>
                  <div className="status-badge" style={{ background: 'var(--accent)', color: 'var(--secondary)', border: '1px solid var(--card-border)' }}>
                    LED: {formatBoolean(reading.ledOn)}
                  </div>
                  <div className="status-badge" style={{ background: 'var(--accent)', color: 'var(--secondary)', border: '1px solid var(--card-border)' }}>
                      WiFi: {reading.wifiSignal} dBm
                  </div>
                   <div className="status-badge" style={{ background: 'var(--accent)', color: 'var(--secondary)', border: '1px solid var(--card-border)' }}>
                      IP: {reading.ipAddress}
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
              {meta.page} of {meta.totalPages || 1}
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
