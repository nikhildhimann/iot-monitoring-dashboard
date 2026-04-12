import { apiRequest } from "./client";

export async function getLatestDevices(token, limit = 10) {
  const response = await apiRequest(`/device/latest?limit=${limit}`, {
    token,
  });

  return response.data.devices || [];
}

export async function getDeviceById(token, deviceId) {
  const response = await apiRequest(`/device/${deviceId}`, {
    token,
  });

  return response.data.device;
}

export async function getReadingHistory(token, deviceId, { page = 1, limit = 15, vibration, startDate, endDate, sortOrder } = {}) {
  let url = `/readings?deviceId=${encodeURIComponent(deviceId)}&page=${page}&limit=${limit}`;
  
  if (vibration !== undefined && vibration !== "") url += `&vibration=${vibration}`;
  if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
  if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
  if (sortOrder) url += `&sortOrder=${sortOrder}`;

  const response = await apiRequest(url, {
    token,
  });

  return response;
}

export async function getRecentAlerts(token, deviceId, limit = 5) {
  const response = await apiRequest(
    `/alerts/recent?deviceId=${encodeURIComponent(deviceId)}&limit=${limit}`,
    {
      token,
    },
  );

  return response.data.alerts || [];
}

export async function getAlerts(token, deviceId, page = 1, limit = 15, status = "open") {
  const response = await apiRequest(
    `/alerts?deviceId=${encodeURIComponent(deviceId)}&page=${page}&limit=${limit}&status=${status}`,
    {
      token,
    },
  );

  return response;
}

export async function getAlertHistory(token, deviceId, page = 1, limit = 15) {
  const response = await apiRequest(
    `/alerts/history?deviceId=${encodeURIComponent(deviceId)}&page=${page}&limit=${limit}`,
    {
      token,
    },
  );

  return response;
}

export async function clearAlert(token, alertId) {
  const response = await apiRequest(`/alerts/${alertId}/clear`, {
    method: "PATCH",
    token,
  });

  return response.data.alert;
}

export async function clearAllAlerts(token, deviceId) {
  const response = await apiRequest(`/alerts/clear-all?deviceId=${encodeURIComponent(deviceId)}`, {
    method: "PATCH",
    token,
  });

  return response.data.count;
}
