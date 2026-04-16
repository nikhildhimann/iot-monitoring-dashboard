"use client";

import { useEffect } from "react";

export default function PushNotificationRequest() {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop or web push notifications.");
      return;
    }

    if (Notification.permission === "default") {
      // Request permission after 4 seconds to avoid overwhelming user immediately
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted. Ready for alerts.");
          } else if (permission === "denied") {
            console.log("Notification permission denied. Alerts will safely fallback to in-app visuals.");
          }
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
