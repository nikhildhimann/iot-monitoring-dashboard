"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  getDeviceById,
  getLatestDevices,
  getReadingHistory,
  getRecentAlerts,
  getAlerts,
  getAlertHistory,
  clearAlert as clearAlertApi,
  clearAllAlerts as clearAllAlertsApi,
} from "@/lib/api/dashboard";
import { useDashboardSocket } from "./useDashboardSocket";

const MAX_ALERTS = 5;
const MAX_READINGS = 15;

const areDevicesEqual = (firstDevice, secondDevice) => {
  return JSON.stringify(firstDevice) === JSON.stringify(secondDevice);
};

export function useDashboardData({ token, socketEnabled = true }) {
  const { logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [currentDevice, setCurrentDevice] = useState(null);

  // Live Alerts (pinned to latest 5)
  const [alerts, setAlerts] = useState([]);

  // Reading History filters
  const [readingFilters, setReadingFilters] = useState({
    vibration: "",
    startDate: "",
    endDate: "",
    sortOrder: "desc",
  });

  // Paginated Reading History
  const [readingHistory, setReadingHistory] = useState([]);
  const [readingsMeta, setReadingsMeta] = useState({ page: 1, totalPages: 0 });
  const [readingsPage, setReadingsPage] = useState(1);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Paginated Alerts (Open vs History)
  const [alertTab, setAlertTab] = useState("open"); // "open" or "history"
  const [allAlerts, setAllAlerts] = useState([]);
  const [alertsMeta, setAlertsMeta] = useState({ page: 1, totalPages: 0, total: 0 });
  const [totalOpenAlerts, setTotalOpenAlerts] = useState(0);
  const [alertsPage, setAlertsPage] = useState(1);
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);

  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const devicesRef = useRef([]);
  const latestDetailsRequestRef = useRef(0);

  // Sensory feedback safety
  const lastVibrationTimeRef = useRef(0);
  const lastVibratedAlertIdRef = useRef("");

  const handleRequestError = useCallback(
    (requestError, fallbackMessage) => {
      if (requestError?.status === 401) {
        logout();
        return;
      }

      setError(requestError?.message || fallbackMessage);
    },
    [logout],
  );

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  const loadSelectedDeviceData = useCallback(
    async (deviceId, { keepCurrentView = false } = {}) => {
      if (!token || !deviceId) {
        return;
      }

      const requestId = latestDetailsRequestRef.current + 1;
      latestDetailsRequestRef.current = requestId;

      if (!keepCurrentView) {
        const deviceFromList =
          devicesRef.current.find((device) => device.deviceId === deviceId) || null;
        setCurrentDevice(deviceFromList);
        setIsLoadingDetails(true);
        setReadingsPage(1);
        setAlertsPage(1);
        setAlertTab("open");
        setReadingFilters({
          vibration: "",
          startDate: "",
          endDate: "",
          sortOrder: "desc",
        });
      }

      setError("");

      try {
        const [device, readingsRes, alertsRes, recentAlerts] = await Promise.all([
          getDeviceById(token, deviceId),
          getReadingHistory(token, deviceId, { page: 1, limit: MAX_READINGS }),
          getAlerts(token, deviceId, 1, 15, "open"),
          getRecentAlerts(token, deviceId, MAX_ALERTS),
        ]);

        if (latestDetailsRequestRef.current !== requestId) {
          return;
        }

        setCurrentDevice((currentValue) => {
          if (areDevicesEqual(currentValue, device)) {
            return currentValue;
          }

          return device;
        });

        setReadingHistory(readingsRes.data.readings);
        setReadingsMeta(readingsRes.meta);

        setAllAlerts(alertsRes.data.alerts);
        setAlertsMeta(alertsRes.meta);
        setTotalOpenAlerts(alertsRes.meta.total || 0);

        setAlerts(recentAlerts.slice(0, MAX_ALERTS));
      } catch (loadError) {
        if (latestDetailsRequestRef.current !== requestId) {
          return;
        }

        handleRequestError(loadError, "Failed to load dashboard data");
      } finally {
        if (!keepCurrentView && latestDetailsRequestRef.current === requestId) {
          setIsLoadingDetails(false);
        }
      }
    },
    [handleRequestError, token],
  );

  // Fetch readings when page OR filters change
  useEffect(() => {
    if (!token || !selectedDeviceId || isLoadingDetails) {
      return;
    }

    const fetchPage = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await getReadingHistory(token, selectedDeviceId, {
          page: readingsPage,
          limit: MAX_READINGS,
          ...readingFilters,
        });
        setReadingHistory(res.data.readings);
        setReadingsMeta(res.meta);
      } catch (err) {
        handleRequestError(err, "Failed to fetch history");
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchPage();
  }, [
    readingsPage,
    readingFilters,
    selectedDeviceId,
    token,
    handleRequestError,
    isLoadingDetails,
  ]);

  // Fetch alerts when page OR tab changes
  useEffect(() => {
    if (!token || !selectedDeviceId || isLoadingDetails) {
      return;
    }

    const fetchPage = async () => {
      setIsAlertsLoading(true);
      try {
        const res =
          alertTab === "open"
            ? await getAlerts(token, selectedDeviceId, alertsPage, 15, "open")
            : await getAlertHistory(token, selectedDeviceId, alertsPage, 15);
        setAllAlerts(res.data.alerts);
        setAlertsMeta(res.meta);
      } catch (err) {
        handleRequestError(err, "Failed to fetch alerts");
      } finally {
        setIsAlertsLoading(false);
      }
    };

    fetchPage();
  }, [alertsPage, alertTab, selectedDeviceId, token, handleRequestError, isLoadingDetails]);

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      if (!token) {
        return;
      }

      setIsLoadingDevices(true);
      setError("");

      try {
        const fetchedDevices = await getLatestDevices(token, 10);

        if (!isMounted) {
          return;
        }

        setDevices(fetchedDevices);

        if (fetchedDevices.length === 0) {
          setSelectedDeviceId("");
          setCurrentDevice(null);
          setAlerts([]);
          setReadingHistory([]);
          return;
        }

        setSelectedDeviceId((currentId) => {
          if (currentId && fetchedDevices.some((device) => device.deviceId === currentId)) {
            return currentId;
          }

          return fetchedDevices[0].deviceId;
        });
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        handleRequestError(loadError, "Failed to load devices");
      } finally {
        if (isMounted) {
          setIsLoadingDevices(false);
        }
      }
    };

    loadDevices();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!token || !selectedDeviceId) {
        return;
      }

      try {
        await loadSelectedDeviceData(selectedDeviceId);
      } catch {
        if (!isMounted) {
          return;
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [loadSelectedDeviceData, selectedDeviceId, token]);

  const handleReadingUpdate = useCallback(
    (payload) => {
      if (!payload || payload.deviceId !== selectedDeviceId) {
        return;
      }

      const isLiveView =
        readingsPage === 1 &&
        !readingFilters.startDate &&
        !readingFilters.endDate &&
        !readingFilters.vibration &&
        readingFilters.sortOrder === "desc";

      if (isLiveView) {
        setReadingHistory((currentReadings) => {
          if (currentReadings.some((reading) => reading._id === payload._id)) {
            return currentReadings;
          }

          return [payload, ...currentReadings].slice(0, MAX_READINGS);
        });
      }
    },
    [selectedDeviceId, readingsPage, readingFilters],
  );

  const handleDeviceUpdate = useCallback(
    (payload) => {
      if (!payload || payload.deviceId !== selectedDeviceId) {
        return;
      }

      setCurrentDevice((currentDeviceValue) => {
        if (areDevicesEqual(currentDeviceValue, payload)) {
          return currentDeviceValue;
        }

        return payload;
      });

      setDevices((currentDevices) => {
        let hasChanges = false;
        const nextDevices = currentDevices.map((device) => {
          if (device.deviceId !== payload.deviceId) {
            return device;
          }

          const mergedDevice = { ...device, ...payload };

          if (!areDevicesEqual(device, mergedDevice)) {
            hasChanges = true;
          }

          return mergedDevice;
        });

        if (nextDevices.some((device) => device.deviceId === payload.deviceId)) {
          return hasChanges ? nextDevices : currentDevices;
        }

        return [payload, ...currentDevices].slice(0, 10);
      });
    },
    [selectedDeviceId],
  );

  const handleAlertNew = useCallback(
    (payload) => {
      if (!payload || payload.deviceId !== selectedDeviceId) {
        return;
      }

      // Sensory feedback safety checks
      const now = Date.now();
      const COOLDOWN_MS = 2500;

      if (lastVibratedAlertIdRef.current !== payload._id && (now - lastVibrationTimeRef.current > COOLDOWN_MS)) {
        lastVibratedAlertIdRef.current = payload._id;
        lastVibrationTimeRef.current = now;

        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          // Mobile Vibration
          navigator.vibrate([200, 100, 200]);
        } else {
          // Desktop Fallback
          const mainElement = document.querySelector(".dashboard-grid-main");
          if (mainElement) {
            mainElement.classList.add("alert-pulse");
            setTimeout(() => mainElement.classList.remove("alert-pulse"), COOLDOWN_MS);
          }
        }
      }

      // Native Push Notification
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          const bodyMessage = payload.message || `New alert triggered: ${payload.type}`;
          
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification("AlertSense", {
                body: bodyMessage,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
                data: { url: "/?tab=history" }, // Navigate to alerts view natively
                tag: payload._id || "alert-new",
              });
            }).catch(() => {
              // Fallback
              new Notification("AlertSense", {
                body: bodyMessage,
                icon: "/icon-192.png"
              });
            });
          } else {
            // Desktop fallback
            new Notification("AlertSense", {
              body: bodyMessage,
              icon: "/icon-192.png"
            });
          }
        }
      }

      setAlerts((currentAlerts) => {
        if (currentAlerts.some((alert) => alert._id === payload._id)) {
          return currentAlerts;
        }

        // Increment the total open alerts badge natively
        setTotalOpenAlerts(prev => prev + 1);

        return [payload, ...currentAlerts].slice(0, MAX_ALERTS);
      });

      if (alertsPage === 1) {
        setAllAlerts((current) => {
          if (current.some((a) => a._id === payload._id)) {
            return current;
          }

          // Case 1: On History tab - always prepend
          if (alertTab === "history") {
            return [payload, ...current].slice(0, 15);
          }

          // Case 2: On Open Alerts tab - prepend only if status is open (which new alerts are)
          if (alertTab === "open" && payload.status === "open") {
            return [payload, ...current].slice(0, 15);
          }

          return current;
        });
      }
    },
    [selectedDeviceId, alertsPage, alertTab],
  );

  const handleAlertUpdate = useCallback(
    (payload) => {
      if (!payload || payload.deviceId !== selectedDeviceId) {
        return;
      }

      const { types, status, resolvedAt } = payload;

      setTotalOpenAlerts(prev => Math.max(0, prev - types.length));

      // Update both views
      setAlerts((current) => current.filter((a) => !types.includes(a.type)));

      if (alertTab === "open") {
        setAllAlerts((current) => current.filter((a) => !types.includes(a.type)));
      } else {
        // In history, update the status to 'resolved'
        setAllAlerts((current) =>
          current.map((a) =>
            types.includes(a.type) && a.status === "open"
              ? { ...a, status, resolvedAt }
              : a,
          ),
        );
      }
    },
    [selectedDeviceId, alertTab],
  );

  const handleReconnectRecovery = useCallback(
    async (deviceId) => {
      if (!deviceId) {
        return;
      }

      await loadSelectedDeviceData(deviceId, { keepCurrentView: true });
    },
    [loadSelectedDeviceData],
  );

  const onClearAlert = useCallback(
    async (alertId) => {
      try {
        await clearAlertApi(token, alertId);
        
        // Find if this alert was in open state before decreasing metric
        const targetAlert = allAlerts.find(a => a._id === alertId) || alerts.find(a => a._id === alertId);
        if (targetAlert?.status === 'open') {
           setTotalOpenAlerts(prev => Math.max(0, prev - 1));
        }

        setAlerts((current) => current.filter((a) => a._id !== alertId));
        if (alertTab === "open") {
          setAllAlerts((current) => current.filter((a) => a._id !== alertId));
        } else {
          // In history tab, we might want to update the cleared state of the alert
          setAllAlerts((current) =>
            current.map((a) => (a._id === alertId ? { ...a, status: "cleared", clearedAt: new Date() } : a)),
          );
        }
      } catch (err) {
        handleRequestError(err, "Failed to clear alert");
      }
    },
    [token, handleRequestError, alertTab],
  );

  const onClearAllAlerts = useCallback(async () => {
    if (!selectedDeviceId) {
      return;
    }
    try {
      await clearAllAlertsApi(token, selectedDeviceId);
      setAlerts([]);
      setTotalOpenAlerts(0);
      if (alertTab === "open") {
        setAllAlerts([]);
        setAlertsMeta((prev) => ({ ...prev, total: 0, totalPages: 0 }));
      } else {
        setAllAlerts((current) =>
          current.map((a) => (a.status === "open" ? { ...a, status: "cleared", clearedAt: new Date() } : a)),
        );
      }
    } catch (err) {
      handleRequestError(err, "Failed to clear all alerts");
    }
  }, [token, selectedDeviceId, handleRequestError, alertTab]);

  useDashboardSocket({
    enabled: socketEnabled && Boolean(token),
    selectedDeviceId,
    onReadingUpdate: handleReadingUpdate,
    onDeviceUpdate: handleDeviceUpdate,
    onAlertNew: handleAlertNew,
    onAlertUpdate: handleAlertUpdate,
    onReconnectRecovery: handleReconnectRecovery,
  });

  return useMemo(
    () => ({
      devices,
      selectedDeviceId,
      currentDevice,
      alerts, // latest 5
      readingHistory,
      readingsMeta,
      readingsPage,
      setReadingsPage,
      readingFilters,
      setReadingFilters,
      isHistoryLoading,
      alertTab,
      setAlertTab,
      allAlerts, // paginated list
      totalOpenAlerts, // Export real-time unread value
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
    }),
    [
      alerts,
      allAlerts,
      alertsMeta,
      alertsPage,
      isAlertsLoading,
      alertTab,
      currentDevice,
      totalOpenAlerts,
      devices,
      error,
      isLoadingDetails,
      isLoadingDevices,
      readingHistory,
      readingsMeta,
      readingsPage,
      readingFilters,
      isHistoryLoading,
      selectedDeviceId,
      onClearAlert,
      onClearAllAlerts,
    ],
  );
}
