import validator from "validator";

import ApiError from "../../utils/ApiError.js";

const assertObject = (payload, label) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, `${label} payload must be a valid object`);
  }
};

export const normalizePhone = (value, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new ApiError(400, "Phone number is required");
    }

    return "";
  }

  const phone = String(value).trim();

  if (!/^\+?[0-9\s-]+$/.test(phone)) {
    throw new ApiError(400, "Invalid phone number");
  }

  const hasPlusPrefix = phone.startsWith("+");
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    throw new ApiError(400, "Phone number must contain 7 to 15 digits");
  }

  return `${hasPlusPrefix ? "+" : ""}${digits}`;
};

export const validateRegisterPayload = (payload) => {
  assertObject(payload, "Register");

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const phone = normalizePhone(payload.phone);

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
    phone,
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

export const validateProfileUpdatePayload = (payload) => {
  assertObject(payload, "Profile update");

  const updates = {};

  if (Object.hasOwn(payload, "name")) {
    const name = String(payload.name || "").trim();

    if (name.length < 2 || name.length > 80) {
      throw new ApiError(400, "Name must be between 2 and 80 characters");
    }

    updates.name = name;
  }

  if (Object.hasOwn(payload, "phone")) {
    updates.phone = normalizePhone(payload.phone);
  }

  return updates;
};

export const validateChangePasswordPayload = (payload) => {
  assertObject(payload, "Change password");

  const currentPassword = String(payload.currentPassword || "");
  const newPassword = String(payload.newPassword || "");

  if (!currentPassword) {
    throw new ApiError(400, "Current password is required");
  }

  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  return {
    currentPassword,
    newPassword,
  };
};
