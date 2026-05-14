"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPushStatus,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from "@/lib/api/push";
import { registerServiceWorker, urlBase64ToUint8Array } from "@/utils/push";

export function usePushNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check support and permission on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isSupported = "serviceWorker" in navigator && "PushManager" in window;
    const isSecure = window.isSecureContext;
    
    setSupported(isSupported && isSecure);

    if (isSupported && isSecure) {
      setPermission(Notification.permission);
    }
  }, []);

  // Fetch subscription status from backend
  const refreshStatus = useCallback(async () => {
    if (!isAuthenticated || !token || !supported) return;

    try {
      const status = await getPushStatus(token);
      setIsSubscribed(status);
    } catch (err) {
      console.error("Error fetching push status:", err);
    }
  }, [isAuthenticated, token, supported]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const enablePush = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Register service worker
      const registration = await registerServiceWorker();

      // 2. Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        // Use a specific message for dismissal vs block
        const msg = result === "denied" 
          ? "Notifications are blocked. Please click the 'Lock' icon in your browser address bar to reset permission and try again."
          : "Notification permission was not granted. Please click 'Allow' when prompted.";
        
        const err = new Error(msg);
        err.name = "PermissionError";
        err.isDismissed = result === "default";
        throw err;
      }

      // 3. Get VAPID key
      const vapidPublicKey = await getVapidPublicKey(token);
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Subscribe with PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // 5. Send to backend
      await subscribePush(subscription, token);

      setIsSubscribed(true);
      setSuccess("Mobile alerts enabled successfully.");
    } catch (err) {
      // Only log to console if it's not a simple permission dismissal
      if (err.name !== "PermissionError" || !err.isDismissed) {
        console.error("Failed to enable push:", err);
      }
      setError(err.message || "Failed to enable mobile alerts.");
    } finally {
      setLoading(false);
    }
  };

  const disablePush = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 1. Unsubscribe from backend
        await unsubscribePush(subscription.endpoint, token);
        // 2. Unsubscribe from browser
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setSuccess("Mobile alerts disabled.");
    } catch (err) {
      console.error("Failed to disable push:", err);
      setError(err.message || "Failed to disable mobile alerts.");
    } finally {
      setLoading(false);
    }
  };

  return {
    supported,
    permission,
    isSubscribed,
    loading,
    error,
    success,
    enablePush,
    disablePush,
    refreshStatus,
  };
}
