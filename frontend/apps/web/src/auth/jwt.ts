/** Claim names as the .NET backend writes them into the token. */
export const JwtClaims = {
  userId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  userName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  isAdmin: 'IsAdmin',
} as const;

export const ADMIN_ROLE = 'Admin';

export type JwtPayload = Readonly<Record<string, unknown>>;

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Reads the payload of a JWT without verifying it. The signature is the backend's business; the
 * frontend only needs the claims for display and navigation. `undefined` for a malformed token.
 */
export function decodeJwtPayload(token: string): JwtPayload | undefined {
  const payload = token.split('.')[1];
  if (payload === undefined || payload === '') {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(payload));
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as JwtPayload) : undefined;
  } catch {
    return undefined;
  }
}

/** A string claim. Claims that appear more than once arrive as an array; the first one wins. */
export function stringClaim(payload: JwtPayload | undefined, claim: string): string | undefined {
  const value = payload?.[claim];
  const first = Array.isArray(value) ? (value as unknown[])[0] : value;
  return typeof first === 'string' ? first : undefined;
}

/**
 * Whether the token belongs to an admin. Only admins carry `IsAdmin` and the role claim at all,
 * so their absence simply means "not an admin".
 */
export function isAdminPayload(payload: JwtPayload | undefined): boolean {
  const flag = payload?.[JwtClaims.isAdmin];
  if (flag === true || (typeof flag === 'string' && flag.toLowerCase() === 'true')) {
    return true;
  }
  const role = payload?.[JwtClaims.role];
  const roles = Array.isArray(role) ? (role as unknown[]) : [role];
  return roles.includes(ADMIN_ROLE);
}
