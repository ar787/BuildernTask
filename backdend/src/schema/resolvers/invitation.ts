import { AppContext } from "../../context.js";
import prisma from "../../db.js";
import { requireAuth } from "../../middleware/auth.js";

export const invitationResolvers = {
  Query: {
    invitations: async (
      _: any,
      { projectId }: { projectId: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      return prisma.invitation.findMany({
        where: { senderId: userId, projectId, status: "PENDING" },
        include: { project: true, sender: true },
      });
    },
    receivedInvitations: async (_: any, __: any, context: AppContext) => {
      const userId = requireAuth(context);
      return prisma.invitation.findMany({
        where: { invitedUserId: userId, status: "PENDING" },
        include: { project: true, sender: true },
      });
    },
  },
  Mutation: {
    inviteUserToProject: async (
      _: any,
      { projectId, email }: { projectId: number; email: string },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      // Check if the user is the owner of the project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { owner: true },
      });
      if (!project) {
        throw new Error("Project not found");
      }
      if (project.owner.id !== userId) {
        throw new Error("Only the project owner can invite users");
      }

      // Find the user to invite
      const userToInvite = await prisma.user.findUnique({
        where: { email, AND: {} },
      });
      if (!userToInvite) {
        throw new Error("User with this email does not exist");
      }

      const existingInvitation = await prisma.invitation.findFirst({
        where: { projectId, invitedUserId: userToInvite.id, status: "PENDING" },
      });
      if (existingInvitation) {
        throw new Error(
          "User already has a pending invitation for this project",
        );
      }

      const createInvitation = await prisma.invitation.create({
        data: {
          projectId,
          invitedEmail: email,
          senderId: userId,
          invitedUserId: userToInvite.id,
          status: "PENDING",
        },
        include: { sender: true, project: true },
      });
      return createInvitation;
    },

    respondToInvitation: async (
      _: any,
      { id, accept }: { id: number; accept: boolean },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);

      const invitation = await prisma.invitation.findUnique({ where: { id } });
      if (!invitation) throw new Error("Invitation not found");
      if (invitation.invitedUserId !== userId)
        throw new Error("Not your invitation");
      if (invitation.status !== "PENDING")
        throw new Error("Invitation already responded to");

      const updated = await prisma.invitation.update({
        where: { id },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
        include: { sender: true, project: true },
      });

      if (accept) {
        const alreadyMember = await prisma.projectMember.findUnique({
          where: { userId_projectId: { userId, projectId: invitation.projectId } },
        });
        if (alreadyMember) throw new Error("You are already a member of this project");

        await prisma.projectMember.create({
          data: { projectId: invitation.projectId, userId },
        });
      }

      return updated;
    },
  },
  Invitation: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
