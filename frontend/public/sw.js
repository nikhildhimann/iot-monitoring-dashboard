self.addEventListener("push", (event) => {
  const fallbackPayload = {
    title: "AlertSense Warning",
    body: "New alert received",
    url: "/dashboard",
    tag: "alertsense-critical-alert",
    data: {},
  };

  let payload = fallbackPayload;

  if (event.data) {
    try {
      const parsedPayload = event.data.json();
      if (parsedPayload && typeof parsedPayload === "object") {
        payload = parsedPayload;
      }
    } catch (error) {
      console.error("Error parsing push payload:", error);
    }
  }

  const tag = payload.tag || fallbackPayload.tag;
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const url = payload.url || data.url || fallbackPayload.url;

  const options = {
    body: payload.body || fallbackPayload.body,
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag,
    renotify: true,
    // Custom notification sound is controlled by OS/browser in PWA.
    // silent:false allows default notification sound.
    silent: false,
    // vibrate pattern improves alert attention where supported.
    vibrate: [300, 100, 300, 100, 500],
    data: {
      url,
      ...data,
    },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title || fallbackPayload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Try to find an existing tab and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && "focus" in client) {
          // Navigate if it's already open but on a different page
          if (client.url !== urlToOpen) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
