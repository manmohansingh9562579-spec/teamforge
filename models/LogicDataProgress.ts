import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import type { LogicDataDifficulty, LogicDataTrack } from "@/lib/logicDataChallenges";

export interface ILogicDataProgress extends Document {
  userId: Types.ObjectId;
  dateKey: string;
  challengeId: string;
  track: LogicDataTrack;
  difficulty: LogicDataDifficulty;
  attempts: number;
  correctAttempts: number;
  solvedAt?: Date;
  lastAttemptAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LogicDataProgressSchema = new Schema<ILogicDataProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    challengeId: { type: String, required: true, maxlength: 80 },
    track: { type: String, enum: ["Data", "Math", "Logic"], required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Advanced"], required: true },
    attempts: { type: Number, default: 0, min: 0 },
    correctAttempts: { type: Number, default: 0, min: 0 },
    solvedAt: { type: Date },
    lastAttemptAt: { type: Date, required: true },
  },
  { timestamps: true }
);

LogicDataProgressSchema.index({ userId: 1, dateKey: 1, challengeId: 1 }, { unique: true });
LogicDataProgressSchema.index({ userId: 1, dateKey: -1, solvedAt: 1 });

export const LogicDataProgress: Model<ILogicDataProgress> =
  models.LogicDataProgress || model<ILogicDataProgress>("LogicDataProgress", LogicDataProgressSchema);
