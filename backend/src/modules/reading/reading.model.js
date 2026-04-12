import mongoose from "mongoose";
import validator from "validator";

const readingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    vibration: {
      type: Boolean,
      required: true,
    },
    buzzerOn: {
      type: Boolean,
      required: true,
    },
    ledOn: {
      type: Boolean,
      required: true,
    },
    wifiSignal: {
      type: Number,
      required: true,
      min: -120,
      max: 0,
    },
    uptime: {
      type: Number,
      required: true,
      min: 0,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: validator.isIP,
        message: "Please provide a valid IP address",
      },
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

readingSchema.index({ deviceId: 1, timestamp: -1 });
readingSchema.index({ deviceId: 1, createdAt: -1 });
readingSchema.index({ timestamp: -1 });

const Reading = mongoose.models.Reading || mongoose.model("Reading", readingSchema);

export default Reading;
