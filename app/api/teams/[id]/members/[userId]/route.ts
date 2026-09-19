import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { isTeamOwner } from "@/services/teamService";
import { notify } from "@/lib/notify";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const team = await Team.findById(params.id);
    if (!team) return apiError("Team not found", 404);

    const isSelf = params.userId === session.user.id;
    const isOwner = isTeamOwner(team, session.user.id);

    if (isTeamOwner(team, params.userId)) {
      return apiError("The team owner can't be removed. Delete the team instead.", 400);
    }
    if (!isOwner && !isSelf) return apiError("Forbidden", 403);

    const before = team.members.length;
    team.members = team.members.filter((m) => m.userId.toString() !== params.userId) as any;
    if (team.members.length === before) return apiError("Member not found", 404);

    await team.save();

    await Activity.create({
      teamId: team._id,
      actorId: session.user.id,
      action: isSelf ? "left the team" : "removed a member",
      entityType: "member",
      entityId: params.userId,
    });

    if (!isSelf) {
      await notify({
        userId: params.userId,
        type: "member_removed",
        message: `You were removed from ${team.name}`,
        relatedEntity: { kind: "team", id: team._id },
      });
    }

    return apiOk({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}

const roleSchema = z.object({ role: z.string().trim().min(1).max(60) });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const team = await Team.findById(params.id);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamOwner(team, session.user.id)) return apiError("Forbidden", 403);

    const { role } = roleSchema.parse(await req.json());
    const member = team.members.find((m) => m.userId.toString() === params.userId);
    if (!member) return apiError("Member not found", 404);

    member.role = role;
    await team.save();

    return apiOk({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
