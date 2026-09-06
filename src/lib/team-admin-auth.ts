import { cookies } from 'next/headers';
import crypto from 'crypto';

const TEAM_ADMIN_COOKIE = 'tedx_team_admin_token';
const TEAM_ADMIN_EMAIL = process.env.TEAM_ADMIN_EMAIL || 'admin@tedxgcem.com';
const TEAM_ADMIN_PASSWORD = process.env.TEAM_ADMIN_PASSWORD || 'TEDxGCEM2026!SecureAdminPass';
const SECRET_SALT = process.env.NEXTAUTH_SECRET || 'tedxgcem-super-secure-secret-key-2026';

function createAuthToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(`${TEAM_ADMIN_EMAIL}:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function validateAuthToken(token: string): boolean {
  try {
    const [timestampStr, signature] = token.split('.');
    if (!timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 7 days
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_SALT)
      .update(`${TEAM_ADMIN_EMAIL}:${timestampStr}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function checkTeamAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_ADMIN_COOKIE)?.value;
  if (!token) return false;
  return validateAuthToken(token);
}

export function checkCredentials(email: string, pass: string): boolean {
  const normalizedEmail = (email || '').trim().toLowerCase();
  return (
    normalizedEmail === TEAM_ADMIN_EMAIL.toLowerCase() &&
    pass === TEAM_ADMIN_PASSWORD
  );
}

export { TEAM_ADMIN_COOKIE, createAuthToken };
