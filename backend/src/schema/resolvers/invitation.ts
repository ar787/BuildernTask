import { AppContext } from '../../context.js';
import prisma from '../../db.js';
import { requireAuth } from '../../middleware/auth.js';

export const invitationResolvers = {
  Query: {
    invitations: async (_: unknown, { projectId }: { projectId: number }, context: AppContext) => {
      const userId = requireAuth(context);
      return prisma.invitation.findMany({
        where: { senderId: userId, projectId, status: 'PENDING' },
        include: { project: true, sender: true },
      });
    },
    receivedInvitations: async (_: unknown, __: unknown, context: AppContext) => {
      const userId = requireAuth(context);
      return prisma.invitation.findMany({
        where: { invitedUserId: userId, status: 'PENDING' },
        include: { project: true, sender: true },
      });
    },
  },
  Mutation: {
    inviteUserToProject: async (
      _: unknown,
      { projectId, email }: { projectId: number; email: string },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { owner: true },
      });
      if (!project) throw new Error('Project not found');
      if (project.owner.id !== userId) throw new Error('Only the project owner can invite users');

      const userToInvite = await prisma.user.findUnique({ where: { email } });
      if (!userToInvite) throw new Error('User with this email does not exist');

      return prisma.$transaction(
        async (tx) => {
          const existing = await tx.invitation.findFirst({
            where: { projectId, invitedUserId: userToInvite.id, status: 'PENDING' },
          });
          if (existing) throw new Error('User already has a pending invitation for this project');

          return tx.invitation.create({
            data: {
              projectId,
              invitedEmail: email,
              senderId: userId,
              invitedUserId: userToInvite.id,
              status: 'PENDING',
            },
            include: { sender: true, project: true },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    },

    respondToInvitation: async (
      _: unknown,
      { id, accept }: { id: number; accept: boolean },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);

      return prisma.$transaction(
        async (tx) => {
          const invitation = await tx.invitation.findUnique({ where: { id } });
          if (!invitation) throw new Error('Invitation not found');
          if (invitation.invitedUserId !== userId) throw new Error('Not your invitation');
          if (invitation.status !== 'PENDING') throw new Error('Invitation already responded to');

          const updated = await tx.invitation.update({
            where: { id },
            data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
            include: { sender: true, project: true },
          });

          if (accept) {
            const alreadyMember = await tx.projectMember.findUnique({
              where: { userId_projectId: { userId, projectId: invitation.projectId } },
            });
            if (alreadyMember) throw new Error('You are already a member of this project');

            await tx.projectMember.create({
              data: { projectId: invitation.projectId, userId },
            });
          }

          return updated;
        },
        { isolationLevel: 'Serializable' },
      );
    },
  },
  Invitation: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
