import type { LoginResponse } from '@homebook/api-client';
import { createPinia, setActivePinia } from 'pinia';

import { JwtClaims } from '@/auth/jwt';
import { apiError, mockBackend } from '@/test/backend';
import { createTestToken } from '@/test/tokens';

import { AuthStorageKeys, parseExpiry, useAuthStore } from './auth';

const NOW = new Date('2026-09-21T12:00:00Z');
const IN_ONE_HOUR = new Date('2026-09-21T13:00:00Z');

const adminToken = createTestToken({
  [JwtClaims.userId]: 'u-1',
  [JwtClaims.userName]: 'admin',
  [JwtClaims.isAdmin]: true,
  [JwtClaims.role]: 'Admin',
});
const userToken = createTestToken({ [JwtClaims.userId]: 'u-2', [JwtClaims.userName]: 'lars' });

function mockLogin(post: () => Promise<LoginResponse | undefined>, logout = vi.fn(async () => undefined)) {
  mockBackend({ api: { account: { login: { post }, logout: { post: logout } } } as never });
  return logout;
}

describe('parseExpiry', () => {
  it('reads an ISO timestamp with zone', () => {
    expect(parseExpiry('2026-09-21T13:00:00.000Z')).toEqual(IN_ONE_HOUR);
  });

  it('treats the Blazor format without zone as UTC', () => {
    expect(parseExpiry('2026-09-21T13:00:00.0000000')).toEqual(IN_ONE_HOUR);
  });

  it.each([null, '', 'tomorrow'])('returns null for %s', (value) => {
    expect(parseExpiry(value)).toBeNull();
  });
});

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores a stored session', () => {
    localStorage.setItem(AuthStorageKeys.token, adminToken);
    localStorage.setItem(AuthStorageKeys.expiresAt, '2026-09-21T13:00:00.0000000');

    const auth = useAuthStore();

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.userName).toBe('admin');
    expect(auth.userId).toBe('u-1');
    expect(auth.isAdmin).toBe(true);
  });

  it('is not authenticated once the token has expired', () => {
    localStorage.setItem(AuthStorageKeys.token, userToken);
    localStorage.setItem(AuthStorageKeys.expiresAt, '2026-09-21T11:59:59Z');

    const auth = useAuthStore();

    expect(auth.hasSession).toBe(true);
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('signs in and stores the session under the unchanged keys', async () => {
    mockLogin(async () => ({ token: userToken, refreshToken: 'r', expiresAt: IN_ONE_HOUR }));
    const auth = useAuthStore();

    await expect(auth.login('lars', 'secret')).resolves.toBe(true);

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.isAdmin).toBe(false);
    expect(auth.userName).toBe('lars');
    expect(localStorage.getItem(AuthStorageKeys.token)).toBe(userToken);
    expect(localStorage.getItem(AuthStorageKeys.refreshToken)).toBe('r');
    expect(localStorage.getItem(AuthStorageKeys.expiresAt)).toBe(IN_ONE_HOUR.toISOString());
  });

  it.each([400, 401])('reports rejected credentials on %i', async (status) => {
    mockLogin(() => Promise.reject(apiError(status)));

    await expect(useAuthStore().login('lars', 'wrong')).resolves.toBe(false);
  });

  it('rejects on any other failure', async () => {
    mockLogin(() => Promise.reject(apiError(503)));

    await expect(useAuthStore().login('lars', 'secret')).rejects.toThrow('HTTP 503');
  });

  it('signs out at the backend and clears the session', async () => {
    const logout = mockLogin(async () => ({ token: userToken, expiresAt: IN_ONE_HOUR }));
    const auth = useAuthStore();
    await auth.login('lars', 'secret');

    await auth.logout();

    expect(logout).toHaveBeenCalledOnce();
    expect(auth.hasSession).toBe(false);
    expect(localStorage.getItem(AuthStorageKeys.token)).toBeNull();
    expect(localStorage.getItem(AuthStorageKeys.expiresAt)).toBeNull();
  });

  it('clears the session even when the backend call fails', async () => {
    mockLogin(
      async () => ({ token: userToken, expiresAt: IN_ONE_HOUR }),
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const auth = useAuthStore();
    await auth.login('lars', 'secret');

    await auth.logout();

    expect(auth.hasSession).toBe(false);
  });

  it('skips the backend call for an expired session', async () => {
    localStorage.setItem(AuthStorageKeys.token, userToken);
    localStorage.setItem(AuthStorageKeys.expiresAt, '2026-09-21T11:00:00Z');
    const logout = mockLogin(async () => undefined);
    const auth = useAuthStore();

    await auth.logout();

    expect(logout).not.toHaveBeenCalled();
    expect(auth.hasSession).toBe(false);
  });
});
