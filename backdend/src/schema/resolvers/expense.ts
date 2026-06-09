import { GraphQLError } from "graphql";
import prisma from "../../db.js";
import { requireAuth, requirePermission, requireCreatorOrPermission, PERMISSIONS } from "../../middleware/auth.js";
import type { AppContext } from "../../context.js";

const include = { user: true } as const;

export const expenseResolvers = {
  Query: {
    expenses: async (
      _: unknown,
      { projectId }: { projectId: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      await requirePermission(projectId, userId, PERMISSIONS.EXPENSE.READ);
      return prisma.expense.findMany({
        where: { projectId },
        include,
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createExpense: async (
      _: unknown,
      {
        projectId,
        name,
        amount,
      }: { projectId: number; name: string; amount: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      await requirePermission(projectId, userId, PERMISSIONS.EXPENSE.CREATE);
      return prisma.expense.create({
        data: { projectId, name, amount, userId },
        include,
      });
    },

    updateExpense: async (
      _: unknown,
      { id, name, amount }: { id: number; name?: string; amount?: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      const expense = await prisma.expense.findUnique({ where: { id } });
      if (!expense) {
        throw new GraphQLError("Expense not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await requireCreatorOrPermission(expense.userId, expense.projectId, userId, PERMISSIONS.EXPENSE.UPDATE);
      return prisma.expense.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(amount !== undefined && { amount }),
        },
        include,
      });
    },

    deleteExpense: async (
      _: unknown,
      { id }: { id: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      const expense = await prisma.expense.findUnique({ where: { id } });
      if (!expense) {
        throw new GraphQLError("Expense not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await requireCreatorOrPermission(expense.userId, expense.projectId, userId, PERMISSIONS.EXPENSE.DELETE);
      await prisma.expense.delete({ where: { id } });
      return true;
    },
  },
  Expense: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
