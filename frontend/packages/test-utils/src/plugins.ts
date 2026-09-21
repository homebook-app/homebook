import { primeVueOptions } from '@homebook/ui/theme';
import { createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import { defineComponent, h, type Plugin } from 'vue';
import { createI18n, type I18n, type I18nOptions } from 'vue-i18n';
import { createMemoryHistory, createRouter, type Router, type RouteRecordRaw } from 'vue-router';

export type TestMessages = NonNullable<I18nOptions['messages']>;

export interface TestPluginOptions {
  /** Active locale, defaults to `en`. */
  locale?: string;
  /** Message catalogs by locale. Empty by default, so `t('some.key')` renders the key. */
  messages?: TestMessages;
  /** Routes of the memory router. Defaults to a catch-all rendering nothing. */
  routes?: RouteRecordRaw[];
  /** Reuse a Pinia instance, e.g. one prepared before mounting. A fresh one is created otherwise. */
  pinia?: Pinia;
}

export interface TestPlugins {
  pinia: Pinia;
  router: Router;
  i18n: I18n;
  /** Ready to be passed to `global.plugins`. */
  plugins: Plugin[];
}

const EmptyRoute = defineComponent({ name: 'EmptyRoute', render: () => h('div') });

const fallbackRoutes: RouteRecordRaw[] = [{ path: '/:pathMatch(.*)*', name: 'test-fallback', component: EmptyRoute }];

/** Creates the plugin set every component test runs with. Nothing is shared between calls. */
export function createTestPlugins(options: TestPluginOptions = {}): TestPlugins {
  const pinia = options.pinia ?? createPinia();

  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes ?? fallbackRoutes,
  });

  const i18n = createI18n({
    legacy: false,
    locale: options.locale ?? 'en',
    fallbackLocale: 'en',
    messages: options.messages ?? {},
    // Tests assert on keys, a missing translation is the expected case
    missingWarn: false,
    fallbackWarn: false,
  }) as I18n;

  const primeVue: Plugin = { install: (app) => app.use(PrimeVue, primeVueOptions) };

  return {
    pinia,
    router,
    i18n,
    plugins: [pinia, router, i18n, primeVue, ToastService, ConfirmationService, DialogService],
  };
}
