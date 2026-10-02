import { describe, it, expect } from "vitest";
import { calculateMatch, rankProfilesForTeam } from "@/services/matchingService";

describe("calculateMatch", () => {
  it("returns 100 for a perfect match with full availability", () => {
    const result = calculateMatch(
      {
        skills: ["React", "Node.js", "MongoDB"],
        preferredRoles: ["Frontend Developer"],
        interests: ["Hackathons"],
        availability: "Available",
      },
      {
        requiredSkills: ["React", "Node.js", "MongoDB"],
        requiredRoles: ["Frontend Developer"],
        interests: ["Hackathons"],
      }
    );

    expect(result.score).toBe(100);
    expect(result.breakdown.skill).toBe(100);
    expect(result.breakdown.role).toBe(100);
  });

  it("returns 0 for no overlap at all and unavailable status", () => {
    const result = calculateMatch(
      {
        skills: ["Figma"],
        preferredRoles: ["UI/UX Designer"],
        interests: [],
        availability: "Not available",
      },
      {
        requiredSkills: ["React", "Node.js"],
        requiredRoles: ["Backend Developer"],
        interests: ["Hackathons"],
      }
    );

    expect(result.score).toBe(0);
    expect(result.breakdown.skill).toBe(0);
    expect(result.breakdown.availability).toBe(0);
  });

  it("is case-insensitive when comparing skills", () => {
    const result = calculateMatch(
      { skills: ["react", "MONGODB"], preferredRoles: [], interests: [], availability: "Available" },
      { requiredSkills: ["React", "MongoDB"], requiredRoles: [] }
    );
    expect(result.breakdown.skill).toBe(100);
  });

  it("weights skills at 45%, roles at 25%, interests at 15%, availability at 15%", () => {
    // Only skills match fully, nothing else.
    const result = calculateMatch(
      { skills: ["React"], preferredRoles: [], interests: [], availability: "Not available" },
      { requiredSkills: ["React"], requiredRoles: ["Backend Developer"], interests: ["Hackathons"] }
    );
    // 45% skill + 0% role + 0% interest + 0% availability = 45
    expect(result.score).toBe(45);
  });

  it("gives partial credit for limited availability", () => {
    const result = calculateMatch(
      { skills: [], preferredRoles: [], interests: [], availability: "Limited" },
      { requiredSkills: [], requiredRoles: [] }
    );
    // No required skills/roles => full marks on those; interests neutral (0.5 since none set);
    // availability limited => 0.5 * 15% = 7.5, rounds within score.
    expect(result.breakdown.availability).toBe(50);
  });

  it("never returns a score outside 0-100", () => {
    const result = calculateMatch(
      { skills: [], preferredRoles: [], interests: [], availability: undefined },
      { requiredSkills: [], requiredRoles: [] }
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("produces human-readable reasons for a partial match", () => {
    const result = calculateMatch(
      {
        skills: ["React", "TypeScript"],
        preferredRoles: ["Frontend Developer"],
        interests: ["Open Source"],
        availability: "Available",
      },
      {
        requiredSkills: ["React", "TypeScript", "GraphQL"],
        requiredRoles: ["Frontend Developer", "Backend Developer"],
        interests: ["Open Source"],
      }
    );

    expect(result.reasons.some((r) => r.includes("2 of 3 required skills"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("Frontend Developer"))).toBe(true);
    expect(result.reasons.some((r) => r.toLowerCase().includes("open source"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("Available for project work"))).toBe(true);
  });
});

describe("rankProfilesForTeam", () => {
  it("sorts profiles by descending compatibility score", () => {
    const target = { requiredSkills: ["React", "Node.js"], requiredRoles: ["Full Stack Developer"] };
    const profiles = [
      { id: "low", skills: [], preferredRoles: [], interests: [], availability: "Not available" },
      {
        id: "high",
        skills: ["React", "Node.js"],
        preferredRoles: ["Full Stack Developer"],
        interests: [],
        availability: "Available",
      },
      { id: "mid", skills: ["React"], preferredRoles: [], interests: [], availability: "Limited" },
    ];

    const ranked = rankProfilesForTeam(profiles, target);
    expect(ranked.map((r) => (r.profile as any).id)).toEqual(["high", "mid", "low"]);
  });
});
