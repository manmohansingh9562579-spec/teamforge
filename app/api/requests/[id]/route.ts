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

    if (status === "cancelled") {
      if (!isSender) return apiError("Forbidden", 403);
    } else {
      // accepted / rejected — only the team owner may decide.
      if (!isOwner) return apiError("Forbidden", 403);
    }

    if (status === "accepted") {
      if (openPositions(team) <= 0) return apiError("This team is already full", 400);

      const alreadyMember = team.members.some(
        (m) => m.userId.toString() === request.senderId.toString()
      );
      if (!alreadyMember) {
        team.members.push({
          userId: request.senderId,
          role: role ?? team.requiredRoles[0] ?? "Member",
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

      await notify({
        userId: request.senderId,
        type: "request_accepted",
        message: `Your request to join ${team.name} was accepted`,
        relatedEntity: { kind: "team", id: team._id },
      });
    }

    if (status === "rejected") {
      await notify({
        userId: request.senderId,
        type: "request_rejected",
        message: `Your request to join ${team.name} was declined`,
        relatedEntity: { kind: "team", id: team._id },
      });
    }

    request.status = status;
    await request.save();

    return apiOk(request);
  } catch (err) {
    return handleApiError(err);
  }
}
