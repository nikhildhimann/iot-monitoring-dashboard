import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

import { env } from "../../config/env.js";
import ApiError from "../../utils/ApiError.js";
import User from "./auth.model.js";
import { signToken } from "../../utils/jwt.js";
import {
  validateChangePasswordPayload,
  validateLoginPayload,
  validateProfileUpdatePayload,
  validateRegisterPayload,
} from "./auth.validation.js";

export const hashPassword = (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const findUserByEmail = (email) => {
  return User.findOne({ email: email.toLowerCase() }).select("+password");
};

export const prepareRegisterData = (payload) => {
  return validateRegisterPayload(payload);
};

export const prepareLoginData = (payload) => {
  return validateLoginPayload(payload);
};

export const sanitizeUser = (user) => {
  const plainUser = typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete plainUser.password;

  return {
    id: plainUser._id?.toString() || plainUser.id,
    _id: plainUser._id,
    name: plainUser.name,
    email: plainUser.email,
    phone: plainUser.phone || "",
    role: plainUser.role,
    isActive: plainUser.isActive,
    profileImageUrl: plainUser.profileImageUrl || "",
    lastLoginAt: plainUser.lastLoginAt,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
};

const getUserIdFromAuthPayload = (authPayload = {}) => {
  return authPayload.sub || authPayload.id || authPayload._id;
};

const findActiveUserByAuthPayload = async (authPayload, options = {}) => {
  const userId = getUserIdFromAuthPayload(authPayload);

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const query = User.findById(userId);

  if (options.includePassword) {
    query.select("+password");
  }

  const user = await query;

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  return user;
};

export const signupUser = async (payload) => {
  const userData = prepareRegisterData(payload);
  const existingUser = await User.exists({ email: userData.email });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  const password = await hashPassword(userData.password);
  const user = await User.create({
    ...userData,
    password,
  });

  return sanitizeUser(user);
};

export const getCurrentUser = async (authPayload) => {
  const user = await findActiveUserByAuthPayload(authPayload);

  return sanitizeUser(user);
};

export const updateCurrentUserProfile = async (authPayload, payload) => {
  const updates = validateProfileUpdatePayload(payload);
  const user = await findActiveUserByAuthPayload(authPayload);

  if (Object.hasOwn(updates, "name")) {
    user.name = updates.name;
  }

  if (Object.hasOwn(updates, "phone")) {
    user.phone = updates.phone;
  }

  await user.save();

  return sanitizeUser(user);
};

export const changeCurrentUserPassword = async (authPayload, payload) => {
  const { currentPassword, newPassword } = validateChangePasswordPayload(payload);
  const user = await findActiveUserByAuthPayload(authPayload, { includePassword: true });
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = await hashPassword(newPassword);
  await user.save();
};

const assertCloudinaryConfigured = () => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
};

const uploadBufferToCloudinary = (buffer, publicIdSeed) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "amrik/profile-images",
        public_id: publicIdSeed,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

export const updateCurrentUserProfileImage = async (authPayload, file) => {
  if (!file) {
    throw new ApiError(400, "Profile image is required");
  }

  assertCloudinaryConfigured();

  const user = await findActiveUserByAuthPayload(authPayload);
  const compressedImage = await sharp(file.buffer)
    .rotate()
    .resize(512, 512, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer();
  const uploadResult = await uploadBufferToCloudinary(
    compressedImage,
    `${user._id.toString()}-${Date.now()}`,
  );
  const previousPublicId = user.profileImagePublicId;

  user.profileImageUrl = uploadResult.secure_url;
  user.profileImagePublicId = uploadResult.public_id;
  await user.save();

  if (previousPublicId && previousPublicId !== uploadResult.public_id) {
    cloudinary.uploader.destroy(previousPublicId).catch((error) => {
      console.warn("[api] failed to delete previous profile image", {
        userId: user._id.toString(),
        message: error.message,
      });
    });
  }

  return sanitizeUser(user);
};

export const loginUser = async (payload) => {
  const credentials = prepareLoginData(payload);
  const user = await findUserByEmail(credentials.email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(credentials.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    token: issueAuthToken(user),
    user: sanitizeUser(user),
  };
};

export const issueAuthToken = (user) => {
  return signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
};
