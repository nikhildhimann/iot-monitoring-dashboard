import { env } from "../config/env.js";

export const API_PREFIX = env.API_PREFIX;
export const HEALTH_ROUTE = env.HEALTH_ROUTE;
export const JSON_BODY_LIMIT = env.JSON_BODY_LIMIT;
export const DEVICE_ROOM_PREFIX = env.DEVICE_ROOM_PREFIX;


export const SOCKET_EVENTS = Object.freeze({
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  SUBSCRIBE_DEVICE: "device:subscribe",
  UNSUBSCRIBE_DEVICE: "device:unsubscribe",
  DEVICE_UPDATE: "device:update",
  READING_UPDATE: "reading:update",
  ALERT_NEW: "alert:new",
});
