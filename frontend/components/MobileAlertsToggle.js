"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function MobileAlertsToggle() {
  const {
    supported,
    permission,
    isSubscribed,
    loading,
    error,
    success,
    enablePush,
    disablePush,
  } = usePushNotifications();

  if (!supported) {
    const isSecure = typeof window !== "undefined" && window.isSecureContext;
    return (
      <div className="push-status-unsupported">
        <span className="push-status-icon">🚫</span>
        <span>
          {!isSecure 
            ? "Push requires HTTPS/Secure Context" 
            : "Push alerts not supported"}
        </span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="push-status-denied">
        <span className="push-status-icon">⚠️</span>
        <span title="Enable them in browser settings">Notifications blocked</span>
      </div>
    );
  }

  return (
    <div className="mobile-alerts-control">
      {isSubscribed ? (
        <div className="push-status-active">
          <div className="push-status-info">
            <span className="push-status-icon">🔔</span>
            <span className="push-status-text">Mobile Alerts On</span>
          </div>
          <button
            onClick={disablePush}
            disabled={loading}
            className="push-action-btn disable"
            type="button"
          >
            {loading ? "..." : "Disable"}
          </button>
        </div>
      ) : (
        <div className="push-status-inactive">
          <button
            onClick={enablePush}
            disabled={loading}
            className="push-action-btn enable"
            type="button"
          >
            {loading ? "Enabling..." : "Enable Mobile Alerts"}
          </button>
        </div>
      )}
      {error && <p className="push-error-msg">{error}</p>}
      {success && <p className="push-success-msg">{success}</p>}

      <style jsx>{`
        .mobile-alerts-control {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-color, #e2e8f0);
          margin-top: 0.5rem;
        }
        .push-status-active, .push-status-inactive {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .push-status-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #1e293b);
        }
        .push-status-icon {
          font-size: 1rem;
        }
        .push-status-text {
          white-space: nowrap;
        }
        .push-action-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .push-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .push-action-btn.enable {
          background-color: var(--primary-color, #3b82f6);
          color: white;
          width: 100%;
        }
        .push-action-btn.enable:hover:not(:disabled) {
          background-color: var(--primary-hover, #2563eb);
        }
        .push-action-btn.disable {
          background-color: transparent;
          border-color: var(--danger-color, #ef4444);
          color: var(--danger-color, #ef4444);
        }
        .push-action-btn.disable:hover:not(:disabled) {
          background-color: var(--danger-color, #ef4444);
          color: white;
        }
        .push-status-unsupported, .push-status-denied {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
          margin-top: 0.5rem;
        }
        .push-error-msg {
          color: var(--danger-color, #ef4444);
          font-size: 0.7rem;
          margin-top: 0.5rem;
        }
        .push-success-msg {
          color: var(--success-color, #22c55e);
          font-size: 0.7rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
