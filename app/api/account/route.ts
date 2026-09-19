import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { Notification } from "@/models/Notification";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    const userId = session.user.id;

    await connectDB();

    // Teams the user owns are deleted entirely, along with their data.
    const ownedTeamIds = await Team.find({ ownerId: userId }).distinct("_id");
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
      Task.updateMany({ assignee: userId }, { $unset: { assignee: "" } }),
    ]);

    await User.findByIdAndDelete(userId);

    return apiOk({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
