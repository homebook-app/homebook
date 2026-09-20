import type { AppConfig } from '@/config/appConfig';

const fixture: AppConfig = {
  version: '1.0.42',
  backendHost: '/api',
  features: { widgetMenu: false },
  upload: { maxFileSizeBytes: 1024 },
};

describe('useAppConfig', () => {
  beforeEach(() => {
    // The configuration is a module singleton, every test starts with a fresh module
    vi.resetModules();
  });

  it('throws while no configuration is set', async () => {
    const { useAppConfig } = await import('./useAppConfig');

    expect(() => useAppConfig()).toThrowError();
  });

  it('returns the configuration that was set', async () => {
    const { setAppConfig, useAppConfig } = await import('./useAppConfig');

    setAppConfig(fixture);

    expect(useAppConfig()).toBe(fixture);
  });
});
