import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { REQUEST_STATUS } from "@/lib/constants";

export interface IRequest extends Document {
  senderId: Types.ObjectId;
  teamId: Types.ObjectId;
  message: string;
  status: (typeof REQUEST_STATUS)[number];
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    message: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: REQUEST_STATUS, default: "pending" },
  },
  { timestamps: true }
);

// A user may only have one pending request per team.
RequestSchema.index(
  { senderId: 1, teamId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);
RequestSchema.index({ teamId: 1, status: 1 });
RequestSchema.index({ senderId: 1, status: 1 });

export const JoinRequest: Model<IRequest> =
  models.JoinRequest || model<IRequest>("JoinRequest", RequestSchema);
