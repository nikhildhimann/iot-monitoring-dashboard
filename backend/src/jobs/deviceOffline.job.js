import { emitDeviceSocketEvent } from "../config/socket.js";
import { env } from "../config/env.js";
import { SOCKET_EVENTS } from "../constants/app.constants.js";
import { DEVICE_STATUS } from "../constants/deviceStatus.js";
import { createOfflineAlert } from "../modules/alert/alert.service.js";
import Device from "../modules/device/device.model.js";

let jobInstance = null;

export const checkOfflineDevices = async ({ offlineAfterMs = env.DEVICE_OFFLINE_AFTER_MS } = {}) => {
  const cutoff = new Date(Date.now() - offlineAfterMs);
  const staleDevices = await Device.find({
    status: DEVICE_STATUS.ONLINE,
    lastSeenAt: { $lt: cutoff },
  }).lean();

  if (staleDevices.length === 0) {
    return 0;
  }

  const results = await Promise.all(
    staleDevices.map(async (device) => {
      const updatedDevice = await Device.findOneAndUpdate(
        {
          _id: device._id,
          status: DEVICE_STATUS.ONLINE,
        },
        {
          $set: {
            status: DEVICE_STATUS.OFFLINE,
          },
        },
        {
          returnDocument: "after",
          lean: true,
        },
      );

      if (!updatedDevice) {
        return false;
      }

      emitDeviceSocketEvent(SOCKET_EVENTS.DEVICE_UPDATE, updatedDevice.deviceId, updatedDevice);
      await createOfflineAlert(updatedDevice);
      return true;
    }),
  );

  return results.filter(Boolean).length;
};

export const startDeviceOfflineJob = ({
  intervalMs = env.DEVICE_OFFLINE_CHECK_INTERVAL_MS,
  offlineAfterMs = env.DEVICE_OFFLINE_AFTER_MS,
} = {}) => {
  if (jobInstance) {
    return jobInstance;
  }

  jobInstance = setInterval(() => {
    checkOfflineDevices({ offlineAfterMs }).catch((error) => {
      console.error("Device offline job failed:", error.message);
    });
  }, intervalMs);

  jobInstance.unref?.();

  return jobInstance;
};

export const stopDeviceOfflineJob = () => {
  if (!jobInstance) {
    return;
  }

  clearInterval(jobInstance);
  jobInstance = null;
};
