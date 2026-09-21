import type { HomeBookClient } from '@homebook/api-client';

let current: HomeBookClient | undefined;

/** Called once while the app is created. Tests call it with a mocked client. */
export function setBackendClient(client: HomeBookClient): void {
  current = client;
}

/**
 * The app's single backend client. A module singleton like the app config, so stores and router
 * guards reach it without a component context. Components use `useBackendClient()` from
 * `@homebook/module-sdk`, which returns the same instance.
 */
export function useBackend(): HomeBookClient {
  if (current === undefined) {
    throw new Error('Backend client is not created yet. setBackendClient() has to run before useBackend().');
  }
  return current;
}
