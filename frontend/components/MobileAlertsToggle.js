"use client";

import { useEffect, useState } from "react";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { enableAlertSound, isAlertSoundEnabled } from "@/utils/alertSound";

export default function MobileAlertsToggle() {
  const [alertSoundOn, setAlertSoundOn] = useState(false);
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

  useEffect(() => {
    setAlertSoundOn(isAlertSoundEnabled());
  }, []);

  const handleEnableAlertSound = async () => {
    await enableAlertSound();
    setAlertSoundOn(true);
  };

  const alertSoundControl = (
    <div className="alert-sound-control">
      {alertSoundOn ? (
        <span className="alert-sound-status">Alert Sound On</span>
      ) : (
        <button
          onClick={handleEnableAlertSound}
          className="push-action-btn enable alert-sound-btn"
          type="button"
        >
          Enable Alert Sound
        </button>
      )}
      <p className="alert-sound-note">Plays only while dashboard is open.</p>
    </div>
  );

  if (!supported) {
    const isSecure = typeof window !== "undefined" && window.isSecureContext;
    return (
      <div className="mobile-alerts-control">
        <div className="push-status-unsupported">
          <span className="push-status-icon">🚫</span>
          <span>
            {!isSecure 
              ? "Push requires HTTPS/Secure Context" 
              : "Push alerts not supported"}
          </span>
        </div>
        {alertSoundControl}
        <style jsx>{alertControlStyles}</style>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="mobile-alerts-control">
        <div className="push-status-denied">
          <span className="push-status-icon">⚠️</span>
          <span title="Enable them in browser settings">Notifications blocked</span>
        </div>
        {alertSoundControl}
        <style jsx>{alertControlStyles}</style>
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
      {alertSoundControl}

      <style jsx>{alertControlStyles}</style>
    </div>
  );
}

const alertControlStyles = `
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #64748b);
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
        .alert-sound-control {
          border-top: 1px solid var(--border-color, #e2e8f0);
          margin-top: 0.65rem;
          padding-top: 0.65rem;
        }
        .alert-sound-btn {
          width: 100%;
        }
        .alert-sound-status {
          display: block;
          border: 1px solid rgba(34, 197, 94, 0.35);
          border-radius: 0.375rem;
          color: var(--success-color, #22c55e);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.4rem 0.75rem;
          text-align: center;
        }
        .alert-sound-note {
          color: var(--text-secondary, #64748b);
          font-size: 0.68rem;
          line-height: 1.3;
          margin-top: 0.4rem;
        }
`;
