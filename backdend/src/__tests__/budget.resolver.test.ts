import { budgetResolvers } from "../schema/resolvers/budget.js";

jest.mock("../db.js", () => ({
  __esModule: true,
  default: {
    expense: { findMany: jest.fn() },
    income: { findMany: jest.fn() },
  },
}));

jest.mock("../middleware/auth.js", () => ({
  requireAuth: jest.fn().mockReturnValue(1),
  requirePermission: jest.fn().mockResolvedValue(undefined),
  PERMISSIONS: jest.requireActual("../middleware/auth.js").PERMISSIONS,
}));

import prisma from "../db.js";

const mockExpenses = prisma.expense as jest.Mocked<typeof prisma.expense>;
const mockIncomes = prisma.income as jest.Mocked<typeof prisma.income>;

const ctx = { userId: 1 };

beforeEach(() => jest.clearAllMocks());

const callReport = () =>
  budgetResolvers.Query.budgetReport(undefined, { projectId: 1 }, ctx);

// ─── aggregation ──────────────────────────────────────────────────────────────

describe("aggregation of records with the same name", () => {
  it("sums multiple expenses with the same name into one line", async () => {
    (mockExpenses.findMany as jest.Mock).mockResolvedValue([
      { name: "rent", amount: 500 },
      { name: "rent", amount: 700 },
    ]);
    (mockIncomes.findMany as jest.Mock).mockResolvedValue([
      { name: "rent", amount: 1500 },
    ]);

    const result = await callReport();

    expect(result).toEqual([
      { name: "rent", totalExpense: 1200, totalIncome: 1500, difference: 300 },
    ]);
  });

  it("matches names case-insensitively and ignores surrounding whitespace", async () => {
    (mockExpenses.findMany as jest.Mock).mockResolvedValue([
      { name: "Salary", amount: 200 },
    ]);
    (mockIncomes.findMany as jest.Mock).mockResolvedValue([
      { name: " salary ", amount: 3000 },
    ]);

    const result = await callReport();

    expect(result).toEqual([
      {
        name: "salary",
        totalExpense: 200,
        totalIncome: 3000,
        difference: 2800,
      },
    ]);
  });
});

// ─── one-sided names ──────────────────────────────────────────────────────────

describe("names existing only on one side", () => {
  it("sets totalIncome to 0 for an expense with no matching income", async () => {
    (mockExpenses.findMany as jest.Mock).mockResolvedValue([
      { name: "electricity", amount: 100 },
    ]);
    (mockIncomes.findMany as jest.Mock).mockResolvedValue([]);

    const result = await callReport();

    expect(result).toEqual([
      {
        name: "electricity",
        totalExpense: 100,
        totalIncome: 0,
        difference: -100,
      },
    ]);
  });

  it("sets totalExpense to 0 for an income with no matching expense", async () => {
    (mockExpenses.findMany as jest.Mock).mockResolvedValue([]);
    (mockIncomes.findMany as jest.Mock).mockResolvedValue([
      { name: "salary", amount: 3000 },
    ]);

    const result = await callReport();

    expect(result).toEqual([
      { name: "salary", totalExpense: 0, totalIncome: 3000, difference: 3000 },
    ]);
  });

  it("handles mixed: some names shared, some only in expenses, some only in incomes", async () => {
    (mockExpenses.findMany as jest.Mock).mockResolvedValue([
      { name: "rent", amount: 1000 },
      { name: "electricity", amount: 100 },
    ]);
    (mockIncomes.findMany as jest.Mock).mockResolvedValue([
      { name: "rent", amount: 1500 },
      { name: "salary", amount: 3000 },
    ]);

    const result = await callReport();

    expect(result).toEqual(
      expect.arrayContaining([
        {
          name: "rent",
          totalExpense: 1000,
          totalIncome: 1500,
          difference: 500,
        },
        {
          name: "electricity",
          totalExpense: 100,
          totalIncome: 0,
          difference: -100,
        },
        {
          name: "salary",
          totalExpense: 0,
          totalIncome: 3000,
          difference: 3000,
        },
      ]),
    );
    expect(result).toHaveLength(3);
  });
});
