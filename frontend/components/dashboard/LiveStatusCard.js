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
  { key: "weight", label: "Weight", format: formatWeight },
  { key: "vibration", label: "Vibration", format: formatBoolean },
  { key: "buzzerOn", label: "Buzzer", format: formatBoolean },
  { key: "ledOn", label: "LED", format: formatBoolean },
  { key: "wifiSignal", label: "WiFi Signal", format: formatWifiSignal },
  { key: "uptime", label: "Uptime", format: formatUptime },
  { key: "ipAddress", label: "IP Address", format: (value) => value || "--" },
  { key: "lastReadingAt", label: "Last Reading", format: formatDateTime },
];

export default function LiveStatusCard({ device, isLoading = false }) {
  const isOnline = device?.status === "online";

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Live Status</h2>
        {device && (
          <div className={`status-badge ${isOnline ? "status-online" : "status-offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </div>
        )}
      </div>

      {isLoading ? <p className="dashboard-loading">Loading latest device state...</p> : null}

      {!isLoading && !device ? (
        <p className="dashboard-list-empty">Select a device to see live status.</p>
      ) : null}

      {!isLoading && device ? (
        <div className="device-meta-grid">
          {liveFields.map((field) => (
            <div key={field.key} className="device-meta-item">
              <p className="device-meta-label">{field.label}</p>
              <p className="device-meta-value">{field.format(device[field.key])}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
