import { GraphQLError } from "graphql";
import prisma from "../../db.js";
import { requireAuth, requirePermission, requireCreatorOrPermission, PERMISSIONS } from "../../middleware/auth.js";
import type { AppContext } from "../../context.js";

const include = { user: true } as const;

export const incomeResolvers = {
  Query: {
    incomes: async (
      _: unknown,
      { projectId }: { projectId: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      await requirePermission(projectId, userId, PERMISSIONS.INCOME.READ);
      return prisma.income.findMany({
        where: { projectId },
        include,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createIncome: async (
      _: unknown,
      {
        projectId,
        name,
        amount,
      }: { projectId: number; name: string; amount: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      await requirePermission(projectId, userId, PERMISSIONS.INCOME.CREATE);
      return prisma.income.create({
        data: { projectId, name, amount, userId },
        include,
      });
    },

    updateIncome: async (
      _: unknown,
      { id, name, amount }: { id: number; name?: string; amount?: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      const income = await prisma.income.findUnique({ where: { id } });
      if (!income) {
        throw new GraphQLError("Income not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await requireCreatorOrPermission(income.userId, income.projectId, userId, PERMISSIONS.INCOME.UPDATE);
      return prisma.income.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(amount !== undefined && { amount }),
        },
        include,
      });
    },

    deleteIncome: async (
      _: unknown,
      { id }: { id: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      const income = await prisma.income.findUnique({ where: { id } });
      if (!income) {
        throw new GraphQLError("Income not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await requireCreatorOrPermission(income.userId, income.projectId, userId, PERMISSIONS.INCOME.DELETE);
      await prisma.income.delete({ where: { id } });
      return true;
    },
  },
  Income: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
