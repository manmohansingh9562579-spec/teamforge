import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export const FEED_POST_TYPES = ["build", "question", "collaboration"] as const;
export type FeedPostType = (typeof FEED_POST_TYPES)[number];

export interface IFeedComment {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IFeedPost extends Document {
  authorId: Types.ObjectId;
  type: FeedPostType;
  content: string;
  projectName: string;
  githubUrl: string;
  demoUrl: string;
  skills: string[];
  likes: Types.ObjectId[];
  comments: IFeedComment[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IFeedComment>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 800 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const FeedPostSchema = new Schema<IFeedPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: FEED_POST_TYPES, required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    projectName: { type: String, trim: true, maxlength: 100, default: "" },
    githubUrl: { type: String, trim: true, maxlength: 500, default: "" },
    demoUrl: { type: String, trim: true, maxlength: 500, default: "" },
    skills: { type: [String], default: [], maxlength: 5 },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [] },
    comments: { type: [CommentSchema], default: [] },
    commentCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

FeedPostSchema.index({ createdAt: -1, _id: -1 });
FeedPostSchema.index({ type: 1, createdAt: -1 });

export const FeedPost: Model<IFeedPost> =
  models.FeedPost || model<IFeedPost>("FeedPost", FeedPostSchema);
