import validator from "validator";

import ApiError from "../../utils/ApiError.js";

const assertObject = (payload, label) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, `${label} payload must be a valid object`);
  }
};

export const validateRegisterPayload = (payload) => {
  assertObject(payload, "Register");

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (name.length < 2 || name.length > 80) {
    throw new ApiError(400, "Name must be between 2 and 80 characters");
  }

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  return {
    name,
    email,
    password,
  };
};

export const validateLoginPayload = (payload) => {
  assertObject(payload, "Login");

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  return {
    email,
    password,
  };
};
