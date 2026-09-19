import { describe, it, expect } from "vitest";
import { calculateProfileCompletion } from "@/services/profileService";

function baseUser() {
  return {
    headline: "",
    bio: "",
    skills: [] as string[],
    preferredRoles: [] as string[],
    experienceLevel: undefined as string | undefined,
    interests: [] as string[],
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    college: "",
    location: "",
  };
}

describe("calculateProfileCompletion", () => {
  it("returns 0 for a completely empty profile", () => {
    expect(calculateProfileCompletion(baseUser() as any)).toBe(0);
  });

  it("returns 100 for a fully filled-out profile", () => {
    const user = {
      ...baseUser(),
      headline: "Frontend dev",
      bio: "I build things",
      skills: ["React"],
      preferredRoles: ["Frontend Developer"],
      experienceLevel: "Intermediate",
      interests: ["Hackathons"],
      githubUrl: "https://github.com/example",
      college: "MIT",
    };
    expect(calculateProfileCompletion(user as any)).toBe(100);
  });

  it("only counts one of github/linkedin/portfolio as a single check", () => {
    const withOne = { ...baseUser(), githubUrl: "https://github.com/example" };
    const withAllThree = {
      ...baseUser(),
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      portfolioUrl: "https://example.com",
    };
    expect(calculateProfileCompletion(withOne as any)).toBe(
      calculateProfileCompletion(withAllThree as any)
    );
  });

  it("increases monotonically as fields are filled in", () => {
    const empty = calculateProfileCompletion(baseUser() as any);
    const partial = calculateProfileCompletion({
      ...baseUser(),
      headline: "Something",
      skills: ["React"],
    } as any);
    expect(partial).toBeGreaterThan(empty);
  });

  it("never exceeds 100 regardless of extra data", () => {
    const user = {
      ...baseUser(),
      headline: "A",
      bio: "B",
      skills: ["A", "B", "C"],
      preferredRoles: ["Frontend Developer", "Backend Developer"],
      experienceLevel: "Advanced",
      interests: ["Hackathons", "Open Source"],
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      portfolioUrl: "https://example.com",
      college: "MIT",
      location: "Boston",
    };
    expect(calculateProfileCompletion(user as any)).toBe(100);
  });
});
