import { AVAILABILITY, EXPERIENCE_LEVELS, SUGGESTED_SKILLS } from "@/lib/constants";
import {
  ROLE_ALIASES,
  ROLE_SKILL_MAP,
  SKILL_ALIASES,
  TEAM_MATCH_CONFIG,
} from "@/services/teamMatchConfig";

export interface MatchProjectHistory {
  title: string;
  description?: string;
  requiredSkills?: string[];
  techStack?: string[];
  projectType?: string;
  status?: string;
}

export interface TeamMatchProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  skills: string[];
  preferredRoles: string[];
  experienceLevel?: string;
  availability?: string;
  projects: MatchProjectHistory[];
  projectCount?: number;
  completedProjectCount?: number;
}

export interface TeamMatchTarget {
  projectName: string;
  description: string;
  requiredSkills: string[];
  requiredRoles: string[];
  experienceLevel?: string;
  availability?: string;
  projectType?: string;
}

export interface TeamMatchResult {
  userId: string;
  profile: Omit<TeamMatchProfile, "id" | "projects">;
  score: number;
  skillScore: number | null;
  roleScore: number;
  projectScore: number;
  experienceScore: number | null;
  availabilityScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  matchedRoles: string[];
  recommendedRole?: string;
  relevantProjects: Array<{ title: string; projectType?: string; score: number }>;
  reason: string;
}

const STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "based", "build", "building", "create", "for", "from",
  "into", "make", "our", "powered", "project", "that", "the", "their", "this", "using", "with", "will",
]);

const availabilityRank: Record<(typeof AVAILABILITY)[number], number> = {
  "Not available": 0,
  Limited: 1,
  Available: 2,
};

const experienceRank: Record<(typeof EXPERIENCE_LEVELS)[number], number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

function normalizedKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeSkill(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const key = normalizedKey(trimmed);
  return SKILL_ALIASES[key] ?? SUGGESTED_SKILLS.find((skill) => normalizedKey(skill) === key) ?? trimmed;
}

export function normalizeRole(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return ROLE_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

export function getSkillSearchVariants(skills: string[]) {
  const requiredKeys = new Set(skills.map((skill) => normalizedKey(normalizeSkill(skill))));
  const variants = new Set<string>();
  const addVariants = (value: string) => {
    variants.add(value);
    variants.add(value.toLowerCase());
    variants.add(value.toUpperCase());
  };
  for (const skill of skills) {
    const canonical = normalizeSkill(skill);
    addVariants(canonical);
  }
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (requiredKeys.has(normalizedKey(canonical))) {
      addVariants(alias);
    }
  }
  return [...variants];
}

export function getRoleSearchVariants(roles: string[], knownRoles: readonly string[]) {
  const requiredKeys = new Set(roles.map((role) => normalizedKey(normalizeRole(role))));
  return [...new Set([
    ...roles,
    ...knownRoles.filter((role) => requiredKeys.has(normalizedKey(normalizeRole(role)))),
  ])];
}

