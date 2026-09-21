// Stand-in for @homebook/api-client in the app's tests, installed by src/test/setup.ts.
//
// The API client is never called for real in tests. The status predicates are reproduced here
// because the code under test branches on them; everything that would send a request is a spy.
import { vi } from 'vitest';

export const DEFAULT_BASE_URL = '/api';

export function isBackendApiError(error: unknown): error is { responseStatusCode: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { responseStatusCode?: unknown }).responseStatusCode === 'number'
  );
}

export function statusCodeOf(error: unknown): number | undefined {
  return isBackendApiError(error) ? error.responseStatusCode : undefined;
}

const hasStatus = (status: number) => (error: unknown) => statusCodeOf(error) === status;

export const isBadRequest = hasStatus(400);
export const isUnauthorized = hasStatus(401);
export const isForbidden = hasStatus(403);
export const isNotFound = hasStatus(404);
export const isConflict = hasStatus(409);
export const isUnprocessable = hasStatus(422);
export const isServiceUnavailable = hasStatus(503);

export const createBackendClient = vi.fn((options: { baseUrl?: string }) => ({
  baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
}));
