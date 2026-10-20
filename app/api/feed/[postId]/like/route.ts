import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { FeedPost } from "@/models/FeedPost";

export async function PUT(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to react to posts", 401);
    if (!Types.ObjectId.isValid(params.postId)) return apiError("Invalid post", 400);
    await connectDB();

    const post = await FeedPost.findById(params.postId).select("likes").lean();
    if (!post) return apiError("Post not found", 404);
    const alreadyLiked = post.likes.some((id) => id.toString() === session.user.id);
    const userId = new Types.ObjectId(session.user.id);
    await FeedPost.updateOne(
      { _id: params.postId },
      alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } }
    );
    const updated = await FeedPost.findById(params.postId).select("likes").lean();
    return apiOk({ liked: !alreadyLiked, likeCount: updated?.likes.length ?? 0 });
  } catch (error) {
    return handleApiError(error);
  }
}
