import bcrypt from "bcryptjs";

import ApiError from "../../utils/ApiError.js";
import User from "./auth.model.js";
import { signToken } from "../../utils/jwt.js";
import { validateLoginPayload, validateRegisterPayload } from "./auth.validation.js";

export const hashPassword = (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const findUserByEmail = (email) => {
  return User.findOne({ email: email.toLowerCase() }).select("+password");
};

export const prepareRegisterData = (payload) => {
  return validateRegisterPayload(payload);
};

export const prepareLoginData = (payload) => {
  return validateLoginPayload(payload);
};

const sanitizeUser = (user) => {
  const plainUser = typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete plainUser.password;

  return {
    id: plainUser._id?.toString() || plainUser.id,
    name: plainUser.name,
    email: plainUser.email,
    role: plainUser.role,
    isActive: plainUser.isActive,
    lastLoginAt: plainUser.lastLoginAt,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
};

export const signupUser = async (payload) => {
  const userData = prepareRegisterData(payload);
  const existingUser = await User.exists({ email: userData.email });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const password = await hashPassword(userData.password);
  const user = await User.create({
    ...userData,
    password,
  });

  return sanitizeUser(user);
};

export const loginUser = async (payload) => {
  const credentials = prepareLoginData(payload);
  const user = await findUserByEmail(credentials.email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(credentials.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    token: issueAuthToken(user),
    user: sanitizeUser(user),
  };
};

export const issueAuthToken = (user) => {
  return signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
};
