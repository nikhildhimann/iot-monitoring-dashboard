import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import {
  getLatestReading,
  getReadingHistory,
  ingestReadingPayload,
} from "./reading.service.js";

export const createReading = asyncHandler(async (req, res) => {
  const result = await ingestReadingPayload(req.body);

  return sendResponse(res, {
    statusCode: 201,
    message: "Reading ingested successfully",
    data: result,
  });
});

export const listReadings = asyncHandler(async (req, res) => {
  const result = await getReadingHistory(req.query);

  return sendResponse(res, {
    message: "Reading history fetched successfully",
    data: { readings: result.readings },
    meta: result.meta,
  });
});

export const fetchLatestReading = asyncHandler(async (req, res) => {
  const reading = await getLatestReading(req.query);

  return sendResponse(res, {
    message: "Latest reading fetched successfully",
    data: { reading },
  });
});
