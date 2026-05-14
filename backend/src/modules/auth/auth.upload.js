import multer from "multer";

import ApiError from "../../utils/ApiError.js";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Invalid image type"));
      return;
    }

    callback(null, true);
  },
});

export const uploadProfileImage = (req, res, next) => {
  profileImageUpload.single("profileImage")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "Profile image must be 5MB or smaller"));
    }

    return next(error);
  });
};
