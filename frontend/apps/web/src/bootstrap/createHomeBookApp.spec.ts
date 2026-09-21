import { createBackendClient } from '@homebook/api-client';
import { backendClientKey } from '@homebook/module-sdk';
import { nextTick } from 'vue';
import { createMemoryHistory } from 'vue-router';

import { useBackend } from '@/api/backend';
import type { AppConfig } from '@/config/appConfig';
import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useLocaleStore } from '@/stores/locale';

import { createHomeBookApp } from './createHomeBookApp';

const config: AppConfig = {
  version: '1.0.0',
  backendHost: '/backend',
  features: { widgetMenu: false },
  upload: { maxFileSizeBytes: 1024 },
};

interface ClientOptions {
  baseUrl?: string;
  getAccessToken: () => string | null | undefined;
  onUnauthorized: () => void;
}

function lastClientOptions(): ClientOptions {
  return vi.mocked(createBackendClient).mock.lastCall?.[0] as unknown as ClientOptions;
}

function create() {
  const created = createHomeBookApp(config, { history: createMemoryHistory() });
  // The startup sequence is not under test here
  vi.spyOn(useBootstrapStore(created.pinia), 'start').mockResolvedValue('ready');
  return created;
}

describe('createHomeBookApp', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('creates one backend client with the configured base URL and provides it', () => {
    const { app, client } = create();

    expect(lastClientOptions().baseUrl).toBe('/backend');
    expect(useBackend()).toBe(client);
    expect(app.runWithContext(() => app._context.provides[backendClientKey as symbol])).toBe(client);
  });

  it('hands the current token to the client', () => {
    const { pinia } = create();

    useAuthStore(pinia).token = 'abc';

    expect(lastClientOptions().getAccessToken()).toBe('abc');
  });

  it('ends the session on 401 and sends the user to the login page', async () => {
    const { pinia, router } = create();
    const auth = useAuthStore(pinia);
    // Valid as far as the frontend knows, the backend disagrees
    auth.token = 'revoked';
    auth.expiresAt = new Date(Date.now() + 60_000);
    await router.replace('/Settings/About').catch(() => undefined);
    expect(router.currentRoute.value.path).toBe('/Settings/About');

    lastClientOptions().onUnauthorized();

    expect(auth.token).toBeNull();
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/Login'));
    expect(router.currentRoute.value.query.reason).toBe('expired');
  });

  it('ignores a 401 without a session, e.g. rejected credentials', async () => {
    const { pinia, router } = create();
    await router.replace('/Login').catch(() => undefined);
    const replace = vi.spyOn(router, 'replace');

    lastClientOptions().onUnauthorized();

    expect(useAuthStore(pinia).token).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('registers the modules with their routes and tiles', () => {
    const { router, registry } = create();

    expect(router.resolve('/Kitchen/MealPlan').name).toBe('kitchen-meal-plan');
    expect(router.resolve('/Finances/Savings/Add').name).toBe('finances-savings-add');
    expect(registry.startMenuItems).toHaveLength(4);
  });

  it('switches the language without a reload', async () => {
    const { pinia, i18n } = create();

    useLocaleStore(pinia).locale = 'de';
    await nextTick();

    expect(i18n.global.locale.value).toBe('de');
    expect(document.documentElement.lang).toBe('de');
  });
});
