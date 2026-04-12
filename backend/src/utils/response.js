export const sendResponse = (
  res,
  { statusCode = 200, success = true, message = "Success", data, meta } = {},
) => {
  const payload = {
    success,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};
