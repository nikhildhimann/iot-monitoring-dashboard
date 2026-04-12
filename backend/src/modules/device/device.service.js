import ApiError from "../../utils/ApiError.js";
import { DEVICE_STATUS } from "../../constants/deviceStatus.js";
import { validateReadingPayload } from "../reading/reading.validation.js";
import Device from "./device.model.js";

const DEFAULT_DEVICE_LIMIT = 20;
const MAX_DEVICE_LIMIT = 100;

const parseLimit = (value, fallback = DEFAULT_DEVICE_LIMIT) => {
  const parsedLimit = Number.parseInt(value, 10);

  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return fallback;
  }

  return Math.min(parsedLimit, MAX_DEVICE_LIMIT);
};

export const upsertLatestDeviceState = ({ reading, metadata = {} }) => {
  const receivedAt = new Date();
  const fieldsToSet = {
    weight: reading.weight,
    vibration: reading.vibration,
    buzzerOn: reading.buzzerOn,
    ledOn: reading.ledOn,
    wifiSignal: reading.wifiSignal,
    uptime: reading.uptime,
    ipAddress: reading.ipAddress,
    lastReadingAt: reading.timestamp,
    lastSeenAt: receivedAt,
    status: DEVICE_STATUS.ONLINE,
  };

  if (typeof metadata.name === "string") {
    fieldsToSet.name = metadata.name.trim();
  }

  if (typeof metadata.firmwareVersion === "string") {
    fieldsToSet.firmwareVersion = metadata.firmwareVersion.trim();
  }

  return Device.findOneAndUpdate(
    { deviceId: reading.deviceId },
    {
      $set: fieldsToSet,
    },
    {
      returnDocument: "after",
      lean: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );
};

export const upsertDeviceHeartbeat = (payload) => {
  const reading = validateReadingPayload(payload);

  return upsertLatestDeviceState({
    reading,
    metadata: payload,
  });
};

export const getLatestDevices = ({ limit } = {}) => {
  return Device.find().sort({ lastSeenAt: -1 }).limit(parseLimit(limit)).lean();
};

export const getDeviceById = async (deviceId) => {
  const normalizedDeviceId = String(deviceId || "").trim();

  if (!normalizedDeviceId) {
    throw new ApiError(400, "deviceId is required");
  }

  const device = await Device.findOne({ deviceId: normalizedDeviceId }).lean();

  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  return device;
};
