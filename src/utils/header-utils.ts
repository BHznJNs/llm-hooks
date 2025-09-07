import type { Context } from 'hono';

export function extractAuthToken(c: Context): string | null {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return null;
  }
  const authToken = authHeader.split(' ')[1];
  return authToken ?? null;
}
