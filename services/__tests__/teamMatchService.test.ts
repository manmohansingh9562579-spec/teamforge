import { describe, expect, it } from "vitest";
import {
  calculateTeamMatch,
  extractSkillsFromText,
  extractTeamRequirements,
  matchSkills,
  normalizeRole,
  normalizeSkill,
  rankTeamMatches,
  scoreAvailability,
  scoreExperience,
  scoreProjectRelevance,
  scoreRoleMatch,
  type TeamMatchProfile,
  type TeamMatchTarget,
} from "@/services/teamMatchService";
import { teamMatchSchema } from "@/validations/teamMatch";

const baseTarget: TeamMatchTarget = {
  projectName: "CivicPulse",
  description: "AI powered civic issue reporting platform",
  requiredSkills: ["Python", "React"],
  requiredRoles: ["Backend Developer"],
};

function profile(overrides: Partial<TeamMatchProfile> = {}): TeamMatchProfile {
  return {
    id: "user-1",
    name: "Alex Rivera",
    username: "alex",
    skills: ["Python", "React", "Node.js"],
    preferredRoles: ["Backend Developer"],
    experienceLevel: "Intermediate",
    availability: "Available",
    projects: [],
    ...overrides,
  };
}

describe("TeamForge Match skill normalization and extraction", () => {
  it.each([
    ["JS", "JavaScript"],
    ["ReactJS", "React"],
    ["Node", "Node.js"],
    ["ML", "Machine Learning"],
    ["Mongo", "MongoDB"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeSkill(input)).toBe(expected);
  });

  it("extracts centralized aliases from project text", () => {
    expect(extractSkillsFromText("ReactJS with Node, ML and MongoDB; also plain JavaScript"))
      .toEqual(expect.arrayContaining(["React", "Node.js", "Machine Learning", "MongoDB", "JavaScript"]));
  });

  it("combines selected skills with skills extracted from the description without duplicates", () => {
    expect(extractTeamRequirements({
      projectName: "CivicPulse",
      description: "A platform using ReactJS and Mongo for civic alerts",
      requiredSkills: ["react", "ML"],
      requiredRoles: ["ML Developer", "Backend Developer"],
    })).toEqual({
      skills: ["React", "Machine Learning", "MongoDB"],
      roles: ["ML Engineer", "Backend Developer"],
    });
  });

  it("calculates normalized skill overlap and missing skills", () => {
    expect(matchSkills(["Python", "ReactJS", "Node"], ["Python", "React", "Node.js", "MongoDB", "ML"])).toEqual({
      score: 60,
      matched: ["Python", "React", "Node.js"],
      missing: ["MongoDB", "Machine Learning"],
    });
  });
});

describe("TeamForge Match role and project scoring", () => {
  it("normalizes legacy role labels and scores role skill mappings", () => {
    expect(normalizeRole("ML Developer")).toBe("ML Engineer");
    expect(scoreRoleMatch(["Python", "Machine Learning"], [], ["ML Engineer"]).score).toBe(50);
    expect(scoreRoleMatch([], ["Backend Developer"], ["Backend Developer"]).score).toBe(100);
  });

  it("rewards related public project history using text, skills and project type", () => {
    const target = { ...baseTarget, projectType: "Hackathon" };
    const result = scoreProjectRelevance(target, [
      {
        title: "CivicPulse Issue Tracker",
        description: "A civic issue reporting platform built with Python and React",
        requiredSkills: ["Python", "React"],
        projectType: "Hackathon",
      },
      { title: "Recipe Notes", description: "A personal cooking journal" },
    ]);

    expect(result.score).toBe(100);
    expect(result.relevantProjects).toEqual([
      expect.objectContaining({ title: "CivicPulse Issue Tracker", score: 100 }),
    ]);
  });

  it("gives some relevance to semantically related words shared by project descriptions", () => {
    const target = {
      projectName: "Phishing Detection",
      description: "An email security platform using machine learning",
      requiredSkills: ["Python", "Machine Learning"],
      requiredRoles: ["ML Engineer"],
    };
    const result = scoreProjectRelevance(target, [{
      title: "Email Spam Detection",
      description: "A spam filter built with Python and ML",
      techStack: ["Python", "ML"],
    }]);

    expect(result.score).toBeGreaterThan(0);
    expect(result.relevantProjects[0].title).toBe("Email Spam Detection");
  });
});

