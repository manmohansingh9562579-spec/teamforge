/**
 * TeamForge matching service.
 *
 * This is a transparent, deterministic scoring function — not AI, not machine
 * learning, and not a claim about a person's real-world quality. It compares
 * structured profile data against a team's stated requirements and produces
 * a 0–100 compatibility score plus the concrete reasons behind it.
 *
 * Weighting:
 *   Skill compatibility:     45%
 *   Role compatibility:      25%
 *   Interest compatibility:  15%
 *   Availability:            15%
 */

export interface MatchProfile {
  skills: string[];
  preferredRoles: string[];
  interests: string[];
  availability?: string;
}

export interface MatchTarget {
  requiredSkills: string[];
  requiredRoles: string[];
  interests?: string[]; // a team can optionally tag itself with relevant interests
}

export interface MatchResult {
  score: number; // 0–100
  breakdown: {
    skill: number;
    role: number;
    interest: number;
    availability: number | null;
  };
  reasons: string[];
}

import { EXISTING_TEAM_COMPATIBILITY_WEIGHTS } from "@/services/teamMatchConfig";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function overlapRatio(a: string[], b: string[]): { ratio: number; matched: string[] } {
  if (b.length === 0) return { ratio: 1, matched: [] }; // nothing required => full marks
  const setA = new Set(a.map(normalize));
  const matched = b.filter((item) => setA.has(normalize(item)));
  return { ratio: matched.length / b.length, matched };
}

export function calculateMatch(profile: MatchProfile, target: MatchTarget): MatchResult {
  const skillMatch = overlapRatio(profile.skills, target.requiredSkills);
  const roleMatch = overlapRatio(profile.preferredRoles, target.requiredRoles);
  const interestMatch = target.interests
    ? overlapRatio(profile.interests, target.interests)
    : { ratio: profile.interests.length > 0 ? 1 : 0.5, matched: [] };

  const availabilityScore = profile.availability === "Available"
    ? 1
    : profile.availability === "Limited"
    ? 0.5
    : profile.availability === "Not available"
    ? 0
    : null;

  const skillScore = skillMatch.ratio * EXISTING_TEAM_COMPATIBILITY_WEIGHTS.skill;
  const roleScore = roleMatch.ratio * EXISTING_TEAM_COMPATIBILITY_WEIGHTS.role;
  const interestScore = interestMatch.ratio * EXISTING_TEAM_COMPATIBILITY_WEIGHTS.interest;
  const availabilityWeighted = availabilityScore === null
    ? 0
    : availabilityScore * EXISTING_TEAM_COMPATIBILITY_WEIGHTS.availability;

  const availableWeight =
    EXISTING_TEAM_COMPATIBILITY_WEIGHTS.skill +
    EXISTING_TEAM_COMPATIBILITY_WEIGHTS.role +
    EXISTING_TEAM_COMPATIBILITY_WEIGHTS.interest +
    (availabilityScore === null ? 0 : EXISTING_TEAM_COMPATIBILITY_WEIGHTS.availability);
  const total = (skillScore + roleScore + interestScore + availabilityWeighted) / availableWeight;
  const score = Math.round(total * 100);

  const reasons: string[] = [];
  if (skillMatch.matched.length > 0) {
    reasons.push(
      `Matches ${skillMatch.matched.length} of ${target.requiredSkills.length} required skill${
        target.requiredSkills.length === 1 ? "" : "s"
      }`
    );
  }
  if (roleMatch.matched.length > 0) {
    reasons.push(`${roleMatch.matched.join(", ")} role requested`);
  }
  if (interestMatch.matched.length > 0) {
    reasons.push(`Interested in ${interestMatch.matched.join(", ").toLowerCase()}`);
  }
  if (profile.availability === "Available") {
    reasons.push("Available for project work");
  } else if (profile.availability === "Limited") {
    reasons.push("Limited availability");
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      skill: Math.round(skillMatch.ratio * 100),
      role: Math.round(roleMatch.ratio * 100),
      interest: Math.round(interestMatch.ratio * 100),
      availability: availabilityScore === null ? null : Math.round(availabilityScore * 100),
    },
    reasons,
  };
}

/**
 * Ranks a list of developer profiles against a single team target,
 * highest compatibility first. Ties broken by skill score.
 */
export function rankProfilesForTeam<T extends MatchProfile>(
  profiles: T[],
  target: MatchTarget
): Array<{ profile: T; match: MatchResult }> {
  return profiles
    .map((profile) => ({ profile, match: calculateMatch(profile, target) }))
    .sort((a, b) => b.match.score - a.match.score || b.match.breakdown.skill - a.match.breakdown.skill);
}
