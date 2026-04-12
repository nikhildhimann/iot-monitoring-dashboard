"use client";

import {
  formatBoolean,
  formatDateTime,
  formatUptime,
  formatWifiSignal,
  formatWeight,
} from "@/utils/formatters";

const liveFields = [
  { key: "deviceId", label: "Device ID", format: (value) => value || "--" },
  { key: "weight", label: "Current Weight", format: formatWeight },
  { key: "vibration", label: "Vibration Detection", format: formatBoolean },
  { key: "buzzerOn", label: "Buzzer Status", format: formatBoolean },
  { key: "ledOn", label: "LED Indicator", format: formatBoolean },
  { key: "wifiSignal", label: "WiFi Strength", format: formatWifiSignal },
  { key: "uptime", label: "System Uptime", format: formatUptime },
  { key: "ipAddress", label: "IP Address", format: (value) => value || "--" },
  { key: "lastReadingAt", label: "Last Reported", format: formatDateTime },
];

export default function LiveStatusCard({ device, isLoading = false }) {
  const isOnline = device?.status === "online";

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Live Telemetry</h2>
        {device && (
          <span className={`status-badge ${isOnline ? "status-online" : "status-offline"}`} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            {isOnline ? "• System Online" : "• System Offline"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p className="dashboard-loading">Syncing with hardware...</p>
        </div>
      ) : null}

      {!isLoading && !device ? (
        <div className="dashboard-list-empty">
          <p>Please select a device from the selector to begin monitoring.</p>
        </div>
      ) : null}

      {!isLoading && device ? (
        <div className="device-meta-grid">
          {liveFields.map((field) => (
            <div key={field.key} className="device-meta-item">
              <span className="device-meta-label">{field.label}</span>
              <span className="device-meta-value">{field.format(device[field.key])}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
