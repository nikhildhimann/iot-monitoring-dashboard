import mongoose from "mongoose";

import { env } from "./env.js";

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  const connection = await mongoose.connect(env.MONGO_URI, {
    autoIndex: !env.IS_PRODUCTION,
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
};
