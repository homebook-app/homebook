import type { HomeBookClient } from '@homebook/api-client';
import { inject, type InjectionKey } from 'vue';

/** Injection key under which the app provides its single backend client. */
export const backendClientKey: InjectionKey<HomeBookClient> = Symbol('homebook.backendClient');

/**
 * Returns the backend client provided by the app. Modules reach the backend only through it,
 * so they share the app's token handling and its 401 callback.
 */
export function useBackendClient(): HomeBookClient {
  const client = inject(backendClientKey);
  if (!client) {
    throw new Error('No backend client provided. The app must provide one under backendClientKey.');
  }
  return client;
}
