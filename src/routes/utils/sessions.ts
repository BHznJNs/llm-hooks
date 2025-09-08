/** biome-ignore-all lint/style/noMagicNumbers: millisecond / 1000 = second */
import { Jwt } from 'hono/utils/jwt';

export async function createSid(
  ttl_second: number,
  token: string
): Promise<string> {
  const sid = await Jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + ttl_second },
    token
  );
  return sid;
}

export async function verifySid(sid: string, token: string): Promise<boolean> {
  try {
    await Jwt.verify(sid, token);
    return true;
  } catch {
    return false;
  }
}
