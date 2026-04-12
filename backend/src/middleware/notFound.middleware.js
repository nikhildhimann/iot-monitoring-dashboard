import { sendResponse } from "../utils/response.js";

const notFound = (req, res) => {
  return sendResponse(res, {
    statusCode: 404,
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

export default notFound;