describe("experience and availability scoring", () => {
  it("scores experience level against a requested minimum and uses available project history", () => {
    expect(scoreExperience("Intermediate", 3, 2, "Intermediate")).toBe(100);
    expect(scoreExperience("Beginner", 0, 0, "Advanced")).toBe(0);
    expect(scoreExperience(undefined, 0, 0, "Advanced")).toBeNull();
    expect(scoreExperience(undefined, 2, 1)).toBe(70);
  });

  it("scores availability against the requested minimum without assuming missing data", () => {
    expect(scoreAvailability("Available", "Limited")).toBe(100);
    expect(scoreAvailability("Limited", "Available")).toBe(50);
    expect(scoreAvailability("Not available", "Available")).toBe(0);
    expect(scoreAvailability(undefined, "Available")).toBeNull();
  });
});

describe("final score and ranking", () => {
  it("returns a stable weighted score and transparent match details", () => {
    const candidate = profile({
      projects: [{
        title: "CivicPulse Issue Tracker",
        description: "A civic issue reporting platform built with Python and React",
        requiredSkills: ["Python", "React"],
      }],
      projectCount: 1,
      completedProjectCount: 1,
    });
    const first = calculateTeamMatch(candidate, baseTarget);
    const second = calculateTeamMatch(candidate, baseTarget);

    expect(first.score).toBe(96);
    expect(first).toEqual(second);
    expect(first.matchedSkills).toEqual(["Python", "React"]);
    expect(first.reason).toContain("2 of 2 required skills");
    expect(first.relevantProjects[0].title).toBe("CivicPulse Issue Tracker");
  });

  it("renormalizes the configured weights when a profile has no experience or availability data", () => {
    const result = calculateTeamMatch(profile({
      experienceLevel: undefined,
      availability: undefined,
      projects: [],
    }), baseTarget);
    expect(result.experienceScore).toBeNull();
    expect(result.availabilityScore).toBeNull();
    expect(result.score).toBe(81);
  });

  it("ranks by score with deterministic username tie-breaking and handles no candidates", () => {
    const ranked = rankTeamMatches([
      profile({ id: "b", username: "zara", skills: ["Python", "React"] }),
      profile({ id: "a", username: "alex", skills: ["Python", "React"] }),
    ], baseTarget);
    expect(ranked.map((result) => result.profile.username)).toEqual(["alex", "zara"]);
    expect(rankTeamMatches([], baseTarget)).toEqual([]);
  });
});

describe("team match request validation", () => {
  it("accepts the form requirements and normalizes optional matching filters", () => {
    const result = teamMatchSchema.parse({
      projectName: "CivicPulse",
      description: "A civic issue reporting platform for local communities.",
      requiredSkills: ["React", " React "],
      requiredRoles: ["Frontend Developer"],
      teamSize: "4",
      experienceLevel: "",
      availability: "",
      projectType: "",
    });
    expect(result.requiredSkills).toEqual(["React"]);
    expect(result.teamSize).toBe(4);
    expect(result.experienceLevel).toBeUndefined();
    expect(result.availability).toBeUndefined();
    expect(result.projectType).toBeUndefined();
  });

  it("rejects malformed project data, unsupported roles and invalid team sizes", () => {
    expect(teamMatchSchema.safeParse({
      projectName: "x",
      description: "too short",
      requiredRoles: ["Astronaut"],
      teamSize: 1,
    }).success).toBe(false);
  });
});
