import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { env } from "../../config/env.js";
import PushSubscription from "./push.model.js";
import ApiError from "../../utils/ApiError.js";

export const getVapidPublicKey = asyncHandler(async (req, res) => {
  if (!env.VAPID_PUBLIC_KEY) {
    throw new ApiError(500, "VAPID public key not configured on server");
  }

  return sendResponse(res, {
    success: true,
    data: {
      publicKey: env.VAPID_PUBLIC_KEY,
    },
  });
});

export const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;
  const user = req.user._id;
  const userAgent = req.headers["user-agent"];

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new ApiError(400, "Invalid subscription object");
  }

  // Update if exists, otherwise create
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      user,
      keys,
      userAgent,
      isActive: true,
      lastUsedAt: null, // Reset last used
    },
    { upsert: true, new: true }
  );

  return sendResponse(res, {
    success: true,
    message: "Subscribed to push notifications successfully",
  });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    throw new ApiError(400, "Endpoint is required to unsubscribe");
  }

  // Mark as inactive instead of deleting
  await PushSubscription.updateOne(
    { endpoint },
    { $set: { isActive: false } }
  );

  return sendResponse(res, {
    success: true,
    message: "Unsubscribed from push notifications successfully",
  });
});

export const getStatus = asyncHandler(async (req, res) => {
  const user = req.user._id;

  const subscription = await PushSubscription.findOne({
    user,
    isActive: true,
  });

  return sendResponse(res, {
    success: true,
    data: {
      isSubscribed: !!subscription,
    },
  });
});
