"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import ThemeToggle from "@/components/ThemeToggle";
import InstallAppButton from "@/components/InstallAppButton";
import PushNotificationRequest from "@/components/PushNotificationRequest";
import DeviceSelector from "./DeviceSelector";
import LiveStatusCard from "./LiveStatusCard";
import AlertsList from "./AlertsList";
import ReadingHistory from "./ReadingHistory";

export default function DashboardShell({ token, user, onLogout }) {
  const [showDetails, setShowDetails] = useState(false);
  const [socketEnabled, setSocketEnabled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Enable UI and socket after first mount
  useEffect(() => {
    setShowDetails(true);
    setSocketEnabled(true);
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isProfileMenuOpen]);


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
  } = useDashboardData({ token, socketEnabled });

  const greeting = useMemo(() => {
    return user?.name ? `Hello, ${user.name}` : "Hello";
  }, [user?.name]);
  const mobileGreeting = user?.name ? `Hi, ${user.name}` : "Hi";
  const userInitial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="page-shell">
      <div className="dashboard-page">
        <PushNotificationRequest />
        <header className="dashboard-header">
          <div className="dashboard-header-row">
            <div className="dashboard-title-group">
              <h1 className="dashboard-title">AlertSense</h1>
              <p className="dashboard-subtitle">{greeting} • Manage your connected hardware</p>
              <p className="dashboard-mobile-greeting">{mobileGreeting}</p>
            </div>
            <div className="dashboard-actions">
              <button 
                className="notification-bell" 
                onClick={() => setShowNotifications(true)}
                aria-label="Notifications"
              >
                <span>🔔</span>
                {totalOpenAlerts > 0 && <span className="notification-badge">{totalOpenAlerts}</span>}
              </button>

              <InstallAppButton />
              <ThemeToggle />

              <div className="profile-menu" ref={profileMenuRef}>
                <button
                  type="button"
                  className="profile-menu-trigger"
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                  aria-label="Open profile menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className="profile-avatar profile-avatar-small">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </span>
                  <span className="profile-menu-name">{user?.name || "Profile"}</span>
                  <span className="profile-menu-arrow" aria-hidden="true">▾</span>
                </button>

                {isProfileMenuOpen ? (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-user">
                      <span className="profile-avatar profile-avatar-small">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </span>
                      <div className="profile-dropdown-user-text">
                        <p className="profile-dropdown-name">{user?.name || "Profile"}</p>
                        <p className="profile-dropdown-email">{user?.email || ""}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="profile-dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="profile-dropdown-item profile-dropdown-danger"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
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
              {showDetails ? (
                <LiveStatusCard device={currentDevice} isLoading={isLoadingDevices || isLoadingDetails} />
              ) : (
                <div className="skeleton" style={{ height: "150px" }} />
              )}
            </div>

            <div className="device-history">
              {showDetails ? (
                <ReadingHistory
                  readings={readingHistory}
                  isLoading={isLoadingDetails || isHistoryLoading}
                  meta={readingsMeta}
                  onPageChange={setReadingsPage}
                  filters={readingFilters}
                  onFilterChange={setReadingFilters}
                  isMobilePreview={true}
                />
              ) : (
                <div className="skeleton" style={{ height: "250px" }} />
              )}
            </div>
          </main>

          <aside className="dashboard-grid-side desktop-only-aside">
            {showDetails ? (
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
            ) : (
              <div className="skeleton" style={{ height: "400px" }} />
            )}
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
            <h2 className="modal-title">Logout?</h2>
            <p className="modal-message">Are you sure you want to logout?</p>
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
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
