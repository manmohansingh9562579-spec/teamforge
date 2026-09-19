import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { isTeamMember } from "@/services/teamService";
import { createTaskSchema } from "@/validations/task";
import { notify } from "@/lib/notify";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    if (!teamId) return apiError("teamId is required", 400);

    await connectDB();
    const team = await Team.findById(teamId);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamMember(team, session.user.id)) return apiError("Forbidden", 403);

    const tasks = await Task.find({ teamId }).sort({ createdAt: -1 });
    return apiOk(tasks);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const body = await req.json();
    const data = createTaskSchema.parse(body);

    await connectDB();
    const team = await Team.findById(data.teamId);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamMember(team, session.user.id)) return apiError("Forbidden", 403);

    // If assigning, verify the assignee is actually a member of this team.
    if (data.assignee) {
      const isAssigneeMember = isTeamMember(team, data.assignee);
      if (!isAssigneeMember) return apiError("Assignee must be a team member", 400);
    }

    const task = await Task.create({
      teamId: team._id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee || undefined,
      createdBy: session.user.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: "To Do",
    });

    await Activity.create({
      teamId: team._id,
      actorId: session.user.id,
      action: `created task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    if (data.assignee && data.assignee !== session.user.id) {
      await notify({
        userId: data.assignee,
        type: "task_assigned",
        message: `You were assigned "${task.title}" on ${team.name}`,
        relatedEntity: { kind: "task", id: task._id },
      });
    }

    return apiOk(task, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
