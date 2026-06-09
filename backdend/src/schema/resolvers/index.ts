import { authResolvers } from "./auth.js";
import { projectResolvers } from "./project.js";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
};
