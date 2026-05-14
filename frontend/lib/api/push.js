import { apiRequest } from "./client";

/**
 * Get VAPID public key from backend
 */
export async function getVapidPublicKey(token) {
  const response = await apiRequest("/push/vapid-public-key", {
    token,
  });
  return response.data.publicKey;
}

/**
 * Subscribe to push notifications
 */
export async function subscribePush(subscription, token) {
  return apiRequest("/push/subscribe", {
    method: "POST",
    body: subscription,
    token,
  });
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribePush(endpoint, token) {
  return apiRequest("/push/unsubscribe", {
    method: "DELETE",
    body: { endpoint },
    token,
  });
}

/**
 * Get push subscription status
 */
export async function getPushStatus(token) {
  const response = await apiRequest("/push/status", {
    token,
  });
  return response.data.isSubscribed;
}
