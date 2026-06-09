import { GraphQLError } from "graphql";
import prisma from "../../db.js";
import { requireAuth, requireOwnership } from "../../middleware/auth.js";
import type { AppContext } from "../../context.js";

const projectInclude = {
  owner: true,
  members: { include: { user: true } },
} as const;

export const projectResolvers = {
  Query: {
    projects: async (_: unknown, __: unknown, context: AppContext) => {
      const userId = requireAuth(context);
      return prisma.project.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: projectInclude,
      });
    },

    project: async (_: unknown, { id }: { id: number }, context: AppContext) => {
      const userId = requireAuth(context);
      const project = await prisma.project.findFirst({
        where: {
          id,
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: projectInclude,
      });
      if (!project) {
        throw new GraphQLError("Project not found or access denied", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return project;
    },
  },

  Mutation: {
    createProject: async (
      _: unknown,
      { name, location }: { name: string; location: string },
      context: AppContext
    ) => {
      const userId = requireAuth(context);
      return prisma.project.create({
        data: { name, location, ownerId: userId },
        include: projectInclude,
      });
    },

    updateProject: async (
      _: unknown,
      { id, name, location }: { id: number; name?: string; location?: string },
      context: AppContext
    ) => {
      const userId = requireAuth(context);
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new GraphQLError("Project not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      requireOwnership(project.ownerId, userId, "project");
      return prisma.project.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(location !== undefined && { location }),
        },
        include: projectInclude,
      });
    },

    deleteProject: async (
      _: unknown,
      { id }: { id: number },
      context: AppContext
    ) => {
      const userId = requireAuth(context);
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new GraphQLError("Project not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      requireOwnership(project.ownerId, userId, "project");
      await prisma.project.delete({ where: { id } });
      return true;
    },
  },
};
