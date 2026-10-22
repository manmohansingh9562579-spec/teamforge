import type { Types } from "mongoose";

interface MembershipLike {
  userId: Types.ObjectId | string;
}

interface TeamOwnerLike {
  ownerId: Types.ObjectId | string;
}

interface TeamMembersLike extends TeamOwnerLike {
  members: MembershipLike[];
}

interface TeamVisibilityLike {
  visibility?: string;
}

export function isTeamOwner(team: TeamOwnerLike, userId: string | Types.ObjectId) {
  return team.ownerId.toString() === userId.toString();
}

export function isTeamMember(team: TeamMembersLike, userId: string | Types.ObjectId) {
  return (
    isTeamOwner(team, userId) ||
    team.members.some((m) => m.userId.toString() === userId.toString())
  );
}

export function canViewTeam(
  team: TeamMembersLike & TeamVisibilityLike,
  userId?: string | Types.ObjectId | null
) {
  return team.visibility !== "private" || (!!userId && isTeamMember(team, userId));
}

export function openPositions(team: { teamSize: number; members: unknown[] }) {
  return Math.max(0, team.teamSize - (team.members.length + 1)); // +1 for owner
}
