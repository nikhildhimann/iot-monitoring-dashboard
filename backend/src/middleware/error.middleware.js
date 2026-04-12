import { env } from "../config/env.js";
import { sendResponse } from "../utils/response.js";

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || res.statusCode;
  let message = error.message || "Internal server error";
  let details = error.details;

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(error.keyPattern).join(", ")} already exists`;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  return sendResponse(res, {
    statusCode,
    success: false,
    message,
    data: env.IS_PRODUCTION && statusCode === 500 ? undefined : { stack: error.stack },
    meta: details ? { details } : undefined,
  });
};

export default errorHandler;
