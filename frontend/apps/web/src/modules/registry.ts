import type { HomeBookModule, StartMenuItemDefinition } from '@homebook/module-sdk';
import { inject, type App, type Component, type InjectionKey } from 'vue';
import type { Router } from 'vue-router';

import type { AppI18n } from '@/locales';

export interface ModuleStartMenuItem extends StartMenuItemDefinition {
  moduleKey: string;
}

/** What the app knows about its modules after registration. */
export interface ModuleRegistry {
  readonly modules: readonly HomeBookModule[];
  /** Start page tiles of every module, in registration order. */
  readonly startMenuItems: readonly ModuleStartMenuItem[];
  /** The result component for a backend search module key, if a module provides one. */
  resolveSearchComponent(searchModuleKey: string): Component | undefined;
  /** The module that handles a backend search module key. */
  findSearchModule(searchModuleKey: string): HomeBookModule | undefined;
}

export const moduleRegistryKey: InjectionKey<ModuleRegistry> = Symbol('homebook.moduleRegistry');

export function createModuleRegistry(modules: readonly HomeBookModule[]): ModuleRegistry {
  const searchOwners = new Map<string, HomeBookModule>();
  for (const module of modules) {
    for (const searchKey of Object.keys(module.searchResultComponents)) {
      searchOwners.set(searchKey, module);
    }
  }

  return {
    modules,
    startMenuItems: modules.flatMap((module) =>
      module.startMenuItems.map((item) => ({ ...item, moduleKey: module.key })),
    ),
    resolveSearchComponent: (searchModuleKey) =>
      searchOwners.get(searchModuleKey)?.searchResultComponents[searchModuleKey],
    findSearchModule: (searchModuleKey) => searchOwners.get(searchModuleKey),
  };
}

/**
 * Registers the modules: their routes go into the router, their catalogs into i18n, their own
 * setup runs, and the registry is provided to every component.
 */
export function registerModules(
  app: App,
  router: Router,
  i18n: AppI18n,
  modules: readonly HomeBookModule[],
): ModuleRegistry {
  const keys = new Set<string>();
  for (const module of modules) {
    if (keys.has(module.key)) {
      throw new Error(`Module ${module.key} is registered twice.`);
    }
    keys.add(module.key);

    for (const route of module.routes) {
      router.addRoute(route);
    }
    for (const [language, messages] of Object.entries(module.messages)) {
      // Module catalogs have their own shape, the app schema does not describe them
      i18n.global.mergeLocaleMessage(language, messages as never);
    }
    module.setup?.(app);
  }

  const registry = createModuleRegistry(modules);
  app.provide(moduleRegistryKey, registry);
  return registry;
}

export function useModuleRegistry(): ModuleRegistry {
  const registry = inject(moduleRegistryKey);
  if (!registry) {
    throw new Error('No module registry provided. registerModules() has to run while the app is created.');
  }
  return registry;
}
