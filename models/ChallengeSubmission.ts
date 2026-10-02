import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IChallengeSubmission extends Document {
  challengeKey: string;
  userId: Types.ObjectId;
  projectName: string;
  summary: string;
  repositoryUrl: string;
  demoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSubmissionSchema = new Schema<IChallengeSubmission>(
  {
    challengeKey: { type: String, required: true, maxlength: 10 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true, trim: true, maxlength: 80 },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    repositoryUrl: { type: String, default: "", maxlength: 500 },
    demoUrl: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

ChallengeSubmissionSchema.index(
  { challengeKey: 1, userId: 1 },
  { unique: true }
);
ChallengeSubmissionSchema.index({ challengeKey: 1, updatedAt: -1 });

export const ChallengeSubmission: Model<IChallengeSubmission> =
  models.ChallengeSubmission ||
  model<IChallengeSubmission>("ChallengeSubmission", ChallengeSubmissionSchema);
