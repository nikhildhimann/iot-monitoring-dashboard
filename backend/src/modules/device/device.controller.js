import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { getDeviceById, getLatestDevices } from "./device.service.js";

export const getLatestDeviceStates = asyncHandler(async (req, res) => {
  const devices = await getLatestDevices(req.query);

  return sendResponse(res, {
    message: "Latest device state fetched successfully",
    data: { devices },
  });
});

export const getDeviceDetails = asyncHandler(async (req, res) => {
  const device = await getDeviceById(req.params.deviceId);

  return sendResponse(res, {
    message: "Device fetched successfully",
    data: { device },
  });
});
