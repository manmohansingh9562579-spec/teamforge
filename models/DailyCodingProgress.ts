import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import type { CodingLanguage } from "@/lib/codingChallenges";

export interface IDailyCodingProgress extends Document {
  userId: Types.ObjectId;
  dateKey: string;
  problemSlug: string;
  language: CodingLanguage;
  sourceCode: string;
  attempts: number;
  lastAttemptAt: Date;
  accepted: boolean;
  solvedAt?: Date;
  judgeTokens: string[];
  judgeMode: "run" | "submit";
  runStatus: "preparing" | "queued" | "running" | "finished" | "failed";
  runStartedAt?: Date;
  lastResults: {
    caseNumber: number;
    hidden: boolean;
    statusId: number;
    verdict: string;
    time?: string | null;
    memory?: number | null;
    output?: string;
    error?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CodingRunResultSchema = new Schema(
  {
    caseNumber: { type: Number, required: true },
    hidden: { type: Boolean, required: true },
    statusId: { type: Number, required: true },
    verdict: { type: String, required: true },
    time: { type: String, default: null },
    memory: { type: Number, default: null },
    output: { type: String },
    error: { type: String },
  },
  { _id: false }
);

const DailyCodingProgressSchema = new Schema<IDailyCodingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    problemSlug: { type: String, required: true, maxlength: 80 },
    language: { type: String, required: true, enum: ["python", "javascript", "typescript", "java", "cpp", "go", "c"] },
    sourceCode: { type: String, required: true, maxlength: 30000, select: false },
    attempts: { type: Number, default: 0, min: 0 },
    lastAttemptAt: { type: Date, required: true },
    accepted: { type: Boolean, default: false },
    solvedAt: { type: Date },
    judgeTokens: { type: [String], default: [], select: false },
    judgeMode: { type: String, enum: ["run", "submit"], default: "run", select: false },
    runStatus: { type: String, enum: ["preparing", "queued", "running", "finished", "failed"], default: "preparing", select: false },
    runStartedAt: { type: Date, select: false },
    lastResults: { type: [CodingRunResultSchema], default: [], select: false },
  },
  { timestamps: true }
);

DailyCodingProgressSchema.index({ userId: 1, dateKey: 1, problemSlug: 1 }, { unique: true });
DailyCodingProgressSchema.index({ userId: 1, dateKey: -1, accepted: 1 });

export const DailyCodingProgress: Model<IDailyCodingProgress> =
  models.DailyCodingProgress || model<IDailyCodingProgress>("DailyCodingProgress", DailyCodingProgressSchema);
