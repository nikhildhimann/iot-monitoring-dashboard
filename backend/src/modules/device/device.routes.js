import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";
import { getDeviceDetails, getLatestDeviceStates } from "./device.controller.js";

const router = Router();

router.get("/latest", protect, getLatestDeviceStates);
router.get("/:deviceId", protect, getDeviceDetails);

export default router;
