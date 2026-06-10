import type { Request } from 'express';
import { buildContext } from '../context.js';

jest.mock('jsonwebtoken');
import jwt from 'jsonwebtoken';
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const makeReq = (authorization?: string) =>
  ({ headers: authorization ? { authorization } : {} }) as unknown as Request;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('buildContext', () => {
  it('returns userId null when no Authorization header', async () => {
    const ctx = await buildContext({ req: makeReq() });
    expect(ctx).toEqual({ userId: null });
  });

  it('returns userId null when header does not start with Bearer', async () => {
    const ctx = await buildContext({ req: makeReq('Basic sometoken') });
    expect(ctx).toEqual({ userId: null });
  });

  it('returns userId from valid token', async () => {
    (mockJwt.verify as jest.Mock).mockReturnValue({ userId: 42, email: 'a@b.com' });

    const ctx = await buildContext({ req: makeReq('Bearer valid-token') });

    expect(ctx).toEqual({ userId: 42 });
    expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
  });

  it('returns userId null when token is invalid or expired', async () => {
    (mockJwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    const ctx = await buildContext({ req: makeReq('Bearer bad-token') });

    expect(ctx).toEqual({ userId: null });
  });
});
