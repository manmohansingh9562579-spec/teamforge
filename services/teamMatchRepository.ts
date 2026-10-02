import { Types } from "mongoose";
import { ROLES } from "@/lib/constants";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { ROLE_SKILL_MAP, TEAM_MATCH_CONFIG } from "@/services/teamMatchConfig";
import {
  getRoleSearchVariants,
  getSkillSearchVariants,
  rankTeamMatches,
  type MatchProjectHistory,
  type TeamMatchProfile,
  type TeamMatchTarget,
} from "@/services/teamMatchService";

const candidateFields = "name username avatar headline skills preferredRoles experienceLevel availability availabilityConfirmed";
const projectFields = "ownerId members.userId projectTitle description requiredSkills techStack projectType status createdAt";

/**
 * Query only profile candidates with relevant indexed skills/roles or public project
 * text overlap, then fetch bounded, narrow project history for that candidate set.
 */
export async function loadTeamMatches(
  ownerId: string,
  target: TeamMatchTarget,
  limit: number,
  existingMemberIds: string[] = []
) {
  const queryTerms = [...new Set(`${target.projectName} ${target.description}`
    .toLowerCase()
    .match(/[a-z0-9]{3,}/g) ?? [])].slice(0, 24);
  const relatedProjectTeams = queryTerms.length
    ? await Team.find({ visibility: "public", $text: { $search: queryTerms.join(" ") } })
        .select("ownerId members.userId")
        .limit(TEAM_MATCH_CONFIG.maxProjectHistory)
        .lean()
    : [];
  const relatedUserIds = [...new Set(relatedProjectTeams.flatMap((team) => [
    team.ownerId.toString(),
    ...(team.members ?? []).map((member) => member.userId.toString()),
  ]))];

  const matchingSkills = getSkillSearchVariants([
    ...target.requiredSkills,
    ...target.requiredRoles.flatMap((role) => ROLE_SKILL_MAP[role] ?? []),
  ]);
  const matchingRoles = getRoleSearchVariants(target.requiredRoles, ROLES);
  const candidateClauses: Record<string, unknown>[] = [
    { preferredRoles: { $in: matchingRoles } },
  ];
  if (matchingSkills.length) candidateClauses.push({ skills: { $in: matchingSkills } });
  if (relatedUserIds.length) candidateClauses.push({ _id: { $in: relatedUserIds } });

  const excludedIds = [...new Set([ownerId, ...existingMemberIds])].map((id) => new Types.ObjectId(id));
  const candidateRows = await User.find({
    _id: { $nin: excludedIds },
    $or: candidateClauses,
  })
    .select(candidateFields)
    .sort({ updatedAt: -1, _id: 1 })
    .limit(TEAM_MATCH_CONFIG.maxCandidates)
    .lean();

  const candidateIds = candidateRows.map((profile) => profile._id);
  const historyTeams = candidateIds.length
    ? await Team.find({
        visibility: "public",
        $or: [{ ownerId: { $in: candidateIds } }, { "members.userId": { $in: candidateIds } }],
      })
        .select(projectFields)
        .sort({ createdAt: -1, _id: 1 })
        .limit(TEAM_MATCH_CONFIG.maxProjectHistory)
        .lean()
    : [];

  const candidateIdsByKey = new Set(candidateRows.map((profile) => profile._id.toString()));
  const projectHistoryByUser = new Map<string, MatchProjectHistory[]>();
  for (const team of historyTeams) {
    const project: MatchProjectHistory = {
      title: team.projectTitle,
      description: team.description,
      requiredSkills: team.requiredSkills ?? [],
      techStack: team.techStack ?? [],
      projectType: team.projectType,
      status: team.status,
    };
    const participantIds = new Set([
      team.ownerId.toString(),
      ...(team.members ?? []).map((member) => member.userId.toString()),
    ]);
    for (const userId of participantIds) {
      if (!candidateIdsByKey.has(userId)) continue;
      const history = projectHistoryByUser.get(userId) ?? [];
      history.push(project);
      projectHistoryByUser.set(userId, history);
    }
  }

  const profiles: TeamMatchProfile[] = candidateRows.map((profile) => {
    const projects = projectHistoryByUser.get(profile._id.toString()) ?? [];
    return {
      id: profile._id.toString(),
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      headline: profile.headline,
      skills: profile.skills ?? [],
      preferredRoles: profile.preferredRoles ?? [],
      experienceLevel: profile.experienceLevel,
      availability: profile.availabilityConfirmed ? profile.availability : undefined,
      projects,
      projectCount: projects.length,
      completedProjectCount: projects.filter((project) => project.status === "completed").length,
    };
  });

  return rankTeamMatches(profiles, target, limit);
}
