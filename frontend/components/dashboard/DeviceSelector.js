"use client";

export default function DeviceSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  disabled = false,
}) {
  return (
    <div className="device-selector-card">
      <span className="device-selector-label">Active Device:</span>
      <select
        className="dashboard-select device-selector-select"
        value={selectedDeviceId}
        onChange={(event) => onDeviceChange(event.target.value)}
        disabled={disabled || devices.length === 0}
      >
        {devices.length === 0 ? <option value="">No devices available</option> : null}
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.deviceId} {device.status === 'online' ? '(Online)' : '(Offline)'}
          </option>
        ))}
      </select>
    </div>
  );
}
