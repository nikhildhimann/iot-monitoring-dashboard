import ApiError from "../../utils/ApiError.js";
import { ALERT_TYPES } from "../../constants/alertTypes.js";

const ALERT_SEVERITIES = ["low", "medium", "high", "critical"];

const assertObject = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Alert payload must be a valid object");
  }
};

export const validateCreateAlertPayload = (payload) => {
  assertObject(payload);

  const deviceId = String(payload.deviceId || "").trim();
  const type = String(payload.type || "").trim();
  const severity = String(payload.severity || "medium").trim();
  const message = String(payload.message || "").trim();
  const triggeredAt = payload.triggeredAt ? new Date(payload.triggeredAt) : new Date();
  const value =
    payload.value === undefined || payload.value === null ? null : Number(payload.value);
  const threshold =
    payload.threshold === undefined || payload.threshold === null
      ? null
      : Number(payload.threshold);

  if (!deviceId) {
    throw new ApiError(400, "deviceId is required");
  }

  if (!Object.values(ALERT_TYPES).includes(type)) {
    throw new ApiError(400, "Alert type is invalid");
  }

  if (!ALERT_SEVERITIES.includes(severity)) {
    throw new ApiError(400, "Alert severity is invalid");
  }

  if (!message) {
    throw new ApiError(400, "Alert message is required");
  }

  if (Number.isNaN(triggeredAt.getTime())) {
    throw new ApiError(400, "triggeredAt must be a valid date");
  }

  if (value !== null && !Number.isFinite(value)) {
    throw new ApiError(400, "Alert value must be a valid number");
  }

  if (threshold !== null && !Number.isFinite(threshold)) {
    throw new ApiError(400, "Alert threshold must be a valid number");
  }

  return {
    deviceId,
    type,
    severity,
    message,
    value,
    threshold,
    triggeredAt,
  };
};
