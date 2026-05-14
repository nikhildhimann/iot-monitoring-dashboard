self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, icon, badge, tag, data } = payload;

    const options = {
      body: body || "New alert from AlertSense",
      icon: icon || "/icon-192.png",
      badge: badge || "/icon-192.png",
      tag: tag || "alertsense-push",
      data: data || { url: "/dashboard" },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title || "AlertSense", options));
  } catch (error) {
    console.error("Error parsing push payload:", error);
  }
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
