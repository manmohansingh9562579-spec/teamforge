import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { FeedPost } from "@/models/FeedPost";

export async function DELETE(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to manage your posts", 401);
    if (!Types.ObjectId.isValid(params.postId)) return apiError("Invalid post", 400);
    await connectDB();
    const deleted = await FeedPost.findOneAndDelete({ _id: params.postId, authorId: session.user.id });
    if (!deleted) return apiError("Post not found", 404);
    return apiOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
