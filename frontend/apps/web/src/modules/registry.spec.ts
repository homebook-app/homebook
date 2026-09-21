import { defineModule, type HomeBookModule } from '@homebook/module-sdk';
import { createApp, h } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { createAppI18n } from '@/locales';

import { modules } from './index';
import { createModuleRegistry, moduleRegistryKey, registerModules, useModuleRegistry } from './registry';

const Results = { render: () => h('ul') };
const Page = { render: () => h('main') };

function testModule(overrides: Partial<HomeBookModule> = {}): HomeBookModule {
  return defineModule({
    key: 'homebook.test',
    nameKey: 'test.moduleName',
    descriptionKey: 'test.moduleDescription',
    icon: { set: 'liquid-glass-color', name: 'Help' },
    routes: [{ path: '/Test/Page', name: 'test-page', component: Page }],
    startMenuItems: [
      { titleKey: 'test.tile.title', captionKey: 'test.tile.caption', url: '/Test/Page', icon: 'Graph', color: 'red' },
    ],
    widgets: [],
    searchResultComponents: { 'HomeBook.Backend.Module.Test.Module.TestSearchHandler': Results },
    messages: { en: { test: { moduleName: 'Test' } }, de: { test: { moduleName: 'Probe' } } },
    ...overrides,
  });
}

function setup(registered: HomeBookModule[]) {
  const app = createApp(Page);
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  const i18n = createAppI18n();
  const registry = registerModules(app, router, i18n, registered);
  return { app, router, i18n, registry };
}

describe('registerModules', () => {
  it('adds the module routes', async () => {
    const { router } = setup([testModule()]);

    await router.push('/Test/Page');

    expect(router.currentRoute.value.name).toBe('test-page');
  });

  it('merges the module catalogs into every language', () => {
    const { i18n } = setup([testModule()]);

    expect(i18n.global.t('test.moduleName')).toBe('Test');
    i18n.global.locale.value = 'de';
    expect(i18n.global.t('test.moduleName')).toBe('Probe');
  });

  it('runs the module setup with the app', () => {
    const setupModule = vi.fn();
    const { app } = setup([testModule({ setup: setupModule })]);

    expect(setupModule).toHaveBeenCalledWith(app);
  });

  it('provides the registry', () => {
    const { app, registry } = setup([testModule()]);

    expect(app.runWithContext(() => useModuleRegistry())).toBe(registry);
  });

  it('refuses a module registered twice', () => {
    expect(() => setup([testModule(), testModule()])).toThrow('registered twice');
  });
});

describe('createModuleRegistry', () => {
  it('collects the start menu items with their module', () => {
    const registry = createModuleRegistry([testModule()]);

    expect(registry.startMenuItems).toEqual([
      expect.objectContaining({ moduleKey: 'homebook.test', url: '/Test/Page' }),
    ]);
  });

  it('resolves search result components by the backend handler name', () => {
    const module = testModule();
    const registry = createModuleRegistry([module]);

    expect(registry.resolveSearchComponent('HomeBook.Backend.Module.Test.Module.TestSearchHandler')).toBe(Results);
    expect(registry.findSearchModule('HomeBook.Backend.Module.Test.Module.TestSearchHandler')).toBe(module);
    expect(registry.resolveSearchComponent('Unknown.Handler')).toBeUndefined();
  });
});

describe('the modules of this build', () => {
  it('registers kitchen, finances and platform info', () => {
    expect(modules.map((module) => module.key)).toEqual([
      'homebook.kitchen',
      'homebook.finances',
      'homebook.platforminfo',
    ]);
  });

  it('offers the kitchen and finances tiles on the start page', () => {
    expect(createModuleRegistry(modules).startMenuItems.map((item) => item.url)).toEqual([
      '/Kitchen/Recipes',
      '/Kitchen/Pantry',
      '/Kitchen/MealPlan',
      '/Finances',
    ]);
  });

  it('fails loudly without a provided registry', () => {
    const app = createApp(Page);

    expect(() => app.runWithContext(() => useModuleRegistry())).toThrow('No module registry provided');
    expect(moduleRegistryKey).toBeTypeOf('symbol');
  });
});
