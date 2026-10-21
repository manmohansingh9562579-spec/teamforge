import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { getCurrentSession } from "@/lib/session";
import { ProfilePhoto } from "@/models/ProfilePhoto";
import { User } from "@/models/User";

const MAX_PHOTO_BYTES = 512 * 1024;

export async function PUT(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("Choose a profile photo to upload", 400);
    if (file.type !== "image/webp") {
      return apiError("Could not prepare this photo. Choose an image and try again.", 400);
    }
    if (!file.size || file.size > MAX_PHOTO_BYTES) {
      return apiError("The optimized photo must be 512 KB or smaller", 400);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (
      bytes.length < 12 ||
      bytes.toString("ascii", 0, 4) !== "RIFF" ||
      bytes.toString("ascii", 8, 12) !== "WEBP"
    ) {
      return apiError("That file is not a valid WebP image", 400);
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("_id");
    if (!user) return apiError("User not found", 404);

    const photo = await ProfilePhoto.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, contentType: "image/webp", data: bytes },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select("updatedAt");
    const avatar = `/api/profile/avatar/${user._id.toString()}?v=${photo.updatedAt.getTime()}`;

    await User.findByIdAndUpdate(user._id, { avatar });
    return apiOk({ avatar });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    if (!Types.ObjectId.isValid(session.user.id)) return apiError("User not found", 404);

    await connectDB();
    await ProfilePhoto.deleteOne({ userId: session.user.id });
    const user = await User.findByIdAndUpdate(session.user.id, { avatar: "" });
    if (!user) return apiError("User not found", 404);

    return apiOk({ avatar: "" });
  } catch (error) {
    return handleApiError(error);
  }
}
