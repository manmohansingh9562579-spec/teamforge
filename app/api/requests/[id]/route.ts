import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { isTeamOwner, openPositions } from "@/services/teamService";
import { notify } from "@/lib/notify";
import { apiOk, apiError, handleApiError } from "@/lib/api";

const bodySchema = z.object({
  status: z.enum(["accepted", "rejected", "cancelled"]),
  role: z.string().trim().min(1).max(60).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const { status, role } = bodySchema.parse(await req.json());

    await connectDB();
    const request = await JoinRequest.findById(params.id);
    if (!request) return apiError("Request not found", 404);
    if (request.status !== "pending") return apiError("This request was already resolved", 400);

    const team = await Team.findById(request.teamId);
    if (!team) return apiError("Team not found", 404);

    const isSender = request.senderId.toString() === session.user.id;
    const isOwner = isTeamOwner(team, session.user.id);
    const isInviter = request.kind === "invitation" && request.invitedBy?.toString() === session.user.id;
    if (request.kind === "invitation" && !request.invitedBy) return apiError("Invalid invitation", 400);

    if (status === "cancelled") {
      if (request.kind === "invitation" ? !isInviter : !isSender) return apiError("Forbidden", 403);
    } else {
      // Team owners decide join requests; invited users decide invitations.
      if (request.kind === "invitation" ? !isSender : !isOwner) return apiError("Forbidden", 403);
    }

    if (status === "accepted") {
      if (openPositions(team) <= 0) return apiError("This team is already full", 400);

      const alreadyMember = team.members.some(
        (m) => m.userId.toString() === request.senderId.toString()
      );
      if (!alreadyMember) {
        team.members.push({
          userId: request.senderId,
          role: request.kind === "invitation"
            ? request.invitedRole ?? team.requiredRoles[0] ?? "Member"
            : role ?? team.requiredRoles[0] ?? "Member",
          joinedAt: new Date(),
        } as any);
        await team.save();
      }

      await Activity.create({
        teamId: team._id,
        actorId: session.user.id,
        action: "accepted a join request",
        entityType: "member",
        entityId: request.senderId,
      });

      const recipientId = request.kind === "invitation" ? request.invitedBy! : request.senderId;
      await notify({
        userId: recipientId,
        type: request.kind === "invitation" ? "team_invitation_accepted" : "request_accepted",
        message: request.kind === "invitation"
          ? `${session.user.name || "A developer"} accepted your invitation to join ${team.name}`
          : `Your request to join ${team.name} was accepted`,
        relatedEntity: { kind: "request", id: request._id },
      });
    }

    if (status === "rejected" && request.kind === "invitation") {
      await notify({
        userId: request.invitedBy!,
        type: "team_invitation_declined",
        message: `${session.user.name || "A developer"} declined your invitation to join ${team.name}`,
        relatedEntity: { kind: "request", id: request._id },
      });
    } else if (status === "rejected") {
      await notify({
        userId: request.senderId,
        type: "request_rejected",
        message: `Your request to join ${team.name} was declined`,
        relatedEntity: { kind: "request", id: request._id },
      });
    }

    request.status = status;
    await request.save();

    if (status === "cancelled" && request.kind === "invitation") {
      await notify({
        userId: request.senderId,
        type: "team_invitation_cancelled",
        message: `The invitation to join ${team.name} was withdrawn`,
        relatedEntity: { kind: "request", id: request._id },
      });
    }

    return apiOk(request);
  } catch (err) {
    return handleApiError(err);
  }
}
