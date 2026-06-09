import { authResolvers } from "./auth.js";
import { projectResolvers } from "./project.js";
import { invitationResolvers } from "./invitation.js";
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...projectResolvers.Query,
    ...invitationResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...invitationResolvers.Mutation,
  },
  Invitation: invitationResolvers.Invitation,
};
