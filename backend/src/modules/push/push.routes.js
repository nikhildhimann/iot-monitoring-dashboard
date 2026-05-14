import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  getStatus,
  getVapidPublicKey,
  subscribe,
  unsubscribe,
} from "./push.controller.js";

const router = express.Router();

router.get("/vapid-public-key", protect, getVapidPublicKey);
router.post("/subscribe", protect, subscribe);
router.delete("/unsubscribe", protect, unsubscribe);
router.get("/status", protect, getStatus);

export default router;
