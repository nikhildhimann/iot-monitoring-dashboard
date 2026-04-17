import dotenv from "dotenv";

dotenv.config();

const requiredEnvKeys = ["MONGO_URI", "JWT_SECRET"];

requiredEnvKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment Variable Error: ${key} is required but not defined in .env`);
  }
});


const parsePort = (value) => {
  const parsedPort = Number.parseInt(value, 10);
  if (Number.isNaN(parsedPort)) {
    throw new Error(`Environment Variable Error: PORT must be a valid number, received "${value}"`);
  }
  return parsedPort;
};

const parseNumber = (key, value) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Environment Variable Error: ${key} must be a valid number, received "${value}"`);
  }
  return parsedValue;
};

const parseOrigins = (value) => {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const nodeEnv = process.env.NODE_ENV;

export const env = Object.freeze({
  PORT: parsePort(process.env.PORT || "5000"),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URLS: parseOrigins(
    process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000",
  ),
  WEIGHT_MIN_THRESHOLD: parseNumber("WEIGHT_MIN_THRESHOLD", process.env.WEIGHT_MIN_THRESHOLD || "0"),
  WEIGHT_MAX_THRESHOLD: parseNumber(
    "WEIGHT_MAX_THRESHOLD",
    process.env.WEIGHT_MAX_THRESHOLD || "1000",
  ),
  WIFI_SIGNAL_WEAK_THRESHOLD: parseNumber(
    "WIFI_SIGNAL_WEAK_THRESHOLD",
    process.env.WIFI_SIGNAL_WEAK_THRESHOLD || "-70",
  ),
  DEVICE_OFFLINE_AFTER_MS: parseNumber(
    "DEVICE_OFFLINE_AFTER_MS",
    process.env.DEVICE_OFFLINE_AFTER_MS || "60000",
  ),
  DEVICE_OFFLINE_CHECK_INTERVAL_MS: parseNumber(
    "DEVICE_OFFLINE_CHECK_INTERVAL_MS",
    process.env.DEVICE_OFFLINE_CHECK_INTERVAL_MS || "30000",
  ),
  NODE_ENV: nodeEnv || "development",
  IS_PRODUCTION: nodeEnv === "production",
  API_PREFIX: process.env.API_PREFIX || "/api",
  HEALTH_ROUTE: process.env.HEALTH_ROUTE || "/health",
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || "1mb",
  DEFAULT_HISTORY_LIMIT: parseNumber(
    "DEFAULT_HISTORY_LIMIT",
    process.env.DEFAULT_HISTORY_LIMIT || "15",
  ),
  MAX_HISTORY_LIMIT: parseNumber("MAX_HISTORY_LIMIT", process.env.MAX_HISTORY_LIMIT || "100"),
  DEVICE_ROOM_PREFIX: process.env.DEVICE_ROOM_PREFIX || "device:",
});


