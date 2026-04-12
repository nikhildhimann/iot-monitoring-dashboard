import { emitDeviceSocketEvent } from "../../config/socket.js";
import { env } from "../../config/env.js";
import { SOCKET_EVENTS } from "../../constants/app.constants.js";
import { ALERT_TYPES } from "../../constants/alertTypes.js";
import { validateCreateAlertPayload } from "./alert.validation.js";
import Alert from "./alert.model.js";

const DEFAULT_ALERT_LIMIT = 15;
const MAX_ALERT_LIMIT = 100;
const AUTO_READING_ALERT_TYPES = [
  ALERT_TYPES.OVERWEIGHT,
  ALERT_TYPES.UNDERWEIGHT,
  ALERT_TYPES.WEAK_SIGNAL,
];

const parseLimit = (value, fallback = DEFAULT_ALERT_LIMIT) => {
  const parsedLimit = Number.parseInt(value, 10);

  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return fallback;
  }

  return Math.min(parsedLimit, MAX_ALERT_LIMIT);
};

const parsePage = (value) => {
  const parsedPage = Number.parseInt(value, 10);

  if (Number.isNaN(parsedPage) || parsedPage <= 0) {
    return 1;
  }

  return parsedPage;
};

const buildAlertPayload = (reading) => {
  const alerts = [];

  if (reading.vibration) {
    alerts.push({
      deviceId: reading.deviceId,
      type: ALERT_TYPES.VIBRATION_DETECTED,
      severity: "medium",
      message: `Vibration detected on ${reading.deviceId}`,
      value: 1,
      threshold: 1,
      triggeredAt: reading.timestamp,
    });
  }

  if (reading.weight > env.WEIGHT_MAX_THRESHOLD) {
    alerts.push({
      deviceId: reading.deviceId,
      type: ALERT_TYPES.OVERWEIGHT,
      severity: "high",
      message: `Weight above threshold on ${reading.deviceId}`,
      value: reading.weight,
      threshold: env.WEIGHT_MAX_THRESHOLD,
      triggeredAt: reading.timestamp,
    });
  } else if (reading.weight < env.WEIGHT_MIN_THRESHOLD) {
    alerts.push({
      deviceId: reading.deviceId,
      type: ALERT_TYPES.UNDERWEIGHT,
      severity: "medium",
      message: `Weight below threshold on ${reading.deviceId}`,
      value: reading.weight,
      threshold: env.WEIGHT_MIN_THRESHOLD,
      triggeredAt: reading.timestamp,
    });
  }

  if (reading.wifiSignal <= env.WIFI_SIGNAL_WEAK_THRESHOLD) {
    alerts.push({
      deviceId: reading.deviceId,
      type: ALERT_TYPES.WEAK_SIGNAL,
      severity: "low",
      message: `Weak WiFi signal detected on ${reading.deviceId}`,
      value: reading.wifiSignal,
      threshold: env.WIFI_SIGNAL_WEAK_THRESHOLD,
      triggeredAt: reading.timestamp,
    });
  }

  return alerts;
};

const sanitizeAlert = (alert) => {
  if (!alert) {
    return alert;
  }

  return typeof alert.toObject === "function" ? alert.toObject() : alert;
};

const emitAlertEvent = (alert) => {
  if (!alert) {
    return;
  }

  emitDeviceSocketEvent(SOCKET_EVENTS.ALERT_NEW, alert.deviceId, alert);
};

const emitAlertResolution = (deviceId, types) => {
  if (!deviceId || !types || types.length === 0) {
    return;
  }

  // Frontend can use this to remove from "Open Alerts" and update "History"
  emitDeviceSocketEvent(SOCKET_EVENTS.ALERT_UPDATE, deviceId, {
    deviceId,
    types,
    status: "resolved",
    resolvedAt: new Date(),
  });
};

export const createAlert = async (payload, { emit = true } = {}) => {
  const alertPayload = validateCreateAlertPayload(payload);
  const alert = await Alert.create(alertPayload);
  const normalizedAlert = sanitizeAlert(alert);

  if (emit) {
    emitAlertEvent(normalizedAlert);
  }

  return normalizedAlert;
};

