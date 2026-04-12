"use client";

import { useMemo } from "react";

import { useDashboardData } from "@/hooks/useDashboardData";
import AlertsList from "./AlertsList";
import DeviceSelector from "./DeviceSelector";
import LiveStatusCard from "./LiveStatusCard";
import ReadingHistory from "./ReadingHistory";

export default function DashboardShell({ token, user, onLogout }) {
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
  } = useDashboardData({ token });

  const greeting = useMemo(() => {
    return user?.name ? `Welcome, ${user.name}` : "Welcome";
  }, [user?.name]);

  return (
    <div className="page-shell">
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-header-row">
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">{greeting}</p>
            </div>
            <div className="dashboard-actions">
              <button type="button" className="dashboard-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
          {error ? <p className="dashboard-error">{error}</p> : null}
        </header>

        <DeviceSelector
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          disabled={isLoadingDevices}
        />

        <div className="dashboard-grid">
          <div className="dashboard-grid-main">
            <LiveStatusCard device={currentDevice} isLoading={isLoadingDevices || isLoadingDetails} />
            <ReadingHistory
              readings={readingHistory}
              isLoading={isLoadingDetails || isHistoryLoading}
              meta={readingsMeta}
              onPageChange={setReadingsPage}
              filters={readingFilters}
              onFilterChange={setReadingFilters}
            />
          </div>
          <div className="dashboard-grid-side">
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
    </div>
  );
}
