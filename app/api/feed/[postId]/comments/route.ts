import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getCurrentSession } from "@/lib/session";
import { FeedPost } from "@/models/FeedPost";
import { User } from "@/models/User";
import { createFeedCommentSchema } from "@/validations/feed";

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  try {
    if (!Types.ObjectId.isValid(params.postId)) return apiError("Invalid post", 400);
    await connectDB();
    const post = await FeedPost.findById(params.postId)
      .select("comments")
      .populate("comments.authorId", "name username avatar")
      .lean() as any;
    if (!post) return apiError("Post not found", 404);
    const comments = (post.comments ?? []).map((comment: any) => ({
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.authorId?._id ? {
        id: comment.authorId._id.toString(),
        name: comment.authorId.name,
        username: comment.authorId.username,
        avatar: comment.authorId.avatar,
      } : null,
    }));
    return apiOk({ comments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Sign in to join the conversation", 401);
    if (!Types.ObjectId.isValid(params.postId)) return apiError("Invalid post", 400);
    const { content } = createFeedCommentSchema.parse(await request.json());
    await connectDB();

    const post = await FeedPost.findOneAndUpdate(
      { _id: params.postId, commentCount: { $lt: 100 } },
      { $push: { comments: { authorId: session.user.id, content } }, $inc: { commentCount: 1 } },
      { new: true, projection: "authorId comments" }
    ).lean() as any;
    if (!post) {
      const exists = await FeedPost.exists({ _id: params.postId });
      return exists ? apiError("This post has reached its comment limit", 409) : apiError("Post not found", 404);
    }

    const [author, commenter] = await Promise.all([
      User.findById(post.authorId).select("_id name username avatar").lean(),
      User.findById(session.user.id).select("_id name username avatar").lean(),
    ]);
    const saved = post.comments.at(-1);
    if (author && author._id.toString() !== session.user.id) {
      await notify({
        userId: author._id,
        type: "feed_comment",
        message: `${commenter?.name ?? "Someone"} commented on your post`,
        relatedEntity: { kind: "post", id: new Types.ObjectId(params.postId) },
      });
    }

    return apiOk({
      comment: {
        id: saved._id.toString(),
        content: saved.content,
        createdAt: saved.createdAt.toISOString(),
        author: commenter ? {
          id: commenter._id.toString(),
          name: commenter.name,
          username: commenter.username,
          avatar: commenter.avatar,
        } : null,
      },
      commentCount: post.commentCount,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
