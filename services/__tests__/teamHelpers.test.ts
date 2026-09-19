import { describe, it, expect } from "vitest";
import { isTeamOwner, isTeamMember, openPositions } from "@/services/teamHelpers";

const ownerId = "507f1f77bcf86cd799439011";
const memberId = "507f1f77bcf86cd799439012";
const strangerId = "507f1f77bcf86cd799439013";

describe("isTeamOwner", () => {
  it("returns true when the user is the owner", () => {
    expect(isTeamOwner({ ownerId }, ownerId)).toBe(true);
  });

  it("returns false for a non-owner", () => {
    expect(isTeamOwner({ ownerId }, strangerId)).toBe(false);
  });
});

describe("isTeamMember", () => {
  const team = { ownerId, members: [{ userId: memberId }] };

  it("treats the owner as a member", () => {
    expect(isTeamMember(team, ownerId)).toBe(true);
  });

  it("treats a listed member as a member", () => {
    expect(isTeamMember(team, memberId)).toBe(true);
  });

  it("returns false for someone not on the team", () => {
    expect(isTeamMember(team, strangerId)).toBe(false);
  });
});

describe("openPositions", () => {
  it("accounts for the owner taking one slot", () => {
    expect(openPositions({ teamSize: 4, members: [] })).toBe(3);
  });

  it("decreases as members join", () => {
    expect(openPositions({ teamSize: 4, members: [{}, {}] })).toBe(1);
  });

  it("never goes negative when the team is over capacity", () => {
    expect(openPositions({ teamSize: 2, members: [{}, {}, {}] })).toBe(0);
  });
});
