import { GraphQLError } from 'graphql';
import type { AppContext } from '../context.js';
import prisma from '../db.js';

export const PERMISSIONS = {
  PROJECT: {
    READ: 'project:read',
    UPDATE: 'project:update',
    DELETE: 'project:delete',
  },
  EXPENSE: {
    CREATE: 'expense:create',
    READ: 'expense:read',
    UPDATE: 'expense:update',
    DELETE: 'expense:delete',
  },
  INCOME: {
    CREATE: 'income:create',
    READ: 'income:read',
    UPDATE: 'income:update',
    DELETE: 'income:delete',
  },
  INVITATION: {
    SEND: 'invitation:send',
    READ: 'invitation:read',
    RESPOND: 'invitation:respond',
  },
} as const;

const ROLE_PERMISSIONS: Record<'owner' | 'member', string[]> = {
  owner: [
    PERMISSIONS.PROJECT.READ,
    PERMISSIONS.PROJECT.UPDATE,
    PERMISSIONS.PROJECT.DELETE,
    PERMISSIONS.EXPENSE.CREATE,
    PERMISSIONS.EXPENSE.READ,
    PERMISSIONS.EXPENSE.UPDATE,
    PERMISSIONS.EXPENSE.DELETE,
    PERMISSIONS.INCOME.CREATE,
    PERMISSIONS.INCOME.READ,
    PERMISSIONS.INCOME.UPDATE,
    PERMISSIONS.INCOME.DELETE,
    PERMISSIONS.INVITATION.SEND,
    PERMISSIONS.INVITATION.READ,
    PERMISSIONS.INVITATION.RESPOND,
  ],
  member: [
    PERMISSIONS.PROJECT.READ,
    PERMISSIONS.EXPENSE.CREATE,
    PERMISSIONS.EXPENSE.READ,
    PERMISSIONS.INCOME.CREATE,
    PERMISSIONS.INCOME.READ,
    PERMISSIONS.INVITATION.READ,
    PERMISSIONS.INVITATION.RESPOND,
  ],
} as const;

export type ProjectRole = keyof typeof ROLE_PERMISSIONS;

export function requireAuth(context: AppContext): number {
  if (!context.userId) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.userId;
}

async function resolveProjectRole(projectId: number, userId: number): Promise<ProjectRole | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId } } },
  });

  if (!project) return null;
  if (project.ownerId === userId) return 'owner';
  if (project.members.length > 0) return 'member';
  return null;
}

export async function requirePermission(
  projectId: number,
  userId: number,
  permission: string,
): Promise<void> {
  const role = await resolveProjectRole(projectId, userId);

  if (!role || !ROLE_PERMISSIONS[role].includes(permission)) {
    throw new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export async function requireCreatorOrPermission(
  resourceUserId: number,
  projectId: number,
  userId: number,
  permission: string,
): Promise<void> {
  if (resourceUserId === userId) return;
  await requirePermission(projectId, userId, permission);
}
