"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import ReadingHistory from "@/components/dashboard/ReadingHistory";
import DeviceSelector from "@/components/dashboard/DeviceSelector";
import Link from "next/link";

export default function HistoryPage() {
  const { token, user, isAuthenticated, isHydrated, logout } = useAuth();
  const router = useRouter();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

  const {
    devices,
    selectedDeviceId,
    readingHistory,
    readingsMeta,
    readingsPage,
    setReadingsPage,
    readingFilters,
    setReadingFilters,
    isHistoryLoading,
    setSelectedDeviceId,
  } = useDashboardData({ token });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="page-shell">
      <div className="dashboard-page">
        <header className="dashboard-header">
           <div className="dashboard-header-row" style={{ alignItems: 'center' }}>
            <div>
              <Link href="/dashboard" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>←</span> Back to Home
              </Link>
            </div>
            
            <div className="history-header-actions" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
              <div 
                className="custom-dropdown-trigger"
                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: 'var(--accent)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  minWidth: '180px',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{selectedDevice?.name || selectedDeviceId || "Select"}</span>
                </div>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{showDeviceDropdown ? '▲' : '▼'}</span>
              </div>

              {showDeviceDropdown && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setShowDeviceDropdown(false)} />
                  <div 
                    className="custom-dropdown-menu"
                    style={{ 
                      position: 'absolute', 
                      top: '110%', 
                      right: 0, 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: 'var(--radius-md)', 
                      boxShadow: 'var(--shadow-lg)', 
                      zIndex: 100, 
                      minWidth: '220px',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    {devices.map(d => (
                      <div 
                        key={d.deviceId}
                        onClick={() => { setSelectedDeviceId(d.deviceId); setShowDeviceDropdown(false); }}
                        style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: 'var(--radius-sm)', 
                          cursor: 'pointer',
                          background: d.deviceId === selectedDeviceId ? 'var(--primary-light)' : 'transparent',
                          color: d.deviceId === selectedDeviceId ? 'var(--primary)' : 'inherit',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem'
                        }}
                        className="dropdown-item-hover"
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{d.name || "Device"}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{d.deviceId}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <h1 className="dashboard-title" style={{ fontSize: '1.5rem' }}>AlertSense Logs</h1>
          </div>
        </header>

        <div className="desktop-only" style={{ marginBottom: '2rem' }}>
          {/* Invisible spacer for desktop if needed, or keeping it empty */}
        </div>


        <ReadingHistory
          readings={readingHistory}
          isLoading={isHistoryLoading}
          meta={readingsMeta}
          onPageChange={setReadingsPage}
          filters={readingFilters}
          onFilterChange={setReadingFilters}
          externalModalOpen={showFilterModal}
          onOpenFilters={() => setShowFilterModal(true)}
          onCloseFilters={() => setShowFilterModal(false)}
        />
      </div>
    </div>
  );
}
