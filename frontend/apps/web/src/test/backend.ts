// Test helpers, only imported by specs
import type { HomeBookClient } from '@homebook/api-client';

import { setBackendClient } from '@/api/backend';

/** A backend error as the client throws it, carrying only the status code. */
export function apiError(status: number): Error & { responseStatusCode: number } {
  return Object.assign(new Error(`HTTP ${status}`), { responseStatusCode: status });
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : DeepPartial<T[K]> };

/**
 * Installs a mocked backend client. Only the parts a test passes exist; anything else is
 * undefined, so a test never reaches the real backend by accident.
 */
export function mockBackend(parts: DeepPartial<HomeBookClient>): HomeBookClient {
  const client = { baseUrl: '/api', ...parts } as HomeBookClient;
  setBackendClient(client);
  return client;
}
