import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PROJECT_TYPES, TEAM_STATUS, TEAM_VISIBILITY } from "@/lib/constants";

export interface IMembership {
  userId: Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  slug: string;
  projectTitle: string;
  description: string;
  ownerId: Types.ObjectId;
  members: IMembership[];
  requiredRoles: string[];
  requiredSkills: string[];
  techStack: string[];
  teamSize: number;
  projectType: (typeof PROJECT_TYPES)[number];
  status: (typeof TEAM_STATUS)[number];
  visibility: (typeof TEAM_VISIBILITY)[number];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    projectTitle: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [MembershipSchema], default: [] },
    requiredRoles: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    teamSize: { type: Number, required: true, min: 1, max: 50 },
    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    status: { type: String, enum: TEAM_STATUS, default: "forming" },
    visibility: { type: String, enum: TEAM_VISIBILITY, default: "public" },
    deadline: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate membership for the same user in a team at the schema level.
TeamSchema.pre("save", function (next) {
  const seen = new Set<string>();
  for (const m of this.members) {
    const id = m.userId.toString();
    if (seen.has(id)) {
      return next(new Error("Duplicate membership detected for user " + id));
    }
    seen.add(id);
  }
  next();
});

TeamSchema.index({ status: 1, visibility: 1 });
TeamSchema.index({ requiredSkills: 1 });
TeamSchema.index({ requiredRoles: 1 });
TeamSchema.index({ "members.userId": 1 });
TeamSchema.index({ name: "text", projectTitle: "text", description: "text" });

export const Team: Model<ITeam> = models.Team || model<ITeam>("Team", TeamSchema);
