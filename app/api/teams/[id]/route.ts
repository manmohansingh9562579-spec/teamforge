import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { updateTeamSchema } from "@/validations/team";
import { isTeamOwner } from "@/services/teamService";
import { apiOk, apiError, handleApiError } from "@/lib/api";

async function findTeam(id: string) {
  await connectDB();
  return Team.findById(id);
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const team = await findTeam(params.id);
    if (!team) return apiError("Team not found", 404);
    return apiOk(team);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const team = await findTeam(params.id);
    if (!team) return apiError("Team not found", 404);

    // Server-side authorization only — never trust a client-supplied owner flag.
    if (!isTeamOwner(team, session.user.id)) return apiError("Forbidden", 403);

    const body = await req.json();
    const data = updateTeamSchema.parse(body);

    Object.assign(team, {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : team.deadline,
    });
    await team.save();

    return apiOk(team);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const team = await findTeam(params.id);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamOwner(team, session.user.id)) return apiError("Forbidden", 403);

    await Promise.all([
      Team.findByIdAndDelete(team._id),
      JoinRequest.deleteMany({ teamId: team._id }),
      Task.deleteMany({ teamId: team._id }),
      Activity.deleteMany({ teamId: team._id }),
    ]);

    return apiOk({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
