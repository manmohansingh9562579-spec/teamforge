import { Schema, model, models, type Document, type Model } from "mongoose";
import {
  ROLES,
  EXPERIENCE_LEVELS,
  INTERESTS,
  AVAILABILITY,
} from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  location?: string;
  college?: string;
  graduationYear?: number;
  experienceLevel?: (typeof EXPERIENCE_LEVELS)[number];
  availability?: (typeof AVAILABILITY)[number];
  skills: string[];
  preferredRoles: string[];
  interests: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    headline: { type: String, default: "", maxlength: 120 },
    bio: { type: String, default: "", maxlength: 600 },
    location: { type: String, default: "" },
    college: { type: String, default: "" },
    graduationYear: { type: Number },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
    availability: { type: String, enum: AVAILABILITY, default: "Available" },
    skills: { type: [String], default: [] },
    preferredRoles: { type: [String], enum: ROLES, default: [] },
    interests: { type: [String], enum: INTERESTS, default: [] },
    githubUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

UserSchema.index({ skills: 1 });
UserSchema.index({ preferredRoles: 1 });
UserSchema.index({ name: "text", headline: "text", bio: "text" });

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
