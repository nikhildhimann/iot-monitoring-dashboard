import ApiError from "../../utils/ApiError.js";

const DEFAULT_DEVICE_ID = "ESP32_001";

const assertObject = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Reading payload must be a valid object");
  }
};

const isMissing = (value) => value === undefined || value === null || value === "";

const parseOptionalNumber = (value, fieldName, defaultValue) => {
  if (isMissing(value)) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }

  return parsedValue;
};

const parseOptionalBoolean = (value, fieldName, defaultValue = false) => {
  if (isMissing(value)) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  throw new ApiError(400, `${fieldName} must be a boolean or string boolean`);
};

const parseDeviceTimestamp = (value) => {
  if (isMissing(value)) {
    return null;
  }

  const timestamp = new Date(value);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
};

const normalizeDeviceId = (value) => {
  if (isMissing(value)) {
    return DEFAULT_DEVICE_ID;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, "deviceId must be a string");
  }

  return value.trim() || DEFAULT_DEVICE_ID;
};

const normalizeIpAddress = (payloadIpAddress, requestIpAddress) => {
  if (typeof payloadIpAddress === "string" && payloadIpAddress.trim()) {
    return payloadIpAddress.trim();
  }

  if (typeof requestIpAddress === "string" && requestIpAddress.trim()) {
    return requestIpAddress.trim();
  }

  return null;
};

export const normalizeReadingPayload = (payload, { requestIpAddress } = {}) => {
  assertObject(payload);

  const weight = parseOptionalNumber(payload.weight, "weight", 0);
  const wifiSignal = parseOptionalNumber(payload.wifiSignal, "wifiSignal", null);
  const uptime = parseOptionalNumber(payload.uptime, "uptime", 0);

  if (weight < 0) {
    throw new ApiError(400, "weight must be greater than or equal to 0");
  }

  if (wifiSignal !== null && (wifiSignal < -120 || wifiSignal > 0)) {
    throw new ApiError(400, "wifiSignal must be between -120 and 0");
  }

  if (!Number.isInteger(uptime) || uptime < 0) {
    throw new ApiError(400, "uptime must be a non-negative integer");
  }

  return {
    deviceId: normalizeDeviceId(payload.deviceId),
    weight,
    vibration: parseOptionalBoolean(payload.vibration, "vibration", false),
    buzzerOn: parseOptionalBoolean(payload.buzzerOn, "buzzerOn", false),
    ledOn: parseOptionalBoolean(payload.ledOn, "ledOn", false),
    wifiSignal,
    uptime,
    ipAddress: normalizeIpAddress(payload.ipAddress, requestIpAddress),
    timestamp: new Date(),
    deviceTimestamp: parseDeviceTimestamp(payload.timestamp),
  };
};

export const validateReadingPayload = normalizeReadingPayload;
