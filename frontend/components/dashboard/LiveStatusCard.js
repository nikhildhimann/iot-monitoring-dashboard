"use client";

import {
  formatBoolean,
  formatDateTime,
  formatUptime,
  formatWifiSignal,
  formatWeight,
} from "@/utils/formatters";

const liveFields = [
  { key: "weight", label: "Current Weight", format: formatWeight },

  { key: "vibration", label: "Vibration Detection", format: formatBoolean },
  { key: "buzzerOn", label: "Buzzer Status", format: formatBoolean },
  { key: "ledOn", label: "LED Indicator", format: formatBoolean },
  { key: "wifiSignal", label: "WiFi Strength", format: formatWifiSignal },
  { key: "uptime", label: "System Uptime", format: formatUptime },
  { key: "ipAddress", label: "IP Address", format: (value) => value || "--" },
  { key: "lastReadingAt", label: "Last Reported", format: formatDateTime },
];

const isActiveSignal = (value) => {
  if (value === true || value === 1) {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "on" || normalized === "1";
  }

  return false;
};

export default function LiveStatusCard({ device, isLoading = false }) {
  const isOnline = device?.status === "online";

  return (
    <section className={`dashboard-card status-card ${device ? (isOnline ? "is-online" : "is-offline") : ""}`}>
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Live Telemetry</h2>
        {device && (
          <div className="status-indicator">
            <span className={`status-badge ${isOnline ? "status-online" : "status-offline"}`}>
              <span className={`status-dot ${isOnline ? "pulse" : ""}`}></span>
              {isOnline ? "System Online" : "System Offline"}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="dashboard-list-empty" style={{ borderStyle: 'none', background: 'transparent' }}>
            <p>Syncing with hardware...</p>
        </div>
      ) : null}

      {!isLoading && !device ? (
        <div className="dashboard-list-empty">
          <p>Please select a device from the selector to begin monitoring.</p>
        </div>
      ) : null}

      {!isLoading && device ? (
        <div className={`device-meta-grid ${!isOnline ? "dimmed" : ""}`}>
          {liveFields.map((field) => {
            const val = device[field.key];
            const isDangerActive =
              ["vibration", "buzzerOn", "ledOn"].includes(field.key) && isActiveSignal(val);

            return (
              <div
                key={field.key}
                className={`device-meta-item ${isDangerActive ? "device-meta-danger" : ""}`}
              >
                <span className="device-meta-label">{field.label}</span>
                <span className="device-meta-value">
                  {field.format(val)}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
