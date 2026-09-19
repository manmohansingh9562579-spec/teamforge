import { connectDB } from "@/lib/db";
import { Team } from "@/models/Team";
import { Activity } from "@/models/Activity";
import { getCurrentSession } from "@/lib/session";
import { createTeamSchema } from "@/validations/team";
import { generateUniqueSlug } from "@/services/teamService";
import { apiOk, apiError, handleApiError } from "@/lib/api";

const PAGE_SIZE = 12;

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const body = await req.json();
    const data = createTeamSchema.parse(body);

    await connectDB();
    const slug = await generateUniqueSlug(data.name);

    const team = await Team.create({
      ...data,
      slug,
      ownerId: session.user.id,
      members: [],
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    await Activity.create({
      teamId: team._id,
      actorId: session.user.id,
      action: "created the team",
      entityType: "team",
      entityId: team._id,
    });

    return apiOk({ slug: team.slug }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const skill = searchParams.get("skill");
    const role = searchParams.get("role");
    const projectType = searchParams.get("projectType");
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const filter: Record<string, unknown> = { visibility: "public" };
    if (q) filter.$text = { $search: q };
    if (skill) filter.requiredSkills = skill;
    if (role) filter.requiredRoles = role;
    if (projectType) filter.projectType = projectType;
    filter.status = status ?? { $ne: "closed" };

    const [teams, total] = await Promise.all([
      Team.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .select("name slug projectTitle description requiredRoles requiredSkills techStack teamSize members projectType deadline status"),
      Team.countDocuments(filter),
    ]);

    return apiOk({ teams, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (err) {
    return handleApiError(err);
  }
}
