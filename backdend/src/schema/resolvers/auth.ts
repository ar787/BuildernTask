import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../db.js";
import type { AppContext } from "../../context.js";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: AppContext) => {
      if (!context.userId) return null;
      return prisma.user.findUnique({ where: { id: context.userId } });
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { name, email, password }: { name: string; email: string; password: string }
    ) => {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new GraphQLError("Email already in use", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await prisma.user.findUnique({ where: { email } });
      const valid = user ? await bcrypt.compare(password, user.password) : false;

      if (!user || !valid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return { token, user };
    },
  },
};
