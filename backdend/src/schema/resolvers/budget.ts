import prisma from "../../db.js";
import {
  requireAuth,
  requirePermission,
  PERMISSIONS,
} from "../../middleware/auth.js";
import type { AppContext } from "../../context.js";

type Totals = Record<string, { totalExpense: number; totalIncome: number }>;
const normalize = (s: string) => s.trim().toLowerCase();
const upsertTotal = (
  totals: Totals,
  name: string,
  field: "totalExpense" | "totalIncome",
  amount: number,
) => {
  const key = normalize(name);
  if (!totals[key]) {
    totals[key] = { totalExpense: 0, totalIncome: 0 };
  }
  totals[key][field] += amount;
};

export const budgetResolvers = {
  Query: {
    budgetReport: async (
      _: unknown,
      { projectId }: { projectId: number },
      context: AppContext,
    ) => {
      const userId = requireAuth(context);
      await requirePermission(projectId, userId, PERMISSIONS.EXPENSE.READ);

      const [expenses, incomes] = await Promise.all([
        prisma.expense.findMany({ where: { projectId } }),
        prisma.income.findMany({ where: { projectId } }),
      ]);

      const totals: Totals = {};

      expenses.forEach((ex) =>
        upsertTotal(totals, ex.name, "totalExpense", ex.amount),
      );

      incomes.forEach((inc) =>
        upsertTotal(totals, inc.name, "totalIncome", inc.amount),
      );

      const totalReport = [];
      for (const key in totals) {
        totalReport.push({
          name: key,
          totalExpense: totals[key].totalExpense,
          totalIncome: totals[key].totalIncome,
          difference: totals[key].totalIncome - totals[key].totalExpense,
        });
      }
      return totalReport;
    },
  },
};
