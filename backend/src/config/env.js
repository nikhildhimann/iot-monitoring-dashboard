import dotenv from "dotenv";

dotenv.config();

const requiredEnvKeys = ["MONGO_URI", "JWT_SECRET"];

requiredEnvKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const parsePort = (value, fallback) => {
  const parsedPort = Number.parseInt(value, 10);

  if (Number.isNaN(parsedPort)) {
    return fallback;
  }

  return parsedPort;
};

const parseNumber = (value, fallback) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return parsedValue;
};

const parseOrigins = (value) => {
  if (!value) {
    return ["http://localhost:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const nodeEnv = process.env.NODE_ENV || "development";

export const env = Object.freeze({
  PORT: parsePort(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URLS: parseOrigins(process.env.CLIENT_URLS || process.env.CLIENT_URL),
  WEIGHT_MIN_THRESHOLD: parseNumber(process.env.WEIGHT_MIN_THRESHOLD, 1),
  WEIGHT_MAX_THRESHOLD: parseNumber(process.env.WEIGHT_MAX_THRESHOLD, 50),
  WIFI_SIGNAL_WEAK_THRESHOLD: parseNumber(process.env.WIFI_SIGNAL_WEAK_THRESHOLD, -70),
  DEVICE_OFFLINE_AFTER_MS: parseNumber(process.env.DEVICE_OFFLINE_AFTER_MS, 2 * 60 * 1000),
  DEVICE_OFFLINE_CHECK_INTERVAL_MS: parseNumber(
    process.env.DEVICE_OFFLINE_CHECK_INTERVAL_MS,
    60 * 1000,
  ),
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: nodeEnv === "production",
});
