import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";
import { createReading, fetchLatestReading, listReadings } from "./reading.controller.js";

const router = Router();

router.post("/", createReading);
router.get("/", protect, listReadings);
router.get("/latest", protect, fetchLatestReading);

export default router;
