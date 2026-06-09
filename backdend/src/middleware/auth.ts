import { GraphQLError } from "graphql";
import type { AppContext } from "../context.js";

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
