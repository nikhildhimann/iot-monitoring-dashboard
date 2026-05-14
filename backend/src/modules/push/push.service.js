import webpush from "web-push";
import { env } from "../../config/env.js";
import PushSubscription from "./push.model.js";
import PushAlertCooldown from "./cooldown.model.js";
import User from "../auth/auth.model.js";

// Initialize web-push with VAPID keys
const initWebPush = () => {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
    return true;
  }
  console.warn("[push] VAPID keys are missing. Push notifications will be skipped.");
  return false;
};

const isVapidReady = initWebPush();

/**
 * Send push notification to a specific subscription
 */
const sendPush = async (subscription, payload) => {
  if (!isVapidReady) return;

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    
    // Update lastUsedAt
    await PushSubscription.updateOne(
      { _id: subscription._id },
      { $set: { lastUsedAt: new Date() } }
    );
  } catch (error) {
    // If subscription is no longer valid (404 or 410), mark it inactive
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.info(`[push] Subscription expired for endpoint: ${subscription.endpoint}`);
      await PushSubscription.updateOne(
        { _id: subscription._id },
        { $set: { isActive: false } }
      );
    } else {
      console.error("[push] Error sending notification:", error.message);
    }
  }
};

/**
 * Send push notification to multiple users
 */
export const sendPushToUsers = async (userIds, payload) => {
  if (!isVapidReady) return;

  try {
    const subscriptions = await PushSubscription.find({
      user: { $in: userIds },
      isActive: true,
    });

    if (subscriptions.length === 0) return;

    await Promise.all(subscriptions.map((sub) => sendPush(sub, payload)));
  } catch (error) {
    console.error("[push] Error in sendPushToUsers:", error.message);
  }
};

/**
 * Send push notification to a single user
 */
export const sendPushToUser = (userId, payload) => {
  return sendPushToUsers([userId], payload);
};

/**
 * Get recipients for alert notifications
 * Rule: Send to all active admins. If no admins, send to all active users.
 */
export const getAlertRecipients = async () => {
  try {
    // Try to find active admins first
    const admins = await User.find({ role: "admin", isActive: true }, "_id").lean();
    
    if (admins.length > 0) {
      return admins.map(u => u._id);
    }

    // Fallback to all active users if no admins exist
    const users = await User.find({ isActive: true }, "_id").lean();
    return users.map(u => u._id);
  } catch (error) {
    console.error("[push] Error getting alert recipients:", error.message);
    return [];
  }
};

/**
 * Check if alert is in cooldown and update if not
 */
export const checkAndUpdateCooldown = async (deviceId, alertType) => {
  const cooldownSeconds = env.PUSH_ALERT_COOLDOWN_SECONDS;
  const now = new Date();
  const cooldownMs = cooldownSeconds * 1000;

  try {
    const record = await PushAlertCooldown.findOne({ deviceId, alertType });

    if (record) {
      const timeSinceLastSent = now - record.lastSentAt;
      if (timeSinceLastSent < cooldownMs) {
        return false; // Still in cooldown
      }
      
      // Update lastSentAt
      record.lastSentAt = now;
      await record.save();
      return true;
    }

    // Create new cooldown record
    await PushAlertCooldown.create({
      deviceId,
      alertType,
      lastSentAt: now,
    });
    return true;
  } catch (error) {
    console.error("[push] Cooldown check error:", error.message);
    return true; // Default to allow sending if DB fails, to avoid missing alerts
  }
};

/**
 * Trigger an alert push notification with cooldown protection
 */
export const triggerAlertPush = async ({ deviceId, alertType, title, body, data }) => {
  // Fire and forget
  (async () => {
    try {
      const canSend = await checkAndUpdateCooldown(deviceId, alertType);
      if (!canSend) return;

      const userIds = await getAlertRecipients();
      if (userIds.length === 0) return;

      const payload = {
        title,
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        url: "/dashboard",
        tag: `device-alert-${deviceId}-${alertType}`,
        data: {
          deviceId,
          alertType,
          url: "/dashboard",
          ...data,
        },
      };

      await sendPushToUsers(userIds, payload);
      console.info(`[push] Alert sent: ${alertType} for device ${deviceId}`);
    } catch (error) {
      console.error("[push] Trigger alert push error:", error.message);
    }
  })().catch(err => console.error("[push] Unhandled trigger error:", err));
};
