import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { loginUser, signupUser } from "./auth.service.js";

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
