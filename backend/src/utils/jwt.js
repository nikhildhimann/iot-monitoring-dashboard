import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    ...options,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
