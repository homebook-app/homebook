import type { AppConfig } from '@/config/appConfig';

let current: AppConfig | undefined;

/** Called once by `main.ts` after the configuration is loaded. Tests call it with a fixture. */
export function setAppConfig(config: AppConfig): void {
  current = config;
}

/**
 * The runtime configuration. A module singleton rather than provide/inject, so stores, router
 * guards and the API client factory can read it without a component context.
 */
export function useAppConfig(): AppConfig {
  if (current === undefined) {
    throw new Error('App config is not loaded yet. setAppConfig() has to run before useAppConfig().');
  }
  return current;
}
