import { GraphQLError } from "graphql";
import { authResolvers } from "../schema/resolvers/auth.js";

jest.mock("../db.js", () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn(), create: jest.fn() } },
}));
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

import prisma from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const fakeUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
  (mockJwt.sign as jest.Mock).mockReturnValue("mock-token");
});

// ─── register ────────────────────────────────────────────────────────────────

describe("register mutation", () => {
  it("returns token and user when email is new", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (mockPrisma.user.create as jest.Mock).mockResolvedValue(fakeUser);

    const result = await authResolvers.Mutation.register(undefined, {
      name: "Alice",
      email: "alice@example.com",
      password: "secret",
    });

    expect(result).toEqual({ token: "mock-token", user: fakeUser });
  });

  it("hashes the raw password before storing", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue("hashed");
    (mockPrisma.user.create as jest.Mock).mockResolvedValue(fakeUser);

    await authResolvers.Mutation.register(undefined, {
      name: "Alice",
      email: "alice@example.com",
      password: "secret",
    });

    expect(mockBcrypt.hash).toHaveBeenCalledWith("secret", 10);
  });

  it("throws BAD_USER_INPUT when email already exists", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

    await expect(
      authResolvers.Mutation.register(undefined, {
        name: "Alice",
        email: "alice@example.com",
        password: "secret",
      }),
    ).rejects.toThrow(GraphQLError);

    await expect(
      authResolvers.Mutation.register(undefined, {
        name: "Alice",
        email: "alice@example.com",
        password: "secret",
      }),
    ).rejects.toMatchObject({ extensions: { code: "BAD_USER_INPUT" } });
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe("login mutation", () => {
  it("returns token and user with valid credentials", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authResolvers.Mutation.login(undefined, {
      email: "alice@example.com",
      password: "secret",
    });

    expect(result).toEqual({ token: "mock-token", user: fakeUser });
  });

  it("throws UNAUTHENTICATED when user is not found", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      authResolvers.Mutation.login(undefined, {
        email: "nobody@example.com",
        password: "secret",
      }),
    ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
  });

  it("throws UNAUTHENTICATED when password is wrong", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authResolvers.Mutation.login(undefined, {
        email: "alice@example.com",
        password: "wrong",
      }),
    ).rejects.toMatchObject({ extensions: { code: "UNAUTHENTICATED" } });
  });
});

// ─── me ───────────────────────────────────────────────────────────────────────

describe("me query", () => {
  it("returns user when userId is in context", async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser);

    const result = await authResolvers.Query.me(undefined, undefined, {
      userId: 1,
    });

    expect(result).toEqual(fakeUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("returns null when no userId in context", async () => {
    const result = await authResolvers.Query.me(undefined, undefined, {
      userId: null,
    });

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});
