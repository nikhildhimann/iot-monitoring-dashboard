import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";
import { clearAlert, clearAllAlerts, listAlerts, listRecentAlerts } from "./alert.controller.js";

const router = Router();

router.get("/", protect, listAlerts);
router.get("/history", protect, listAlerts);
router.get("/recent", protect, listRecentAlerts);
router.patch("/clear-all", protect, clearAllAlerts);
router.patch("/:alertId/clear", protect, clearAlert);

export default router;
