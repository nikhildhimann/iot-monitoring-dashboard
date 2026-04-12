import validator from "validator";

import ApiError from "../../utils/ApiError.js";

const assertObject = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "Reading payload must be a valid object");
  }
};

const parseNumber = (value, fieldName) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }

  return parsedValue;
};

const parseBoolean = (value, fieldName) => {
  if (typeof value !== "boolean") {
    throw new ApiError(400, `${fieldName} must be a boolean`);
  }

  return value;
};

export const validateReadingPayload = (payload) => {
  assertObject(payload);

  const deviceId = String(payload.deviceId || "").trim();
  const ipAddress = String(payload.ipAddress || "").trim();
  const timestamp = new Date(payload.timestamp);
  const weight = parseNumber(payload.weight, "weight");
  const wifiSignal = parseNumber(payload.wifiSignal, "wifiSignal");
  const uptime = parseNumber(payload.uptime, "uptime");
  const vibration = parseBoolean(payload.vibration, "vibration");
  const buzzerOn = parseBoolean(payload.buzzerOn, "buzzerOn");
  const ledOn = parseBoolean(payload.ledOn, "ledOn");

  if (!deviceId) {
    throw new ApiError(400, "deviceId is required");
  }

  if (!validator.isIP(ipAddress)) {
    throw new ApiError(400, "ipAddress must be a valid IP address");
  }

  if (Number.isNaN(timestamp.getTime())) {
    throw new ApiError(400, "timestamp must be a valid ISO date");
  }

  if (weight < 0) {
    throw new ApiError(400, "weight must be greater than or equal to 0");
  }

  if (wifiSignal < -120 || wifiSignal > 0) {
    throw new ApiError(400, "wifiSignal must be between -120 and 0");
  }

  if (!Number.isInteger(uptime) || uptime < 0) {
    throw new ApiError(400, "uptime must be a non-negative integer");
  }

  return {
    deviceId,
    weight,
    vibration,
    buzzerOn,
    ledOn,
    wifiSignal,
    uptime,
    ipAddress,
    timestamp,
  };
};
