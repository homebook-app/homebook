import { decodeJwtPayload, isAdminPayload, JwtClaims, stringClaim } from './jwt';
import { createTestToken } from '@/test/tokens';

describe('decodeJwtPayload', () => {
  it('reads the payload of a token', () => {
    const token = createTestToken({ [JwtClaims.userName]: 'lars' });

    expect(stringClaim(decodeJwtPayload(token), JwtClaims.userName)).toBe('lars');
  });

  it('decodes base64url characters and UTF-8', () => {
    // "?>" and "??" encode to base64 with + and /, which base64url replaces by - and _
    const token = createTestToken({ [JwtClaims.userName]: 'Jürgen ?>??' });

    expect(stringClaim(decodeJwtPayload(token), JwtClaims.userName)).toBe('Jürgen ?>??');
  });

  it.each(['', 'onlyone', 'a..c', 'a.!!!.c', `a.${btoa('[1]')}.c`])('rejects the malformed token %s', (token) => {
    expect(decodeJwtPayload(token)).toBeUndefined();
  });
});

describe('isAdminPayload', () => {
  it('detects an admin by the IsAdmin claim', () => {
    expect(isAdminPayload({ [JwtClaims.isAdmin]: 'True' })).toBe(true);
    expect(isAdminPayload({ [JwtClaims.isAdmin]: true })).toBe(true);
  });

  it('detects an admin by the role claim', () => {
    expect(isAdminPayload({ [JwtClaims.role]: 'Admin' })).toBe(true);
    expect(isAdminPayload({ [JwtClaims.role]: ['User', 'Admin'] })).toBe(true);
  });

  it('treats a token without role claims as a regular user', () => {
    expect(isAdminPayload({ [JwtClaims.userName]: 'lars' })).toBe(false);
    expect(isAdminPayload(undefined)).toBe(false);
  });
});

describe('stringClaim', () => {
  it('takes the first value of a repeated claim and ignores other types', () => {
    expect(stringClaim({ a: ['x', 'y'] }, 'a')).toBe('x');
    expect(stringClaim({ a: 1 }, 'a')).toBeUndefined();
  });
});
