const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const apiBaseUrlFromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
const socketUrlFromEnv = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();

export const API_BASE_URL = trimTrailingSlash(apiBaseUrlFromEnv || "http://localhost:5000/api");

export const SOCKET_URL = trimTrailingSlash(
  socketUrlFromEnv || API_BASE_URL.replace(/\/api$/, ""),
);
