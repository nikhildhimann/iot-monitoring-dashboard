export const API_PREFIX = "/api";
export const HEALTH_ROUTE = "/health";
export const JSON_BODY_LIMIT = "256kb";
export const DEVICE_ROOM_PREFIX = "device:";

export const SOCKET_EVENTS = Object.freeze({
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  SUBSCRIBE_DEVICE: "device:subscribe",
  UNSUBSCRIBE_DEVICE: "device:unsubscribe",
  DEVICE_UPDATE: "device:update",
  READING_UPDATE: "reading:update",
  ALERT_NEW: "alert:new",
});
