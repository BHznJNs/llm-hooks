import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

export const cookieToBearer = createMiddleware(async (c: Context, next) => {
  const token = getCookie(c, 'auth');
  if (token) {
    c.req.raw.headers.set('Authorization', `Bearer ${token}`);
  }
  await next();
});
