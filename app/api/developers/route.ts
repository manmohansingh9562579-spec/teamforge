import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { apiOk, handleApiError } from "@/lib/api";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();
    const skill = searchParams.get("skill");
    const role = searchParams.get("role");
    const experience = searchParams.get("experience");
    const availability = searchParams.get("availability");
    const interest = searchParams.get("interest");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const filter: Record<string, unknown> = {};
    if (q) filter.$text = { $search: q };
    if (skill) filter.skills = skill;
    if (role) filter.preferredRoles = role;
    if (experience) filter.experienceLevel = experience;
    if (availability) filter.availability = availability;
    if (interest) filter.interests = interest;

    const [developers, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .select("name username avatar headline location skills preferredRoles experienceLevel availability interests"),
      User.countDocuments(filter),
    ]);

    return apiOk({
      developers,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
