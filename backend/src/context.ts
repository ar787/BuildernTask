import type { Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AppContext {
  userId: number | null;
}

interface JwtPayload {
  userId: number;
  email: string;
}

export async function buildContext({ req }: { req: Request }): Promise<AppContext> {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer ')) return { userId: null };

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return { userId: payload.userId };
  } catch {
    return { userId: null };
  }
}
