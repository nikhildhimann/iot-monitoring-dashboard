"use client";

export default function DeviceSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  disabled = false,
}) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-title">Device Selector</h2>
      <select
        className="dashboard-select"
        value={selectedDeviceId}
        onChange={(event) => onDeviceChange(event.target.value)}
        disabled={disabled || devices.length === 0}
      >
        {devices.length === 0 ? <option value="">No devices available</option> : null}
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.deviceId}
          </option>
        ))}
      </select>
    </div>
  );
}
