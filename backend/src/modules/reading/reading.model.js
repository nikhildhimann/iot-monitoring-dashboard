import mongoose from "mongoose";
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
      min: -120,
      max: 0,
      default: null,
    },
    uptime: {
      type: Number,
      required: true,
      min: 0,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    deviceTimestamp: {
      type: Date,
      default: null,
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
