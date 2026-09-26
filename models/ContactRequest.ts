import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { CONTACT_REQUEST_STATUS } from "@/lib/constants";

export interface IContactRequest extends Document {
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  message: string;
  status: (typeof CONTACT_REQUEST_STATUS)[number];
  /** Canonical participant pair used to prevent pending requests in either direction. */
  pairKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, default: "", maxlength: 500 },
    status: { type: String, enum: CONTACT_REQUEST_STATUS, default: "pending" },
    pairKey: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

ContactRequestSchema.index(
  { pairKey: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
ContactRequestSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
ContactRequestSchema.index({ senderId: 1, status: 1, createdAt: -1 });

export const ContactRequest: Model<IContactRequest> =
  models.ContactRequest || model<IContactRequest>("ContactRequest", ContactRequestSchema);
