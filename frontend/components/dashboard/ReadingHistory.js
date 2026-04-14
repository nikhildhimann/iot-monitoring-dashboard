"use client";

import { formatBoolean, formatDateTime, formatWeight } from "@/utils/formatters";
import Link from "next/link";


export default function ReadingHistory({
  readings,
  isLoading = false,
  meta = { page: 1, totalPages: 0 },
  onPageChange,
  filters = { vibration: "", startDate: "", endDate: "", sortOrder: "desc" },
  onFilterChange,
  isMobilePreview = false,
  externalModalOpen = false,
  onOpenFilters = () => {},
  onCloseFilters,
}) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const displayReadings = isMobilePreview ? readings.slice(0, 10) : readings;

  const renderFiltersContent = () => (
    <div className="dashboard-filters" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent' }}>
      <div className="filter-group">
        <label className="filter-label">Vibration Status</label>
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
  );

  return (
    <section className="dashboard-card" style={{ 
      border: isMobilePreview ? '1px solid var(--card-border)' : '1px solid var(--card-border)', 
      background: 'var(--card-bg)', 
      boxShadow: 'var(--shadow-sm)' 
    }}>
      <div className="dashboard-card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="dashboard-card-title">Activity Logs</h2>
        
        {/* Filter Trigger next to heading for history page (mobile only) */}
        {!isMobilePreview && (
          <button 
            className="history-filter-trigger mobile-only"
            onClick={() => onOpenFilters()}
            style={{ fontSize: '1.1rem', padding: '0.4rem' }}
          >
            🔍
          </button>
        )}
      </div>

      {/* Show filters inline ONLY on desktop if not mobile preview */}
      {!isMobilePreview && (
        <div className="desktop-only">
          <div className="dashboard-filters" style={{ marginBottom: '2rem' }}>
            {renderFiltersContent()}
          </div>
        </div>
      )}

      {/* Filter Modal for Mobile */}
      {externalModalOpen && (
        <div className="modal-overlay" onClick={onCloseFilters}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '350px' }}>
            <div className="dashboard-card-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="dashboard-card-title">Filter Activity</h2>
              <button className="dashboard-action-link" onClick={onCloseFilters}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {renderFiltersContent()}
               <button className="dashboard-button" style={{ width: '100%' }} onClick={onCloseFilters}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="dashboard-list-empty" style={{ borderStyle: 'none', background: 'transparent' }}>
          <p>Accessing data logs...</p>
        </div>
      ) : null}

      {!isLoading && readings.length === 0 ? (
        <div className="dashboard-list-empty">
          <p>No activity recorded for the current filter selection.</p>
        </div>
      ) : null}

      {!isLoading && readings.length > 0 ? (
        <>
          <div className="dashboard-list">
            {displayReadings.map((reading) => (
              <article key={reading._id} className="dashboard-list-item">
                <div className="dashboard-list-row" style={{ marginBottom: '1rem' }}>
                  <div className="dashboard-list-content">
                    <p className="dashboard-list-title" style={{ fontSize: '1.25rem' }}>
                      {formatWeight(reading.weight)}
                    </p>
                    <p className="dashboard-list-meta">{formatDateTime(reading.timestamp)}</p>
                  </div>
                  {reading.vibration && (
                    <span className="status-badge status-open">
                      Vibration Detected
                    </span>
                  )}
                </div>
                
                <div className="dashboard-list-row" style={{ gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                  <div className="status-badge status-cleared">
                    Buzzer: {formatBoolean(reading.buzzerOn)}
                  </div>
                  <div className="status-badge status-cleared">
                    LED: {formatBoolean(reading.ledOn)}
                  </div>
                  <div className="status-badge status-cleared">
                      WiFi: {reading.wifiSignal} dBm
                  </div>
                   <div className="status-badge status-cleared">
                      IP: {reading.ipAddress}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!isMobilePreview ? (
            <div className="dashboard-pagination">
              <button
                className="dashboard-pagination-btn"
                disabled={meta.page <= 1}
                onClick={() => onPageChange(meta.page - 1)}
              >
                Previous
              </button>
              <span className="dashboard-pagination-info">
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <button
                className="dashboard-pagination-btn"
                disabled={meta.page >= meta.totalPages}
                onClick={() => onPageChange(meta.page + 1)}
              >
                Next
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
               <Link href="/history" className="dashboard-button" style={{ width: '100%', background: 'var(--accent)', color: 'var(--foreground)', border: '1px solid var(--card-border)', textDecoration: 'none' }}>
                 View Full Activity History
               </Link>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
