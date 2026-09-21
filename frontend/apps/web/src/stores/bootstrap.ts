import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import { useBackend } from '@/api/backend';

import { useLocaleStore } from './locale';

/**
 * - `loading` while the sequence runs
 * - `ready` the instance is operational
 * - `setupRequired` / `updateRequired` the router sends everything to `/Setup`
 * - `setupRunning` another setup is in progress, nothing to do but wait
 * - `unreachable` the backend did not answer as expected
 */
export type BootStatus =
  'idle' | 'loading' | 'ready' | 'setupRequired' | 'updateRequired' | 'setupRunning' | 'unreachable';

/** localStorage key of the cached instance name, unchanged from the Blazor frontend. */
export const INSTANCE_NAME_STORAGE_KEY = 'HomeBook.Name';

function cacheInstanceName(name: string): void {
  try {
    localStorage.setItem(INSTANCE_NAME_STORAGE_KEY, name);
  } catch {
    // Only a cache
  }
}

function cachedInstanceName(): string {
  try {
    return localStorage.getItem(INSTANCE_NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * The startup sequence. It asks the backend for its state, loads the instance data and picks the
 * language. Router guards wait for it, so no page renders before it is done.
 */
export const useBootstrapStore = defineStore('bootstrap', () => {
  const status = shallowRef<BootStatus>('idle');
  const instanceName = shallowRef(cachedInstanceName());
  const defaultLocale = shallowRef<string | null>(null);
  const devMode = shallowRef(false);

  let running: Promise<BootStatus> | undefined;

  async function loadInstance(): Promise<void> {
    const { api } = useBackend();
    const [name, locale, devmode] = await Promise.all([
      api.info.name.get(),
      api.info.defaultLocale.get(),
      api.info.devmode.get(),
    ]);
    instanceName.value = name ?? '';
    cacheInstanceName(instanceName.value);
    defaultLocale.value = locale ?? null;
    devMode.value = devmode?.isActive === true;
  }

  async function evaluate(): Promise<BootStatus> {
    try {
      switch (await useBackend().getSetupAvailability()) {
        case 200:
          return 'setupRequired';
        case 201:
          return 'updateRequired';
        case 409:
          return 'setupRunning';
        case 204:
          await loadInstance();
          return 'ready';
      }
    } catch (error) {
      console.error(error);
      return 'unreachable';
    }
  }

  async function run(): Promise<BootStatus> {
    status.value = 'loading';
    const next = await evaluate();
    // Outside the operational state there is no instance default, but the setup wizard and the
    // error page still need a language
    await useLocaleStore().initialize(next === 'ready' ? defaultLocale.value : null);
    status.value = next;
    return next;
  }

  /** Runs the sequence once. Every caller gets the same promise. */
  function start(): Promise<BootStatus> {
    running ??= run();
    return running;
  }

  /** Runs the sequence again, e.g. after the backend was unreachable. */
  function retry(): Promise<BootStatus> {
    running = undefined;
    return start();
  }

  return { status, instanceName, defaultLocale, devMode, start, retry };
});
