import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

export interface ITask extends Document {
  teamId: Types.ObjectId;
  title: string;
  description: string;
  status: (typeof TASK_STATUS)[number];
  priority: (typeof TASK_PRIORITY)[number];
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: "", maxlength: 2000 },
    status: { type: String, enum: TASK_STATUS, default: "To Do" },
    priority: { type: String, enum: TASK_PRIORITY, default: "Medium" },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ teamId: 1, status: 1 });
TaskSchema.index({ teamId: 1, assignee: 1 });
TaskSchema.index({ teamId: 1, dueDate: 1 });

export const Task: Model<ITask> = models.Task || model<ITask>("Task", TaskSchema);
