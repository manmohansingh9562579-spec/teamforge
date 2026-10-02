import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  connectDB: vi.fn(),
  teamFindById: vi.fn(),
  teamFind: vi.fn(),
  teamCreate: vi.fn(),
  userFindById: vi.fn(),
  joinFindOne: vi.fn(),
  joinFindById: vi.fn(),
  joinCountDocuments: vi.fn(),
  joinCreate: vi.fn(),
  activityCreate: vi.fn(),
  notify: vi.fn(),
  isTeamOwner: vi.fn(),
  openPositions: vi.fn(),
  generateUniqueSlug: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ getCurrentSession: mocks.getSession }));
vi.mock("@/lib/db", () => ({ connectDB: mocks.connectDB }));
vi.mock("@/lib/notify", () => ({ notify: mocks.notify }));
vi.mock("@/models/Team", () => ({ Team: {
  findById: mocks.teamFindById,
  find: mocks.teamFind,
  create: mocks.teamCreate,
} }));
vi.mock("@/models/User", () => ({ User: {
  findById: mocks.userFindById,
  find: vi.fn(),
} }));
vi.mock("@/models/Request", () => ({ JoinRequest: {
  findOne: mocks.joinFindOne,
  findById: mocks.joinFindById,
  countDocuments: mocks.joinCountDocuments,
  create: mocks.joinCreate,
} }));
vi.mock("@/models/Activity", () => ({ Activity: { create: mocks.activityCreate } }));
vi.mock("@/services/teamService", () => ({
  isTeamOwner: mocks.isTeamOwner,
  openPositions: mocks.openPositions,
  generateUniqueSlug: mocks.generateUniqueSlug,
}));

import { GET as matchGET, POST as matchPOST } from "@/app/api/team-match/route";
import { POST as invitationPOST } from "@/app/api/teams/[id]/invitations/route";
import { PATCH as requestPATCH } from "@/app/api/requests/[id]/route";

const ownerId = "111111111111111111111111";
const memberId = "222222222222222222222222";
const teamId = "333333333333333333333333";
const requestId = "444444444444444444444444";

function makeTeam() {
  return {
    _id: new Types.ObjectId(teamId),
    ownerId: new Types.ObjectId(ownerId),
    name: "CivicPulse",
    projectTitle: "CivicPulse",
    slug: "civicpulse",
    teamSize: 4,
    status: "forming",
    visibility: "private",
    requiredRoles: ["Backend Developer"],
    members: [] as Array<{ userId: Types.ObjectId; role: string; joinedAt: Date }>,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function invitationQuery(value: unknown) {
  return { select: vi.fn().mockResolvedValue(value) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connectDB.mockResolvedValue(undefined);
  mocks.notify.mockResolvedValue(undefined);
  mocks.joinCountDocuments.mockResolvedValue(0);
  mocks.openPositions.mockReturnValue(3);
  mocks.isTeamOwner.mockImplementation((team, userId) => team.ownerId.toString() === userId);
});

describe("TeamForge Match API", () => {
  it("rejects anonymous match requests without opening the database", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await matchPOST(makeRequest({}));
    expect(response.status).toBe(401);
    expect(mocks.connectDB).not.toHaveBeenCalled();
  });

  it("rejects invalid project data before touching the database", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: ownerId } });
    const response = await matchPOST(makeRequest({ projectName: "x", description: "short", teamSize: 1 }));
    expect(response.status).toBe(400);
    expect(mocks.connectDB).not.toHaveBeenCalled();
  });

  it("only reloads matches for a team the signed-in user owns", async () => {
    const team = makeTeam();
    mocks.getSession.mockResolvedValue({ user: { id: memberId } });
    mocks.teamFindById.mockResolvedValue(team);

    const response = await matchGET(new Request(`http://localhost/api/team-match?teamId=${teamId}`));

    expect(response.status).toBe(403);
    expect(mocks.connectDB).toHaveBeenCalledOnce();
  });
});

describe("existing team invitation flow", () => {
  it("creates a pending invitation in the existing JoinRequest model and notifies the invitee", async () => {
    const team = makeTeam();
    mocks.getSession.mockResolvedValue({ user: { id: ownerId, name: "Team owner" } });
    mocks.teamFindById.mockResolvedValue(team);
    mocks.userFindById.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: new Types.ObjectId(memberId) }) });
    mocks.joinFindOne.mockReturnValue(invitationQuery(null));
    mocks.joinCreate.mockResolvedValue({ _id: new Types.ObjectId(requestId), status: "pending" });

    const response = await invitationPOST(makeRequest({ inviteeId: memberId, role: "Backend Developer", message: "Your skills fit the build." }), { params: { id: teamId } });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.status).toBe("pending");
    expect(mocks.joinCreate).toHaveBeenCalledWith(expect.objectContaining({
      kind: "invitation",
      senderId: new Types.ObjectId(memberId),
      invitedBy: ownerId,
      invitedRole: "Backend Developer",
      teamId: team._id,
      status: "pending",
    }));
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
      userId: new Types.ObjectId(memberId),
      type: "team_invitation",
      relatedEntity: { kind: "request", id: new Types.ObjectId(requestId) },
    }));
  });

  it("lets the invited user accept and adds them to the existing team's members", async () => {
    const team = makeTeam();
    const request = {
      _id: new Types.ObjectId(requestId),
      senderId: new Types.ObjectId(memberId),
      invitedBy: new Types.ObjectId(ownerId),
      invitedRole: "Backend Developer",
      kind: "invitation",
      teamId: team._id,
      status: "pending",
      save: vi.fn().mockResolvedValue(undefined),
    };
    mocks.getSession.mockResolvedValue({ user: { id: memberId, name: "Invited member" } });
    mocks.joinFindById.mockResolvedValue(request);
    mocks.teamFindById.mockResolvedValue(team);
    mocks.activityCreate.mockResolvedValue(undefined);

    const response = await requestPATCH(
      new Request("http://localhost/api/requests/test", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "accepted" }) }),
      { params: { id: requestId } }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("accepted");
    expect(team.members).toHaveLength(1);
    expect(team.members[0].userId.toString()).toBe(memberId);
    expect(team.members[0].role).toBe("Backend Developer");
    expect(team.save).toHaveBeenCalledOnce();
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({
      userId: new Types.ObjectId(ownerId),
      type: "team_invitation_accepted",
      message: expect.stringContaining("accepted your invitation"),
    }));
  });
});
