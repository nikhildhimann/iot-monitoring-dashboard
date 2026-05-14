import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";
import { uploadProfileImage } from "./auth.upload.js";
import {
  changePassword,
  login,
  me,
  signup,
  updateProfile,
  updateProfileImage,
} from "./auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.patch("/profile-image", protect, uploadProfileImage, updateProfileImage);

export default router;
