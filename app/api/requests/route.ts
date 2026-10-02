import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "sent" ? "sent" : "incoming";

    if (type === "sent") {
      const [requests, invitations] = await Promise.all([
        JoinRequest.find({ senderId: session.user.id })
          .or([{ kind: "join" }, { kind: { $exists: false } }])
          .sort({ createdAt: -1 })
          .populate("teamId", "name projectTitle slug"),
        JoinRequest.find({ invitedBy: session.user.id, kind: "invitation" })
          .sort({ createdAt: -1 })
          .populate("senderId", "name username avatar headline")
          .populate("teamId", "name projectTitle slug"),
      ]);
      return apiOk({ requests, invitations });
    }

    // Incoming: requests for teams the current user owns.
    const ownedTeamIds = await Team.find({ ownerId: session.user.id }).distinct("_id");
    const [requests, invitations] = await Promise.all([
      JoinRequest.find({ teamId: { $in: ownedTeamIds }, status: "pending" })
        .or([{ kind: "join" }, { kind: { $exists: false } }])
        .sort({ createdAt: -1 })
        .populate("senderId", "name username avatar headline skills")
        .populate("teamId", "name projectTitle slug"),
      JoinRequest.find({ senderId: session.user.id, kind: "invitation" })
        .sort({ createdAt: -1 })
        .populate("invitedBy", "name username avatar headline")
        .populate("teamId", "name projectTitle slug"),
    ]);

    return apiOk({ requests, invitations });
  } catch (err) {
    return handleApiError(err);
  }
}
