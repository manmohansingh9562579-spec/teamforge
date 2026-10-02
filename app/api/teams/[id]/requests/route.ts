import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { JoinRequest } from "@/models/Request";
import { getCurrentSession } from "@/lib/session";
import { isTeamMember, openPositions } from "@/services/teamService";
import { notify } from "@/lib/notify";
import { apiOk, apiError, handleApiError } from "@/lib/api";

const bodySchema = z.object({
  message: z.string().trim().max(500).optional().default(""),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const { message } = bodySchema.parse(await req.json());

    await connectDB();
    const team = await Team.findById(params.id);
    if (!team) return apiError("Team not found", 404);

    if (team.status === "closed" || team.status === "completed") {
      return apiError("This team is not accepting requests", 400);
    }
    if (openPositions(team) <= 0) {
      return apiError("This team is full", 400);
    }
    if (isTeamMember(team, session.user.id)) {
      return apiError("You are already a member of this team", 400);
    }

    const existing = await JoinRequest.findOne({
      teamId: team._id,
      senderId: session.user.id,
      status: "pending",
    });
    if (existing) return apiError("You already have a pending request for this team", 409);

    const request = await JoinRequest.create({
      teamId: team._id,
      senderId: session.user.id,
      message,
      status: "pending",
    });

    await notify({
      userId: team.ownerId,
      type: "join_request",
      message: `Someone requested to join ${team.name}`,
      relatedEntity: { kind: "request", id: request._id },
    });

    return apiOk({ id: request._id.toString() }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
