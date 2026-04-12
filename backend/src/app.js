import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "./config/env.js";
import { API_PREFIX, HEALTH_ROUTE, JSON_BODY_LIMIT } from "./constants/app.constants.js";
import alertRoutes from "./modules/alert/alert.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import deviceRoutes from "./modules/device/device.routes.js";
import readingRoutes from "./modules/reading/reading.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";
import { sendResponse } from "./utils/response.js";

const app = express();
const allowedOrigins = new Set(env.CLIENT_URLS);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const error = new Error("Origin not allowed by CORS");
    error.statusCode = 403;

    return callback(error);
  },
  credentials: true,
};

const apiRouter = express.Router();

app.disable("x-powered-by");

if (env.IS_PRODUCTION) {
  app.set("trust proxy", 1);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(env.IS_PRODUCTION ? "combined" : "dev"));

app.get(HEALTH_ROUTE, (req, res) => {
  return sendResponse(res, {
    message: "Server is healthy",
    data: {
      status: "ok",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    },
  });
});

apiRouter.get("/", (req, res) => {
  return sendResponse(res, {
    message: "Amrik IoT backend is running",
    data: {
      version: "v1",
      basePath: API_PREFIX,
    },
  });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/device", deviceRoutes);
apiRouter.use("/readings", readingRoutes);
apiRouter.use("/alerts", alertRoutes);

app.use(API_PREFIX, apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
