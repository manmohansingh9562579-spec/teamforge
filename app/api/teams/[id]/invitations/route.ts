import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getCurrentSession } from "@/lib/session";
import { JoinRequest } from "@/models/Request";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { isTeamOwner, openPositions } from "@/services/teamService";
import { teamInvitationSchema } from "@/validations/teamMatch";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    if (!Types.ObjectId.isValid(params.id)) return apiError("Invalid team ID", 400);

    const input = teamInvitationSchema.parse(await req.json());
    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamOwner(team, session.user.id)) return apiError("Only the team owner can invite people", 403);
    if (team.status === "closed" || team.status === "completed") {
      return apiError("This team is not accepting invitations", 400);
    }
    if (team.ownerId.toString() === input.inviteeId) return apiError("You cannot invite yourself", 400);
    if (team.members.some((member) => member.userId.toString() === input.inviteeId)) {
      return apiError("This developer is already on the team", 409);
    }

    const invitee = await User.findById(input.inviteeId).select("_id");
    if (!invitee) return apiError("Developer not found", 404);

    const existing = await JoinRequest.findOne({
      senderId: input.inviteeId,
      teamId: team._id,
      status: "pending",
    }).select("kind");
    if (existing) return apiError("There is already a pending request for this developer and team", 409);

    const pendingCount = await JoinRequest.countDocuments({ teamId: team._id, status: "pending" });
    if (openPositions(team) - pendingCount <= 0) return apiError("All open team positions are already requested", 400);

    const invitedRole = input.role && team.requiredRoles.includes(input.role)
      ? input.role
      : team.requiredRoles[0] ?? "Member";
    const invitation = await JoinRequest.create({
      kind: "invitation",
      senderId: invitee._id,
      invitedBy: session.user.id,
      invitedRole,
      teamId: team._id,
      message: input.message,
      status: "pending",
    });

    try {
      await notify({
        userId: invitee._id,
        type: "team_invitation",
        message: `${session.user.name || "A team owner"} invited you to join ${team.projectTitle}`,
        relatedEntity: { kind: "request", id: invitation._id },
      });
    } catch (err) {
      console.error("Could not create team invitation notification", err);
    }

    return apiOk({ id: invitation._id.toString(), status: invitation.status, teamId: team._id.toString() }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
