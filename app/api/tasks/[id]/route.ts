import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { Task } from "@/models/Task";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { isTeamMember } from "@/services/teamService";
import { updateTaskSchema } from "@/validations/task";
import { notify } from "@/lib/notify";
import { apiOk, apiError, handleApiError } from "@/lib/api";

async function loadTaskAndTeam(taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) return null;
  const team = await Team.findById(task.teamId);
  if (!team) return null;
  return { task, team };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const found = await loadTaskAndTeam(params.id);
    if (!found) return apiError("Task not found", 404);
    const { task, team } = found;

    if (!isTeamMember(team, session.user.id)) return apiError("Forbidden", 403);

    const data = updateTaskSchema.parse(await req.json());

    if (data.assignee !== undefined && data.assignee !== "") {
      if (!isTeamMember(team, data.assignee)) {
        return apiError("Assignee must be a team member", 400);
      }
    }

    const previousStatus = task.status;
    const previousAssignee = task.assignee?.toString();

    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.assignee !== undefined) task.assignee = (data.assignee || undefined) as any;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

    await task.save();

    if (data.status && data.status !== previousStatus) {
      await Activity.create({
        teamId: team._id,
        actorId: session.user.id,
        action: `moved "${task.title}" to ${data.status}`,
        entityType: "task",
        entityId: task._id,
      });

      if (task.assignee) {
        await notify({
          userId: task.assignee,
          type: "task_status_changed",
          message: `"${task.title}" moved to ${data.status}`,
          relatedEntity: { kind: "task", id: task._id },
        });
      }
    }

    if (data.assignee && data.assignee !== previousAssignee) {
      await notify({
        userId: data.assignee,
        type: "task_assigned",
        message: `You were assigned "${task.title}" on ${team.name}`,
        relatedEntity: { kind: "task", id: task._id },
      });
    }

    return apiOk(task);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const found = await loadTaskAndTeam(params.id);
    if (!found) return apiError("Task not found", 404);
    const { task, team } = found;

    if (!isTeamMember(team, session.user.id)) return apiError("Forbidden", 403);

    await Task.findByIdAndDelete(task._id);
    await Activity.create({
      teamId: team._id,
      actorId: session.user.id,
      action: `deleted task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
    });

    return apiOk({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
