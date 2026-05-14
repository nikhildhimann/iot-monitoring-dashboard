import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  loginUser,
  signupUser,
  updateCurrentUserProfile,
  updateCurrentUserProfileImage,
} from "./auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const user = await signupUser(req.body);

  return sendResponse(res, {
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const authResult = await loginUser(req.body);

  return sendResponse(res, {
    message: "Login successful",
    data: authResult,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user);

  return sendResponse(res, {
    message: "Profile fetched successfully",
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateCurrentUserProfile(req.user, req.body);

  return sendResponse(res, {
    message: "Profile updated successfully",
    data: { user },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await changeCurrentUserPassword(req.user, req.body);

  return sendResponse(res, {
    message: "Password changed successfully",
  });
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  const user = await updateCurrentUserProfileImage(req.user, req.file);

  return sendResponse(res, {
    message: "Profile image updated successfully",
    data: { user },
  });
});
