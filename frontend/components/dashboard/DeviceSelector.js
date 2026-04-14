"use client";

import { useState } from "react";

export default function DeviceSelector({
  devices,
  selectedDeviceId,
  onDeviceChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

  const handleSelect = (deviceId) => {
    onDeviceChange(deviceId);
    setIsOpen(false);
  };

  return (
    <div className="device-selector-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span className="device-selector-label">Device:</span>
          <span className="device-meta-value" style={{ fontSize: '0.95rem', fontWeight: '700' }}>
            {selectedDevice?.name || selectedDeviceId || "None"}
          </span>
          {selectedDevice && (
            <span className={`status-badge ${selectedDevice.status === 'online' ? 'status-online' : 'status-offline'}`} style={{ padding: '0.1rem 0.6rem', fontSize: '0.6rem' }}>
              {selectedDevice.status}
            </span>
          )}
        </div>
        
        <button 
          className="dashboard-button" 
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          onClick={() => setIsOpen(true)}
          disabled={disabled || devices.length === 0}
        >
          Change Device
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'left' }}>
            <div className="dashboard-card-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="dashboard-card-title">Select Hardware</h2>
              <button className="dashboard-action-link" onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem' }}>✕</button>
            </div>
            
            <div className="dashboard-list" style={{ maxHeight: '400px', overflowY: 'auto', gap: '0.75rem' }}>
              {devices.length === 0 ? (
                <p className="dashboard-list-empty">No active devices found.</p>
              ) : (
                devices.map((device) => (
                  <button
                    key={device.deviceId}
                    className={`dashboard-list-item ${device.deviceId === selectedDeviceId ? 'active-item' : ''}`}
                    onClick={() => handleSelect(device.deviceId)}
                    style={{ 
                      width: '100%', 
                      border: '1px solid var(--card-border)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: device.deviceId === selectedDeviceId ? 'var(--primary-light)' : 'var(--card-bg)',
                      borderColor: device.deviceId === selectedDeviceId ? 'var(--primary)' : 'var(--card-border)'
                    }}
                  >
                    <div className="dashboard-list-row">
                      <div className="dashboard-list-content">
                        <p className="dashboard-list-title">{device.name || "Unnamed Device"}</p>
                        <p className="dashboard-list-meta">{device.deviceId}</p>
                      </div>
                      <span className={`status-badge ${device.status === 'online' ? 'status-online' : 'status-offline'}`}>
                        {device.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