export const createAlertIfNotOpen = async (payload, options) => {
  const alertPayload = validateCreateAlertPayload(payload);
  const existingAlert = await Alert.findOne({
    deviceId: alertPayload.deviceId,
    type: alertPayload.type,
    status: "open",
  }).lean();

  if (existingAlert) {
    return {
      alert: existingAlert,
      isNew: false,
    };
  }

  try {
    const alert = await createAlert(alertPayload, options);

    return {
      alert,
      isNew: true,
    };
  } catch (error) {
    if (error.code === 11000) {
      const alert = await Alert.findOne({
        deviceId: alertPayload.deviceId,
        type: alertPayload.type,
        status: "open",
      }).lean();

      return {
        alert,
        isNew: false,
      };
    }

    throw error;
  }
};

export const resolveAlertsByTypes = async (deviceId, types) => {
  if (!deviceId || !Array.isArray(types) || types.length === 0) {
    return 0;
  }

  const result = await Alert.updateMany(
    {
      deviceId,
      tag: { $ne: "manual" }, // Only auto-resolve system-managed alerts if needed, but here we use types
      type: { $in: types },
      status: "open",
    },
    {
      $set: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    },
  );

  if (result.modifiedCount > 0) {
    emitAlertResolution(deviceId, types);
  }

  return result.modifiedCount;
};

export const processAlertsForReading = async (reading, options) => {
  const alertsToCreate = buildAlertPayload(reading);
  const triggeredTypes = alertsToCreate.map((alert) => alert.type);
  
  // State-based types that SHOULD resolve if not triggered in this reading
  const typesToResolve = AUTO_READING_ALERT_TYPES.filter((type) => !triggeredTypes.includes(type));

  const createdAlerts = await Promise.all(
    alertsToCreate.map((alert) => createAlertIfNotOpen(alert, options)),
  );
  
  if (typesToResolve.length > 0) {
    await resolveAlertsByTypes(reading.deviceId, typesToResolve);
  }

  return createdAlerts.filter((item) => item.isNew).map((item) => item.alert);
};

export const createOfflineAlert = async (device, options) => {
  const result = await createAlertIfNotOpen({
    deviceId: device.deviceId,
    type: ALERT_TYPES.DEVICE_OFFLINE,
    severity: "high",
    message: `Device ${device.deviceId} is offline`,
    triggeredAt: new Date(),
  }, options);

  return result.alert;
};

export const resolveOfflineAlert = (deviceId) => {
  return resolveAlertsByTypes(deviceId, [ALERT_TYPES.DEVICE_OFFLINE]);
};

export const getAlerts = async ({ deviceId, type, status, page, limit } = {}) => {
  const filter = {};
  const currentPage = parsePage(page);
  const pageSize = parseLimit(limit);

  if (deviceId) {
    filter.deviceId = String(deviceId).trim();
  }

  if (type) {
    filter.type = String(type).trim();
  }

  if (status) {
    filter.status = String(status).trim();
  }

  const skip = (currentPage - 1) * pageSize;

  const [alerts, total] = await Promise.all([
    Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
};

export const getRecentAlerts = ({ deviceId, limit } = {}) => {
  const filter = {};

  if (deviceId) {
    filter.deviceId = String(deviceId).trim();
  }

  return Alert.find(filter).sort({ createdAt: -1 }).limit(parseLimit(limit, 10)).lean();
};

export const resolveAlert = (alertId) => {
  return Alert.findByIdAndUpdate(
    alertId,
    {
      $set: {
        status: "cleared",
        clearedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      lean: true,
    },
  );
};

export const resolveAlertsByDeviceId = async (deviceId) => {
  if (!deviceId) {
    return 0;
  }

  const result = await Alert.updateMany(
    {
      deviceId,
      status: "open",
    },
    {
      $set: {
        status: "cleared",
        clearedAt: new Date(),
      },
    },
  );

  return result.modifiedCount;
};

export const emitAlerts = (alerts) => {
  alerts.forEach((alert) => {
    emitAlertEvent(alert);
  });
};
