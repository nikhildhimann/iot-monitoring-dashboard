import mongoose from "mongoose";
import validator from "validator";

import { DEVICE_STATUS } from "../../constants/deviceStatus.js";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.OFFLINE,
      index: true,
    },
    firmwareVersion: {
      type: String,
      trim: true,
      default: "",
      maxlength: 40,
    },
    weight: {
      type: Number,
      min: 0,
      default: 0,
    },
    vibration: {
      type: Boolean,
      default: false,
    },
    buzzerOn: {
      type: Boolean,
      default: false,
    },
    ledOn: {
      type: Boolean,
      default: false,
    },
    wifiSignal: {
      type: Number,
      min: -120,
      max: 0,
      default: -120,
    },
    uptime: {
      type: Number,
      min: 0,
      default: 0,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => value === "" || validator.isIP(value),
        message: "Please provide a valid IP address",
      },
    },
    lastReadingAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

deviceSchema.index({ status: 1, lastSeenAt: 1 });
deviceSchema.index({ lastReadingAt: -1 });

const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);

export default Device;
