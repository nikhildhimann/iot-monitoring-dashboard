"use client";

import { useMemo, useState } from "react";

import { useDashboardData } from "@/hooks/useDashboardData";
import ThemeToggle from "@/components/ThemeToggle";
import InstallAppButton from "@/components/InstallAppButton";
import PushNotificationRequest from "@/components/PushNotificationRequest";
import AlertsList from "./AlertsList";
import DeviceSelector from "./DeviceSelector";
import LiveStatusCard from "./LiveStatusCard";
import ReadingHistory from "./ReadingHistory";

export default function DashboardShell({ token, user, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);


  const {
    devices,
    selectedDeviceId,
    currentDevice,
    alerts,
    readingHistory,
    readingsMeta,
    readingsPage,
    setReadingsPage,
    readingFilters,
    setReadingFilters,
    isHistoryLoading,
    alertTab,
    setAlertTab,
    allAlerts,
    alertsMeta,
    alertsPage,
    setAlertsPage,
    isAlertsLoading,
    isLoadingDevices,
    isLoadingDetails,
    error,
    setSelectedDeviceId,
    onClearAlert,
    onClearAllAlerts,
    totalOpenAlerts,
  } = useDashboardData({ token });

  const greeting = useMemo(() => {
    return user?.name ? `Hello, ${user.name}` : "Hello";
  }, [user?.name]);

  return (
    <div className="page-shell">
      <div className="dashboard-page">
        <PushNotificationRequest />
        <header className="dashboard-header">
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title">AlertSense</h1>
              <p className="dashboard-subtitle">{greeting} • Manage your connected hardware</p>
            </div>
            <div className="dashboard-actions">
              {/* Notification Bell - Mobile Only */}
              <button 
                className="notification-bell mobile-only" 
                onClick={() => setShowNotifications(true)}
                aria-label="Notifications"
              >
                <span>🔔</span>
                {totalOpenAlerts > 0 && <span className="notification-badge">{totalOpenAlerts}</span>}
              </button>

              <InstallAppButton />
              <ThemeToggle />
              
              <button
                type="button"
                className="dashboard-button btn-secondary desktop-only"
                style={{ padding: '0.5rem 1rem', height: '40px' }}
                onClick={() => setShowLogoutConfirm(true)}
              >
                <span className="btn-text">Sign Out</span>
              </button>

              {/* Sign Out Icon - Mobile Only */}
              <button 
                className="logout-icon-btn mobile-only"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Logout"
              >
                <img src="/logout.png" alt="Sign Out" style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
          {error ? <p className="dashboard-error" style={{ marginTop: '1rem' }}>{error}</p> : null}
        </header>

        <DeviceSelector
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          disabled={isLoadingDevices}
        />

        <div className="dashboard-grid">
          <main className="dashboard-grid-main">
            <div className="device-live-status">
              <LiveStatusCard device={currentDevice} isLoading={isLoadingDevices || isLoadingDetails} />
            </div>



            <div className="device-history">
              <ReadingHistory
                readings={readingHistory}
                isLoading={isLoadingDetails || isHistoryLoading}
                meta={readingsMeta}
                onPageChange={setReadingsPage}
                filters={readingFilters}
                onFilterChange={setReadingFilters}
                isMobilePreview={true}
              />
            </div>
          </main>

          <aside className="dashboard-grid-side desktop-only-aside">
            <AlertsList
              alerts={allAlerts}
              isLoading={isLoadingDetails || isAlertsLoading}
              meta={alertsMeta}
              onPageChange={setAlertsPage}
              onClear={onClearAlert}
              onClearAll={onClearAllAlerts}
              activeTab={alertTab}
              onTabChange={setAlertTab}
            />
          </aside>
        </div>

        {/* Mobile Notification Panel */}
        {showNotifications && (
          <div className="notification-panel-overlay" onClick={() => setShowNotifications(false)}>
            <div className="notification-panel" onClick={e => e.stopPropagation()}>
              <div className="notification-panel-header">
                <h2>Device Alerts</h2>
                <button className="dashboard-action-link" onClick={() => setShowNotifications(false)} style={{ fontSize: '1.5rem' }}>✕</button>
              </div>
              <div className="notification-panel-body">
                <AlertsList
                  alerts={allAlerts}
                  isLoading={isLoadingDetails || isAlertsLoading}
                  meta={alertsMeta}
                  onPageChange={setAlertsPage}
                  onClear={onClearAlert}
                  onClearAll={onClearAllAlerts}
                  activeTab={alertTab}
                  onTabChange={setAlertTab}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Are you sure?</h2>
            <p className="modal-message">Do you really want to sign out of the dashboard?</p>
            <div className="modal-actions">
              <button 
                className="dashboard-button btn-secondary" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="dashboard-button btn-danger" 
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
