import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { extractAuthToken } from '../../utils/header-utils.ts';
import { UNAUTHORIZED } from '../../utils/response-code.ts';
import { getAuthToken, isValidAuthToken } from '../utils/authToken.ts';
import { createSid } from '../utils/sessions.ts';

const auth = new Hono();
const cookieAgeDays = 7;
const cookieTTL = 60 * 60 * 24 * cookieAgeDays;

auth.post('/login', async (c) => {
  const token = extractAuthToken(c);
  if (!(token && isValidAuthToken(token))) {
    c.status(UNAUTHORIZED);
    return c.json({ error: 'Not a valid token' });
  }

  const sid = await createSid(cookieTTL, getAuthToken());
  setCookie(c, 'auth', sid, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api',
    maxAge: cookieTTL,
  });
  return c.json(null);
});

auth.post('/logout', (c) => {
  setCookie(c, 'auth', '', { maxAge: 0 });
  return c.json(null);
});

export default auth;
