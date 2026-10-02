import { Schema, model, models, type Document, type Model } from "mongoose";

interface IPasswordResetRateLimit extends Document {
  keyHash: string;
  windowStart: Date;
  count: number;
  expiresAt: Date;
}

const PasswordResetRateLimitSchema = new Schema<IPasswordResetRateLimit>(
  {
    keyHash: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

PasswordResetRateLimitSchema.index({ keyHash: 1, windowStart: 1 }, { unique: true });
PasswordResetRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetRateLimit: Model<IPasswordResetRateLimit> =
  models.PasswordResetRateLimit ||
  model<IPasswordResetRateLimit>("PasswordResetRateLimit", PasswordResetRateLimitSchema);
