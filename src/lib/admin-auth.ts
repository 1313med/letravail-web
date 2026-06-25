export const ADMIN_COOKIE = "ltm_admin";

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminSecret());
}

export function verifyAdminToken(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;
  return token === secret;
}
