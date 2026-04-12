import http from "http";

import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";
import { startDeviceOfflineJob, stopDeviceOfflineJob } from "./jobs/deviceOffline.job.js";

let httpServer;

const shutdown = async (signal, exitCode = 0) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  stopDeviceOfflineJob();

  if (httpServer) {
    await new Promise((resolve) => {
      httpServer.close(resolve);
    });
  }

  await disconnectDB();
  process.exit(exitCode);
};

const startServer = async () => {
  try {
    await connectDB();

    httpServer = http.createServer(app);
    initSocket(httpServer);
    startDeviceOfflineJob();

    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException", 1);
});

startServer();
