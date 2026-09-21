import { isBadRequest, isUnauthorized } from '@homebook/api-client';
import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';

import { useBackend } from '@/api/backend';
import { decodeJwtPayload, isAdminPayload, JwtClaims, stringClaim } from '@/auth/jwt';

/** localStorage keys, unchanged from the Blazor frontend so existing sessions survive. */
export const AuthStorageKeys = {
  token: 'authToken',
  refreshToken: 'refreshToken',
  expiresAt: 'expiresAt',
} as const;

// An ISO timestamp without a zone designator. The Blazor frontend stored the UTC expiry that way.
const WITHOUT_ZONE = /T[\d:.]+$/;

/** Parses a stored expiry. Values without a zone are UTC, as the backend issues them. */
export function parseExpiry(value: string | null): Date | null {
  if (value === null || value.trim() === '') {
    return null;
  }
  const normalized = WITHOUT_ZONE.test(value.trim()) ? `${value.trim()}Z` : value.trim();
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Storage blocked: the session lasts until the page is reloaded
  }
}

/**
 * The signed-in user. There is no token refresh: a token lives for 60 minutes, after that the
 * user signs in again.
 */
export const useAuthStore = defineStore('auth', () => {
  const token = shallowRef<string | null>(readStorage(AuthStorageKeys.token));
  const expiresAt = shallowRef<Date | null>(parseExpiry(readStorage(AuthStorageKeys.expiresAt)));

  const payload = computed(() => (token.value === null ? undefined : decodeJwtPayload(token.value)));
  const userName = computed(() => stringClaim(payload.value, JwtClaims.userName) ?? '');
  const userId = computed(() => stringClaim(payload.value, JwtClaims.userId) ?? '');
  const isAdmin = computed(() => isAdminPayload(payload.value));
  /** A token is present. It may have expired since, see {@link isAuthenticated}. */
  const hasSession = computed(() => token.value !== null);

  /** Present and not expired. Not a computed: the clock is not reactive. */
  function isAuthenticated(now: number = Date.now()): boolean {
    return token.value !== null && expiresAt.value !== null && expiresAt.value.getTime() > now;
  }

  function setSession(nextToken: string, refreshToken: string | null, expiry: Date): void {
    token.value = nextToken;
    expiresAt.value = expiry;
    writeStorage(AuthStorageKeys.token, nextToken);
    writeStorage(AuthStorageKeys.refreshToken, refreshToken);
    writeStorage(AuthStorageKeys.expiresAt, expiry.toISOString());
  }

  /** Forgets the session locally. */
  function clear(): void {
    token.value = null;
    expiresAt.value = null;
    writeStorage(AuthStorageKeys.token, null);
    writeStorage(AuthStorageKeys.refreshToken, null);
    writeStorage(AuthStorageKeys.expiresAt, null);
  }

  /** Signs in. `false` for rejected credentials (400 or 401); anything else rejects. */
  async function login(username: string, password: string): Promise<boolean> {
    try {
      const response = await useBackend().api.account.login.post({ username, password });
      if (!response?.token || !response.expiresAt) {
        return false;
      }
      setSession(response.token, response.refreshToken ?? null, response.expiresAt);
      return true;
    } catch (error) {
      if (isBadRequest(error) || isUnauthorized(error)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Signs out. The backend call is a courtesy - it is a no-op on the server and needs a valid
   * token - so it is skipped for an expired session and its failure is ignored. The local session
   * is always cleared.
   */
  async function logout(): Promise<void> {
    try {
      if (isAuthenticated()) {
        await useBackend().api.account.logout.post();
      }
    } catch {
      // Nothing to do, the local session goes either way
    } finally {
      clear();
    }
  }

  return { token, expiresAt, userName, userId, isAdmin, hasSession, isAuthenticated, login, logout, clear };
});
