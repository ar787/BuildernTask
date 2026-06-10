import { invitationResolvers } from "../schema/resolvers/invitation.js";

jest.mock("../db.js", () => ({
  __esModule: true,
  default: {
    project: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    invitation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    projectMember: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

import prisma from "../db.js";

const mock = {
  project: prisma.project as jest.Mocked<typeof prisma.project>,
  user: prisma.user as jest.Mocked<typeof prisma.user>,
  invitation: prisma.invitation as jest.Mocked<typeof prisma.invitation>,
  projectMember: prisma.projectMember as jest.Mocked<
    typeof prisma.projectMember
  >,
};

const ctx = (userId: number) => ({ userId });

const fakeOwner = { id: 1, name: "Alice", email: "alice@example.com" };
const fakeInvitee = { id: 2, name: "Bob", email: "bob@example.com" };
const fakeProject = { id: 10, ownerId: 1, owner: fakeOwner };

const pendingInvitation = {
  id: 99,
  projectId: 10,
  invitedUserId: 2,
  senderId: 1,
  invitedEmail: "bob@example.com",
  status: "PENDING",
  createdAt: new Date(),
  sender: fakeOwner,
  project: fakeProject,
};

beforeEach(() => jest.clearAllMocks());

// ─── respondToInvitation ─────────────────────────────────────────────────────

describe("respondToInvitation mutation", () => {
  it("accepts invitation: sets status ACCEPTED and adds user as project member", async () => {
    const accepted = { ...pendingInvitation, status: "ACCEPTED" };

    (mock.invitation.findUnique as jest.Mock).mockResolvedValue(
      pendingInvitation,
    );
    (mock.invitation.update as jest.Mock).mockResolvedValue(accepted);
    (mock.projectMember.findUnique as jest.Mock).mockResolvedValue(null);
    (mock.projectMember.create as jest.Mock).mockResolvedValue({});

    const result = await invitationResolvers.Mutation.respondToInvitation(
      undefined,
      { id: 99, accept: true },
      ctx(2),
    );

    expect(result).toEqual(accepted);
    expect(mock.invitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "ACCEPTED" } }),
    );
    expect(mock.projectMember.create).toHaveBeenCalledWith({
      data: { projectId: 10, userId: 2 },
    });
  });

  it("rejects invitation: sets status REJECTED and does NOT add project member", async () => {
    const rejected = { ...pendingInvitation, status: "REJECTED" };

    (mock.invitation.findUnique as jest.Mock).mockResolvedValue(
      pendingInvitation,
    );
    (mock.invitation.update as jest.Mock).mockResolvedValue(rejected);

    const result = await invitationResolvers.Mutation.respondToInvitation(
      undefined,
      { id: 99, accept: false },
      ctx(2),
    );

    expect(result).toEqual(rejected);
    expect(mock.invitation.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "REJECTED" } }),
    );
    expect(mock.projectMember.create).not.toHaveBeenCalled();
  });
});

// ─── inviteUserToProject ──────────────────────────────────────────────────────

describe("inviteUserToProject mutation", () => {
  it("throws when a pending invitation for this user already exists", async () => {
    (mock.project.findUnique as jest.Mock).mockResolvedValue(fakeProject);
    (mock.user.findUnique as jest.Mock).mockResolvedValue(fakeInvitee);
    (mock.invitation.findFirst as jest.Mock).mockResolvedValue(
      pendingInvitation,
    );

    await expect(
      invitationResolvers.Mutation.inviteUserToProject(
        undefined,
        { projectId: 10, email: "bob@example.com" },
        ctx(1),
      ),
    ).rejects.toThrow("User already has a pending invitation for this project");

    expect(mock.invitation.create).not.toHaveBeenCalled();
  });
});
