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
        <h2 className="dashboard-card-title">Reading History</h2>
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label className="filter-label">Vibration</label>
          <select
            className="filter-select"
            value={filters.vibration}
            onChange={(e) => handleFilterChange("vibration", e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Detected</option>
            <option value="false">None</option>
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

        <div className="filter-group">
          <label className="filter-label">Sort</label>
          <select
            className="filter-select"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {isLoading ? <p className="dashboard-loading">Loading reading history...</p> : null}

      {!isLoading && readings.length === 0 ? (
        <p className="dashboard-list-empty">No readings found matching filters.</p>
      ) : null}

      {!isLoading && readings.length > 0 ? (
        <>
          <div className="dashboard-list">
            {readings.map((reading) => (
              <article key={reading._id} className="dashboard-list-item">
                <div className="dashboard-list-row">
                  <p className="dashboard-list-title">{formatWeight(reading.weight)}</p>
                  <p className="dashboard-list-meta">{formatDateTime(reading.timestamp)}</p>
                </div>
                <p className="dashboard-list-subtitle">
                  vibration: {formatBoolean(reading.vibration)} | buzzer: {formatBoolean(reading.buzzerOn)} |
                  led: {formatBoolean(reading.ledOn)}
                </p>
                <p className="dashboard-list-meta">
                  WiFi: {reading.wifiSignal} dBm | IP: {reading.ipAddress}
                </p>
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
