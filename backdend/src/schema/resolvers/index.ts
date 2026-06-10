import { authResolvers } from "./auth.js";
import { projectResolvers } from "./project.js";
import { invitationResolvers } from "./invitation.js";
import { expenseResolvers } from "./expense.js";
import { incomeResolvers } from "./income.js";
import { budgetResolvers } from "./budget.js";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...projectResolvers.Query,
    ...invitationResolvers.Query,
    ...expenseResolvers.Query,
    ...incomeResolvers.Query,
    ...budgetResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...invitationResolvers.Mutation,
    ...expenseResolvers.Mutation,
    ...incomeResolvers.Mutation,
  },
  Invitation: invitationResolvers.Invitation,
  Expense: expenseResolvers.Expense,
  Income: incomeResolvers.Income,
};
