import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IActivity extends Document {
  teamId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: string;
  entityType: "team" | "task" | "member" | "request";
  entityId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, maxlength: 200 },
    entityType: { type: String, enum: ["team", "task", "member", "request"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.index({ teamId: 1, createdAt: -1 });

export const Activity: Model<IActivity> =
  models.Activity || model<IActivity>("Activity", ActivitySchema);
