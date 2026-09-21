import { createPinia, setActivePinia } from 'pinia';

import { apiError, mockBackend } from '@/test/backend';

import { INSTANCE_NAME_STORAGE_KEY, useBootstrapStore } from './bootstrap';
import { useLocaleStore } from './locale';

function mockBackendState(availability: () => Promise<number>) {
  const getSetupAvailability = vi.fn(availability);
  mockBackend({
    getSetupAvailability: getSetupAvailability as never,
    api: {
      info: {
        name: { get: async () => 'Villa Kunterbunt' },
        defaultLocale: { get: async () => 'de-DE' },
        devmode: { get: async () => ({ isActive: true }) },
      },
    } as never,
  });
  return getSetupAvailability;
}

describe('useBootstrapStore', () => {
  let initializeLocale: ReturnType<typeof vi.fn<(instanceDefault: string | null) => Promise<void>>>;

  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    initializeLocale = vi.fn<(instanceDefault: string | null) => Promise<void>>(async () => undefined);
    vi.spyOn(useLocaleStore(), 'initialize').mockImplementation(initializeLocale);
  });

  it('loads the instance data when the backend is operational', async () => {
    mockBackendState(async () => 204);
    const store = useBootstrapStore();

    await expect(store.start()).resolves.toBe('ready');

    expect(store.status).toBe('ready');
    expect(store.instanceName).toBe('Villa Kunterbunt');
    expect(store.defaultLocale).toBe('de-DE');
    expect(store.devMode).toBe(true);
    expect(localStorage.getItem(INSTANCE_NAME_STORAGE_KEY)).toBe('Villa Kunterbunt');
    expect(initializeLocale).toHaveBeenCalledWith('de-DE');
  });

  it.each([
    [200, 'setupRequired'],
    [201, 'updateRequired'],
    [409, 'setupRunning'],
  ] as const)('maps status %i to %s without an instance default', async (code, expected) => {
    mockBackendState(async () => code);
    const store = useBootstrapStore();

    await expect(store.start()).resolves.toBe(expected);

    expect(initializeLocale).toHaveBeenCalledWith(null);
  });

  it('reports an unreachable backend', async () => {
    mockBackendState(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(useBootstrapStore().start()).resolves.toBe('unreachable');
  });

  it('reports an unexpected status as unreachable', async () => {
    mockBackendState(() => Promise.reject(apiError(500)));

    await expect(useBootstrapStore().start()).resolves.toBe('unreachable');
  });

  it('runs once for every caller', async () => {
    const availability = mockBackendState(async () => 204);
    const store = useBootstrapStore();

    await Promise.all([store.start(), store.start()]);

    expect(availability).toHaveBeenCalledOnce();
  });

  it('runs again on retry', async () => {
    const availability = mockBackendState(() => Promise.reject(new TypeError('Failed to fetch')));
    const store = useBootstrapStore();
    await store.start();

    availability.mockImplementation(async () => 204);
    await expect(store.retry()).resolves.toBe('ready');

    expect(availability).toHaveBeenCalledTimes(2);
  });

  it('shows the cached instance name before the backend answers', () => {
    localStorage.setItem(INSTANCE_NAME_STORAGE_KEY, 'Cached');

    expect(useBootstrapStore().instanceName).toBe('Cached');
  });
});
