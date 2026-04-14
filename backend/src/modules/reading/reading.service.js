import { env } from "../../config/env.js";
import { emitDeviceSocketEvent } from "../../config/socket.js";
import { SOCKET_EVENTS } from "../../constants/app.constants.js";
import ApiError from "../../utils/ApiError.js";
import { upsertLatestDeviceState } from "../device/device.service.js";
import {
  emitAlerts,
  processAlertsForReading,
  resolveOfflineAlert,
} from "../alert/alert.service.js";
import { validateReadingPayload } from "./reading.validation.js";
import Reading from "./reading.model.js";

const DEFAULT_HISTORY_LIMIT = env.DEFAULT_HISTORY_LIMIT;
const MAX_HISTORY_LIMIT = env.MAX_HISTORY_LIMIT;


const toPlainObject = (document) => {
  return typeof document?.toObject === "function" ? document.toObject() : document;
};

const parsePositiveInt = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

export const createReadingRecord = (reading) => {
  return Reading.create({
    deviceId: reading.deviceId,
    weight: reading.weight,
    vibration: reading.vibration,
    buzzerOn: reading.buzzerOn,
    ledOn: reading.ledOn,
    wifiSignal: reading.wifiSignal,
    uptime: reading.uptime,
    ipAddress: reading.ipAddress,
    timestamp: reading.timestamp,
  });
};

export const createReading = (payload) => {
  const reading = validateReadingPayload(payload);

  return createReadingRecord(reading);
};

export const ingestReadingPayload = async (payload) => {
  const reading = validateReadingPayload(payload);

  const [savedReading, device] = await Promise.all([
    createReadingRecord(reading),
    upsertLatestDeviceState({
      reading,
      metadata: payload,
    }),
  ]);

  const readingPayload = toPlainObject(savedReading);
  const [alerts] = await Promise.all([
    processAlertsForReading(reading, { emit: false }),
    resolveOfflineAlert(reading.deviceId),
  ]);

  emitDeviceSocketEvent(SOCKET_EVENTS.READING_UPDATE, reading.deviceId, readingPayload);
  emitDeviceSocketEvent(SOCKET_EVENTS.DEVICE_UPDATE, reading.deviceId, device);
  emitAlerts(alerts);

  return {
    reading: readingPayload,
    device,
    alerts,
  };
};

export const getReadingHistory = async ({
  deviceId,
  page,
  limit,
  vibration,
  startDate,
  endDate,
  sortBy = "timestamp",
  sortOrder = "desc",
} = {}) => {
  const normalizedDeviceId = String(deviceId || "").trim();
  const currentPage = parsePositiveInt(page, 1);
  const pageSize = Math.min(parsePositiveInt(limit, DEFAULT_HISTORY_LIMIT), MAX_HISTORY_LIMIT);
  const skip = (currentPage - 1) * pageSize;

  const filter = {};

  if (normalizedDeviceId) {
    filter.deviceId = normalizedDeviceId;
  }

  if (vibration === "true" || vibration === true) {
    filter.vibration = true;
  } else if (vibration === "false" || vibration === false) {
    filter.vibration = false;
  }

  if (startDate || endDate) {
    filter.timestamp = {};

    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }
  }

  const sort = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [readings, total] = await Promise.all([
    Reading.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
    Reading.countDocuments(filter),
  ]);

  return {
    readings,
    meta: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    },
  };
};

export const getLatestReading = async ({ deviceId } = {}) => {
  const normalizedDeviceId = String(deviceId || "").trim();
  const filter = normalizedDeviceId ? { deviceId: normalizedDeviceId } : {};
  const reading = await Reading.findOne(filter).sort({ timestamp: -1 }).lean();

  if (!reading) {
    throw new ApiError(404, "No readings found");
  }

  return reading;
};
