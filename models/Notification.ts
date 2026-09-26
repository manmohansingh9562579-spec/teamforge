import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: (typeof NOTIFICATION_TYPES)[number];
  message: string;
  relatedEntity?: { kind: "team" | "task" | "request" | "contact" | "user"; id: Types.ObjectId };
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, maxlength: 300 },
    relatedEntity: {
      kind: { type: String, enum: ["team", "task", "request", "contact", "user"] },
      id: { type: Schema.Types.ObjectId },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  models.Notification || model<INotification>("Notification", NotificationSchema);
