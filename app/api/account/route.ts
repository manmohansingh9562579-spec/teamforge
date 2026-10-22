import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { Notification } from "@/models/Notification";
import { ChallengeSubmission } from "@/models/ChallengeSubmission";
import { FeedPost } from "@/models/FeedPost";
import { ContactRequest } from "@/models/ContactRequest";
import { Message } from "@/models/Message";
import { ProfilePhoto } from "@/models/ProfilePhoto";
import { DailyCodingProgress } from "@/models/DailyCodingProgress";
import { LogicDataProgress } from "@/models/LogicDataProgress";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";
import { Types } from "mongoose";

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    const userId = session.user.id;

    await connectDB();

    // Teams the user owns are deleted entirely, along with their data.
    const ownedTeamIds = await Team.find({ ownerId: userId }).distinct("_id");
    const [ownedPostIds, relatedRequestIds, contactRequestIds, ownedTaskIds] = await Promise.all([
      FeedPost.find({ authorId: userId }).distinct("_id"),
      JoinRequest.find({
        $or: [{ senderId: userId }, { teamId: { $in: ownedTeamIds } }],
      }).distinct("_id"),
      ContactRequest.find({ $or: [{ senderId: userId }, { recipientId: userId }] }).distinct("_id"),
      Task.find({ teamId: { $in: ownedTeamIds } }).distinct("_id"),
    ]);
    await Promise.all([
      Team.deleteMany({ ownerId: userId }),
      Task.deleteMany({ teamId: { $in: ownedTeamIds } }),
      JoinRequest.deleteMany({ teamId: { $in: ownedTeamIds } }),
      Activity.deleteMany({ teamId: { $in: ownedTeamIds } }),
    ]);

    // Leave every other team the user belongs to.
    await Team.updateMany(
      { "members.userId": userId },
      { $pull: { members: { userId } } }
    );

    // Clean up personal records that shouldn't outlive the account.
    await Promise.all([
      JoinRequest.deleteMany({ senderId: userId }),
      Notification.deleteMany({ userId }),
      ChallengeSubmission.deleteMany({ userId }),
      DailyCodingProgress.deleteMany({ userId }),
      LogicDataProgress.deleteMany({ userId }),
      FeedPost.deleteMany({ authorId: userId }),
      Notification.deleteMany({ "relatedEntity.kind": "post", "relatedEntity.id": { $in: ownedPostIds } }),
      Notification.deleteMany({ "relatedEntity.kind": "team", "relatedEntity.id": { $in: ownedTeamIds } }),
      Notification.deleteMany({ "relatedEntity.kind": "task", "relatedEntity.id": { $in: ownedTaskIds } }),
      Notification.deleteMany({
        "relatedEntity.kind": "request",
        "relatedEntity.id": { $in: relatedRequestIds },
      }),
      Notification.deleteMany({
        "relatedEntity.kind": "contact",
        "relatedEntity.id": { $in: contactRequestIds },
      }),
      ContactRequest.deleteMany({ $or: [{ senderId: userId }, { recipientId: userId }] }),
      Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
      ProfilePhoto.deleteOne({ userId }),
      Activity.deleteMany({ actorId: userId }),
      Activity.deleteMany({ entityType: "member", entityId: userId }),
      FeedPost.updateMany({ likes: userId }, { $pull: { likes: userId } }),
      FeedPost.updateMany(
        { "comments.authorId": userId },
        [
          { $set: { comments: { $filter: {
            input: "$comments",
            as: "comment",
            cond: { $ne: ["$$comment.authorId", new Types.ObjectId(userId)] },
          } } } },
          { $set: { commentCount: { $size: "$comments" } } },
        ]
      ),
      Task.updateMany({ assignee: userId }, { $unset: { assignee: "" } }),
    ]);

    await User.findByIdAndDelete(userId);

    return apiOk({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
