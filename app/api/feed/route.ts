import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { FeedPost, FEED_POST_TYPES } from "@/models/FeedPost";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 15;

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const cursor = searchParams.get("cursor");
    const filter: Record<string, unknown> = {};

    if (type && type !== "all") {
      if (!FEED_POST_TYPES.includes(type as (typeof FEED_POST_TYPES)[number])) {
        return apiError("Unknown feed filter", 400);
      }
      filter.type = type;
    }
    if (cursor) {
      const [createdAtRaw, id] = cursor.split("|");
      const createdAt = new Date(createdAtRaw);
      if (Number.isNaN(createdAt.getTime()) || !Types.ObjectId.isValid(id ?? "")) {
        return apiError("Invalid feed cursor", 400);
      }
      filter.$or = [
        { createdAt: { $lt: createdAt } },
        { createdAt, _id: { $lt: new Types.ObjectId(id) } },
      ];
    }

    const [records, session] = await Promise.all([
      FeedPost.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(PAGE_SIZE + 1)
        .populate("authorId", "name username avatar headline skills")
        .populate("comments.authorId", "name username avatar")
        .lean(),
      getCurrentSession(),
    ]);
    const hasMore = records.length > PAGE_SIZE;
    const page = records.slice(0, PAGE_SIZE) as any[];
    const viewer = session?.user?.id
      ? await User.findById(session.user.id).select("name username avatar headline skills").lean()
      : null;

    const posts = page.map((post) => {
      const author = post.authorId;
      const comments = (post.comments ?? []).slice(-3).map((comment: any) => ({
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

      return {
        id: post._id.toString(),
        type: post.type,
        content: post.content,
        projectName: post.projectName,
        githubUrl: post.githubUrl,
        demoUrl: post.demoUrl,
        skills: post.skills,
        likeCount: post.likes.length,
        likedByMe: Boolean(session?.user?.id && post.likes.some((id: Types.ObjectId) => id.toString() === session.user.id)),
        commentCount: post.commentCount,
        createdAt: post.createdAt.toISOString(),
        author: author?._id ? {
          id: author._id.toString(),
          name: author.name,
          username: author.username,
          avatar: author.avatar,
          headline: author.headline,
          skills: author.skills,
        } : null,
        comments,
        isMine: Boolean(session?.user?.id && post.authorId?._id?.toString() === session.user.id),
      };
    });

    const skillCounts = new Map<string, number>();
    for (const post of page) {
      for (const skill of post.skills ?? []) skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
    }
    const trendingSkills = [...skillCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, posts]) => ({ name, posts }));
    const lastPost = page.at(-1);

    return apiOk({
      posts,
      viewer: viewer ? {
        id: viewer._id.toString(),
        name: viewer.name,
        username: viewer.username,
        avatar: viewer.avatar,
        headline: viewer.headline,
        skills: viewer.skills,
      } : null,
      trendingSkills,
      nextCursor: hasMore && lastPost ? `${lastPost.createdAt.toISOString()}|${lastPost._id.toString()}` : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST() {
  return apiError("Posting is temporarily paused. Add milestones to your developer profile instead.", 403);
}
