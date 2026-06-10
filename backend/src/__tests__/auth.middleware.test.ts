import { GraphQLError } from 'graphql';
import { requireAuth, requirePermission, PERMISSIONS } from '../middleware/auth.js';

jest.mock('../db.js', () => ({
  __esModule: true,
  default: { project: { findUnique: jest.fn() } },
}));

import prisma from '../db.js';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => jest.clearAllMocks());

// ─── requireAuth ──────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  it('returns userId when context is authenticated', () => {
    const result = requireAuth({ userId: 7 });
    expect(result).toBe(7);
  });

  it('throws UNAUTHENTICATED when userId is null', () => {
    expect(() => requireAuth({ userId: null })).toThrow(GraphQLError);
    expect(() => requireAuth({ userId: null })).toThrow(
      expect.objectContaining({ extensions: { code: 'UNAUTHENTICATED' } }),
    );
  });
});

// ─── requirePermission ────────────────────────────────────────────────────────

describe('requirePermission', () => {
  const ownerProject = { id: 1, ownerId: 10, members: [] };
  const memberProject = { id: 1, ownerId: 99, members: [{ userId: 10 }] };
  const outsiderProject = { id: 1, ownerId: 99, members: [] };

  it('passes when user is project owner with an owner-level permission', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(ownerProject);
    await expect(requirePermission(1, 10, PERMISSIONS.PROJECT.DELETE)).resolves.toBeUndefined();
  });

  it('passes when user is a member with a member-allowed permission', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(memberProject);
    await expect(requirePermission(1, 10, PERMISSIONS.EXPENSE.READ)).resolves.toBeUndefined();
  });

  it('throws FORBIDDEN when member tries an owner-only permission', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(memberProject);
    await expect(requirePermission(1, 10, PERMISSIONS.PROJECT.DELETE)).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
  });

  it('throws FORBIDDEN when user has no role in the project', async () => {
    (mockPrisma.project.findUnique as jest.Mock).mockResolvedValue(outsiderProject);
    await expect(requirePermission(1, 10, PERMISSIONS.EXPENSE.READ)).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
  });
});
