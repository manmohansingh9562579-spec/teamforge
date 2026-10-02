import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { Activity } from "@/models/Activity";
import { JoinRequest } from "@/models/Request";
import { Team } from "@/models/Team";
import { generateUniqueSlug, isTeamOwner, openPositions } from "@/services/teamService";
import { TEAM_MATCH_CONFIG } from "@/services/teamMatchConfig";
import { extractTeamRequirements, type TeamMatchTarget } from "@/services/teamMatchService";
import { loadTeamMatches } from "@/services/teamMatchRepository";
import { teamMatchSchema } from "@/validations/teamMatch";

export const dynamic = "force-dynamic";

function targetFromInput(input: {
  projectName: string;
  description: string;
  requiredSkills: string[];
  requiredRoles: string[];
  experienceLevel?: string;
  availability?: string;
  projectType?: string;
}, requirements: { skills: string[]; roles: string[] }): TeamMatchTarget {
  return {
    projectName: input.projectName,
    description: input.description,
    requiredSkills: requirements.skills,
    requiredRoles: requirements.roles,
    experienceLevel: input.experienceLevel || undefined,
    availability: input.availability || undefined,
    projectType: input.projectType || undefined,
  };
}

async function addInvitationState(teamId: Types.ObjectId, matches: Awaited<ReturnType<typeof loadTeamMatches>>) {
  const pendingInvitations = await JoinRequest.find({ teamId, kind: "invitation", status: "pending" })
    .select("senderId")
    .lean();
  const invitedIds = new Set(pendingInvitations.map((request) => request.senderId.toString()));
  return matches.map((match) => ({
    ...match,
    invitationStatus: invitedIds.has(match.userId) ? "pending" as const : undefined,
  }));
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const input = teamMatchSchema.parse(await req.json());
    await connectDB();

    const requirements = extractTeamRequirements(input);
    const target = targetFromInput(input, requirements);
    const matches = await loadTeamMatches(
      session.user.id,
      target,
      input.resultLimit ?? TEAM_MATCH_CONFIG.defaultResultLimit
    );

    const teamName = input.projectName;
    const team = await Team.create({
      name: teamName,
      slug: await generateUniqueSlug(teamName),
      projectTitle: input.projectName,
      description: input.description,
      ownerId: session.user.id,
      members: [],
      requiredRoles: requirements.roles,
      requiredSkills: requirements.skills,
      techStack: requirements.skills,
      teamSize: input.teamSize,
      projectType: input.projectType || "Side Project",
      matchingPreferences: {
        experienceLevel: input.experienceLevel || undefined,
        availability: input.availability || undefined,
        projectType: input.projectType || undefined,
      },
      status: "forming",
      visibility: "private",
    });

    await Activity.create({
      teamId: team._id,
      actorId: session.user.id,
      action: "created a private team with TeamForge Match",
      entityType: "team",
      entityId: team._id,
    });

    return apiOk({
      requirements,
      team: {
        id: team._id.toString(),
        name: team.name,
        projectTitle: team.projectTitle,
        slug: team.slug,
        teamSize: team.teamSize,
        remainingSlots: openPositions(team),
      },
      matches,
      resultLimit: input.resultLimit ?? TEAM_MATCH_CONFIG.defaultResultLimit,
      matchingConfig: { weights: TEAM_MATCH_CONFIG.weights },
    }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const teamId = new URL(req.url).searchParams.get("teamId");
    if (!teamId || !/^[a-f\d]{24}$/i.test(teamId)) return apiError("Invalid team ID", 400);

    await connectDB();
    const team = await Team.findById(teamId);
    if (!team) return apiError("Team not found", 404);
    if (!isTeamOwner(team, session.user.id)) return apiError("Forbidden", 403);
    if (team.status === "closed" || team.status === "completed") {
      return apiError("This team is not accepting invitations", 400);
    }

    const requirements = extractTeamRequirements({
      projectName: team.projectTitle,
      description: team.description,
      requiredSkills: team.requiredSkills,
      requiredRoles: team.requiredRoles,
    });
    const target: TeamMatchTarget = {
      projectName: team.projectTitle,
      description: team.description,
      requiredSkills: requirements.skills,
      requiredRoles: requirements.roles,
      experienceLevel: team.matchingPreferences?.experienceLevel,
      availability: team.matchingPreferences?.availability,
      projectType: team.matchingPreferences?.projectType,
    };
    const matches = await loadTeamMatches(
      session.user.id,
      target,
      TEAM_MATCH_CONFIG.defaultResultLimit,
      team.members.map((member) => member.userId.toString())
    );
    const [matchesWithInvitationStatus, pendingCount] = await Promise.all([
      addInvitationState(team._id, matches),
      JoinRequest.countDocuments({ teamId: team._id, status: "pending" }),
    ]);

    return apiOk({
      requirements,
      team: {
        id: team._id.toString(),
        name: team.name,
        projectTitle: team.projectTitle,
        slug: team.slug,
        teamSize: team.teamSize,
        remainingSlots: Math.max(0, openPositions(team) - pendingCount),
      },
      matches: matchesWithInvitationStatus,
      resultLimit: TEAM_MATCH_CONFIG.defaultResultLimit,
      matchingConfig: { weights: TEAM_MATCH_CONFIG.weights },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
