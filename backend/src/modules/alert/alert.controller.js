import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { getAlerts, getRecentAlerts, resolveAlert, resolveAlertsByDeviceId } from "./alert.service.js";

export const listAlerts = asyncHandler(async (req, res) => {
  const result = await getAlerts(req.query);

  return sendResponse(res, {
    message: "Alerts fetched successfully",
    data: { alerts: result.alerts },
    meta: result.meta,
  });
});

export const listRecentAlerts = asyncHandler(async (req, res) => {
  const alerts = await getRecentAlerts(req.query);

  return sendResponse(res, {
    message: "Recent alerts fetched successfully",
    data: { alerts },
  });
});

export const clearAlert = asyncHandler(async (req, res) => {
  const alert = await resolveAlert(req.params.alertId);

  return sendResponse(res, {
    message: "Alert cleared successfully",
    data: { alert },
  });
});

export const clearAllAlerts = asyncHandler(async (req, res) => {
  const count = await resolveAlertsByDeviceId(req.query.deviceId);

  return sendResponse(res, {
    message: "All alerts cleared successfully",
    data: { count },
  });
});
