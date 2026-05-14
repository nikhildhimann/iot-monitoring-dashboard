import mongoose from "mongoose";

const pushAlertCooldownSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    alertType: {
      type: String,
      required: true,
      trim: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound index for quick lookup
pushAlertCooldownSchema.index({ deviceId: 1, alertType: 1 }, { unique: true });

const PushAlertCooldown =
  mongoose.models.PushAlertCooldown || mongoose.model("PushAlertCooldown", pushAlertCooldownSchema);

export default PushAlertCooldown;
