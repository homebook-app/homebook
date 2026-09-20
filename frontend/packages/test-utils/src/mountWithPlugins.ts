import { mount, type ComponentMountingOptions, type VueWrapper } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import type { Component } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';

import { createTestPlugins, type TestPluginOptions } from './plugins';

export interface MountWithPluginsOptions extends TestPluginOptions {
  /** Path the router navigates to before mounting, defaults to `/`. */
  initialRoute?: string;
}

export interface MountWithPluginsResult {
  wrapper: VueWrapper;
  router: Router;
  pinia: Pinia;
  i18n: I18n;
}

/**
 * Mounts a component with PrimeVue, vue-i18n, a fresh Pinia and a memory router installed.
 *
 * Accepts every `mount` option of `@vue/test-utils`; `global.plugins` passed by the caller are
 * installed after the built-in ones.
 */
export async function mountWithPlugins(
  component: Component,
  options: ComponentMountingOptions<Component> & MountWithPluginsOptions = {},
): Promise<MountWithPluginsResult> {
  const { locale, messages, routes, pinia: providedPinia, initialRoute, ...mountOptions } = options;
  const { pinia, router, i18n, plugins } = createTestPlugins({ locale, messages, routes, pinia: providedPinia });

  await router.push(initialRoute ?? '/');
  await router.isReady();

  const wrapper = mount(component, {
    ...mountOptions,
    global: {
      ...mountOptions.global,
      plugins: [...plugins, ...(mountOptions.global?.plugins ?? [])],
    },
  });

  return { wrapper, router, pinia, i18n };
}
