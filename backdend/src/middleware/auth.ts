import { GraphQLError } from "graphql";
import type { AppContext } from "../context.js";
import prisma from "../db.js";

export function requireAuth(context: AppContext): number {
  if (!context.userId) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}

export function requireOwnership(ownerId: number, userId: number, resource = "resource"): void {
  if (ownerId !== userId) {
    throw new GraphQLError(`Not authorized to modify this ${resource}`, {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

export async function requireCreatorOrOwner(
  resourceUserId: number,
  projectId: number,
  userId: number,
): Promise<void> {
  if (resourceUserId === userId) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project?.ownerId === userId) return;
  throw new GraphQLError("Only the creator or project owner can perform this action", {
    extensions: { code: "FORBIDDEN" },
  });
}

export async function requireProjectAccess(projectId: number, userId: number): Promise<void> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });
  if (!project) {
    throw new GraphQLError("Project not found or access denied", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
