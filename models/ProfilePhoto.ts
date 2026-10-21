import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface IProfilePhoto extends Document {
  userId: Types.ObjectId;
  contentType: "image/webp";
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const ProfilePhotoSchema = new Schema<IProfilePhoto>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    contentType: { type: String, enum: ["image/webp"], required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export const ProfilePhoto: Model<IProfilePhoto> =
  models.ProfilePhoto || model<IProfilePhoto>("ProfilePhoto", ProfilePhotoSchema);