function uniqueSkills(values: string[]) {
  const seen = new Set<string>();
  return values.reduce<string[]>((result, raw) => {
    const skill = normalizeSkill(raw);
    const key = normalizedKey(skill);
    if (skill && !seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
    return result;
  }, []);
}

function tokenize(value: string) {
  return (value.toLowerCase().match(/[a-z0-9]+(?:[.+#][a-z0-9+#.]*)*/g) ?? [])
    .map(normalizedKey)
    .filter(Boolean);
}

export function extractSkillsFromText(text: string): string[] {
  const words = tokenize(text);
  const patterns = new Map<string, Array<{ words: string[]; skill: string }>>();
  const aliases = [...Object.entries(SKILL_ALIASES), ...SUGGESTED_SKILLS.map((skill) => [skill, skill] as const)];

  for (const [alias, canonical] of aliases) {
    const key = normalizedKey(canonical);
    const patternWords = tokenize(alias);
    if (!patternWords.length) continue;
    const entries = patterns.get(key) ?? [];
    if (!entries.some((entry) => entry.words.join(" ") === patternWords.join(" "))) {
      entries.push({ words: patternWords, skill: canonical });
      patterns.set(key, entries);
    }
  }

  const found: string[] = [];
  for (const entries of patterns.values()) {
    if (entries.some(({ words: pattern }) => {
      return words.some((_, index) => pattern.every((word, offset) => words[index + offset] === word));
    })) {
      found.push(entries[0].skill);
    }
  }
  return uniqueSkills(found);
}

export function extractTeamRequirements(input: {
  projectName: string;
  description: string;
  requiredSkills: string[];
  requiredRoles: string[];
}): { skills: string[]; roles: string[] } {
  return {
    skills: uniqueSkills([
      ...input.requiredSkills,
      ...extractSkillsFromText(`${input.projectName} ${input.description}`),
    ]),
    roles: [...new Set(input.requiredRoles.map(normalizeRole).filter(Boolean))],
  };
}

export function matchSkills(profileSkills: string[], requiredSkills: string[]) {
  const required = uniqueSkills(requiredSkills);
  const available = new Set(profileSkills.map((skill) => normalizedKey(normalizeSkill(skill))));
  const matched = required.filter((skill) => available.has(normalizedKey(skill)));
  const missing = required.filter((skill) => !available.has(normalizedKey(skill)));
  return {
    score: required.length ? Math.round((matched.length / required.length) * 100) : null,
    matched,
    missing,
  };
}

export function scoreRoleMatch(
  profileSkills: string[],
  profileRoles: string[],
  requiredRoles: string[]
) {
  const roles = [...new Set(requiredRoles.map(normalizeRole))];
  if (!roles.length) return { score: null, matchedRoles: [] as string[], recommendedRole: undefined as string | undefined };

  const skills = new Set(profileSkills.map((skill) => normalizedKey(normalizeSkill(skill))));
  const preferred = new Set(profileRoles.map((role) => normalizedKey(normalizeRole(role))));
  const perRole = roles.map((role) => {
    if (preferred.has(normalizedKey(role))) return { role, score: 100, direct: true };
    const mappedSkills = ROLE_SKILL_MAP[role] ?? [];
    const score = mappedSkills.length
      ? Math.round((mappedSkills.filter((skill) => skills.has(normalizedKey(normalizeSkill(skill)))).length / mappedSkills.length) * 100)
      : 0;
    return { role, score, direct: false };
  });
  const matchedRoles = perRole.filter((item) => item.score > 0).map((item) => item.role);
  const best = [...perRole].sort((a, b) => b.score - a.score || (a.role < b.role ? -1 : 1))[0];
  return {
    score: Math.round(perRole.reduce((sum, item) => sum + item.score, 0) / perRole.length),
    matchedRoles,
    recommendedRole: best.score > 0 ? best.role : undefined,
  };
}

function projectTextTerms(project: MatchProjectHistory) {
  return new Set(tokenize(`${project.title} ${project.description ?? ""}`).filter((word) => word.length > 2 && !STOP_WORDS.has(word)));
}

function scoreSingleProject(target: TeamMatchTarget, project: MatchProjectHistory) {
  const targetTerms = new Set(tokenize(`${target.projectName} ${target.description}`).filter((word) => word.length > 2 && !STOP_WORDS.has(word)));
  const projectTerms = projectTextTerms(project);
  const keywordCoverage = targetTerms.size
    ? [...targetTerms].filter((term) => projectTerms.has(term)).length / targetTerms.size
    : 0;

  const requiredSkills = uniqueSkills(target.requiredSkills);
  const projectSkills = uniqueSkills([
    ...(project.requiredSkills ?? []),
    ...(project.techStack ?? []),
    ...extractSkillsFromText(`${project.title} ${project.description ?? ""}`),
  ]);
  const projectSkillKeys = new Set(projectSkills.map(normalizedKey));
  const skillCoverage = requiredSkills.length
    ? requiredSkills.filter((skill) => projectSkillKeys.has(normalizedKey(skill))).length / requiredSkills.length
    : 0;
  const categoryMatch = target.projectType && project.projectType?.toLowerCase() === target.projectType.toLowerCase() ? 1 : 0;

  const components: Array<{ score: number; weight: number }> = [
    { score: keywordCoverage, weight: 0.65 },
    ...(requiredSkills.length ? [{ score: skillCoverage, weight: 0.25 }] : []),
    ...(target.projectType ? [{ score: categoryMatch, weight: 0.10 }] : []),
  ];
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  const score = totalWeight ? components.reduce((sum, component) => sum + component.score * component.weight, 0) / totalWeight : 0;
  return Math.round(score * 100);
}

export function scoreProjectRelevance(target: TeamMatchTarget, projects: MatchProjectHistory[]) {
  const relevantProjects = projects
    .map((project) => ({ title: project.title, projectType: project.projectType, score: scoreSingleProject(target, project) }))
    .filter((project) => project.score > 0)
    .sort((a, b) => b.score - a.score || (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))
    .slice(0, 3);
  return {
    score: relevantProjects[0]?.score ?? 0,
    relevantProjects,
  };
}

export function scoreExperience(
  experienceLevel: string | undefined,
  projectCount: number,
  completedProjectCount: number,
  requiredLevel?: string
): number | null {
  const rank = EXPERIENCE_LEVELS.indexOf(experienceLevel as (typeof EXPERIENCE_LEVELS)[number]);
  const requiredRank = EXPERIENCE_LEVELS.indexOf(requiredLevel as (typeof EXPERIENCE_LEVELS)[number]);
  let levelScore: number | undefined;

  if (rank >= 0) {
    if (requiredRank >= 0) {
      const gap = requiredRank - rank;
      levelScore = gap <= 0 ? 100 : gap === 1 ? 50 : 0;
    } else {
      levelScore = Math.round(((rank + 1) / EXPERIENCE_LEVELS.length) * 100);
    }
  }

  const hasProjectHistory = projectCount > 0;
  const historyScore = hasProjectHistory
    ? Math.min(100, Math.max(0, projectCount - completedProjectCount) * 20 + completedProjectCount * 50)
    : undefined;
  if (levelScore === undefined && historyScore === undefined) return null;

  const levelWeight = levelScore === undefined ? 0 : 0.7;
  const historyWeight = historyScore === undefined ? 0 : 0.3;
  const totalWeight = levelWeight + historyWeight;
  return Math.round(((levelScore ?? 0) * levelWeight + (historyScore ?? 0) * historyWeight) / totalWeight);
}

export function scoreAvailability(profileAvailability?: string, requiredAvailability?: string): number | null {
  if (!profileAvailability || !Object.prototype.hasOwnProperty.call(availabilityRank, profileAvailability)) return null;
  const candidateRank = availabilityRank[profileAvailability as keyof typeof availabilityRank];
  if (requiredAvailability === "Available") {
    return candidateRank === 2 ? 100 : candidateRank === 1 ? 50 : 0;
  }
  if (requiredAvailability === "Limited") return candidateRank >= 1 ? 100 : 0;
  return Math.round((candidateRank / 2) * 100);
}

function calculateFinalScore(scores: {
  skill: number | null;
  role: number | null;
  project: number;
  experience: number | null;
  availability: number | null;
}) {
  const components: Array<{ score: number | null; weight: number }> = [
    { score: scores.skill, weight: TEAM_MATCH_CONFIG.weights.skill },
    { score: scores.role, weight: TEAM_MATCH_CONFIG.weights.role },
    { score: scores.project, weight: TEAM_MATCH_CONFIG.weights.project },
    { score: scores.experience, weight: TEAM_MATCH_CONFIG.weights.experience },
    { score: scores.availability, weight: TEAM_MATCH_CONFIG.weights.availability },
  ];
  const availableComponents = components
    .filter((item) => item.score !== null)
    .map((item) => ({ score: item.score as number, weight: item.weight }));
  const totalWeight = availableComponents.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  return Math.min(100, Math.max(0, Math.round(availableComponents.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight)));
}

export function explainTeamMatch(result: Pick<TeamMatchResult, "skillScore" | "roleScore" | "projectScore" | "experienceScore" | "availabilityScore" | "matchedSkills" | "relevantProjects" | "matchedRoles" | "profile">, target: TeamMatchTarget) {
  const parts: string[] = [];
  if (target.requiredSkills.length) {
    parts.push(`${(result.skillScore ?? 0) >= 80 ? "Strong skill match" : "Matches"}: ${result.matchedSkills.length} of ${target.requiredSkills.length} required skills.`);
  }
  if (result.roleScore >= 80 && result.matchedRoles.length) {
    parts.push(`Profile closely matches ${result.matchedRoles[0]}.`);
  }
  if (result.projectScore >= 70) {
    parts.push("Previous projects overlap with these requirements.");
  } else if (result.relevantProjects.length) {
    parts.push(`Has ${result.relevantProjects.length} related TeamForge project${result.relevantProjects.length === 1 ? "" : "s"}.`);
  }
  if (result.experienceScore !== null && target.experienceLevel && result.experienceScore >= 70) {
    parts.push(`Meets the ${target.experienceLevel.toLowerCase()} experience requirement.`);
  }
  if (result.availabilityScore !== null && target.availability && result.availabilityScore >= 70) {
    parts.push(`Availability meets the selected ${target.availability.toLowerCase()} minimum.`);
  } else if (result.availabilityScore !== null && !target.availability) {
    parts.push(result.availabilityScore === 100 ? "Profile is marked available." : result.availabilityScore === 50 ? "Profile is marked as having limited availability." : "Profile is marked as unavailable.");
  }
  return parts.join(" ") || "Profile details match some of your project requirements.";
}

export function calculateTeamMatch(profile: TeamMatchProfile, target: TeamMatchTarget): TeamMatchResult {
  const skills = matchSkills(profile.skills, target.requiredSkills);
  const roles = scoreRoleMatch(profile.skills, profile.preferredRoles, target.requiredRoles);
  const project = scoreProjectRelevance(target, profile.projects);
  const experience = scoreExperience(
    profile.experienceLevel,
    profile.projectCount ?? profile.projects.length,
    profile.completedProjectCount ?? profile.projects.filter((item) => item.status === "completed").length,
    target.experienceLevel
  );
  const availability = scoreAvailability(profile.availability, target.availability);

  const partial = {
    skillScore: skills.score,
    roleScore: roles.score ?? 0,
    projectScore: project.score,
    experienceScore: experience,
    availabilityScore: availability,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    matchedRoles: roles.matchedRoles,
    relevantProjects: project.relevantProjects,
  };
  const result: TeamMatchResult = {
    userId: profile.id,
    profile: {
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      headline: profile.headline,
      skills: uniqueSkills(profile.skills),
      preferredRoles: [...profile.preferredRoles],
      experienceLevel: profile.experienceLevel,
      availability: profile.availability,
    },
    ...partial,
    score: calculateFinalScore({
      skill: skills.score,
      role: roles.score,
      project: project.score,
      experience,
      availability,
    }),
    recommendedRole: roles.recommendedRole,
    reason: "",
  };
  result.reason = explainTeamMatch(result, target);
  return result;
}

export function rankTeamMatches(profiles: TeamMatchProfile[], target: TeamMatchTarget, limit: number = TEAM_MATCH_CONFIG.defaultResultLimit) {
  return profiles
    .map((profile) => calculateTeamMatch(profile, target))
    .sort((a, b) =>
      b.score - a.score ||
      (b.skillScore ?? 0) - (a.skillScore ?? 0) ||
      b.roleScore - a.roleScore ||
      b.projectScore - a.projectScore ||
      (a.profile.username < b.profile.username ? -1 : a.profile.username > b.profile.username ? 1 : 0) ||
      (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0)
    )
    .slice(0, limit);
}
