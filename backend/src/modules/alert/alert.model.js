import mongoose from "mongoose";

import { ALERT_TYPES } from "../../constants/alertTypes.js";

const alertSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      default: null,
    },
    threshold: {
      type: Number,
      default: null,
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "cleared"],
      default: "open",
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    clearedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

alertSchema.index({ type: 1, createdAt: -1 });
alertSchema.index({ deviceId: 1, status: 1, createdAt: -1 });
alertSchema.index({ deviceId: 1, triggeredAt: -1 });
alertSchema.index(
  { deviceId: 1, type: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "open",
    },
  },
);

const Alert = mongoose.models.Alert || mongoose.model("Alert", alertSchema);

export default Alert;
