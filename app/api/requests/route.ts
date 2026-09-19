import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "sent" ? "sent" : "incoming";

    if (type === "sent") {
      const requests = await JoinRequest.find({ senderId: session.user.id })
        .sort({ createdAt: -1 })
        .populate("teamId", "name projectTitle slug");
      return apiOk(requests);
    }

    // Incoming: requests for teams the current user owns.
    const ownedTeamIds = await Team.find({ ownerId: session.user.id }).distinct("_id");
    const requests = await JoinRequest.find({ teamId: { $in: ownedTeamIds }, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("senderId", "name username avatar headline skills")
      .populate("teamId", "name projectTitle slug");

    return apiOk(requests);
  } catch (err) {
    return handleApiError(err);
  }
}
