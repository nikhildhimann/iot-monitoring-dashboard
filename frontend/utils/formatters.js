export function formatBoolean(value) {
  if (typeof value !== "boolean") {
    return "--";
  }

  return value ? "On" : "Off";
}

export function formatWeight(value) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value.toFixed(2)} kg`;
}

export function formatWifiSignal(value) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value} dBm`;
}

export function formatUptime(value) {
  if (typeof value !== "number" || value < 0) {
    return "--";
  }

  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString();
}
