self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Find an open client (window/tab)
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If we found an active client, focus it
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // If the client possesses a navigate method, use it to ensure it goes to the correct URL
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If no active client was found, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
