import crypto from 'node:crypto';

const authToken = process.env.AUTH_TOKEN;
if (!authToken) {
  throw new Error('AUTH_TOKEN is not defined');
}

export function getAuthToken(): string {
  return authToken!;
}

export function isValidAuthToken(token: string): boolean {
  const tokenBuffer = Buffer.from(token);
  const authTokenBuffer = Buffer.from(getAuthToken());
  try {
    return crypto.timingSafeEqual(tokenBuffer, authTokenBuffer);
  } catch {
    return false;
  }
}
