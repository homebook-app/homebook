import { createBackendClient, type FetchFunction, type HomeBookClient } from '@homebook/api-client';
import { backendClientKey } from '@homebook/module-sdk';
import { primeVueOptions } from '@homebook/ui';
import { createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import { createApp, watch, type App as VueApp } from 'vue';
import type { Router, RouterHistory } from 'vue-router';

import { setBackendClient } from '@/api/backend';
import App from '@/App.vue';
import type { AppConfig } from '@/config/appConfig';
import { createAppI18n, type AppI18n } from '@/locales';
import { createAppRouter, installGuards, loginLocation, RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useLocaleStore } from '@/stores/locale';

export interface HomeBookAppOptions {
  history?: RouterHistory;
  fetch?: FetchFunction;
}

export interface HomeBookApp {
  app: VueApp;
  router: Router;
  pinia: Pinia;
  i18n: AppI18n;
  client: HomeBookClient;
}

/**
 * There is no token refresh. A 401 ends the session: the local state is cleared and the user is
 * sent to the login page with a hint. Ignored without a session, e.g. for a failed login.
 */
function createUnauthorizedHandler(router: Router, pinia: Pinia): () => void {
  return () => {
    const auth = useAuthStore(pinia);
    if (!auth.hasSession) {
      return;
    }
    auth.clear();
    const current = router.currentRoute.value;
    if (current.name !== RouteNames.login) {
      void router.replace(loginLocation(current.fullPath, true));
    }
  };
}

/**
 * Creates the app with everything it needs: PrimeVue, Pinia, router, i18n and the backend
 * client. The startup sequence begins right away; the router waits for it.
 */
export function createHomeBookApp(config: AppConfig, options: HomeBookAppOptions = {}): HomeBookApp {
  const app = createApp(App);
  const pinia = createPinia();
  const router = createAppRouter(options.history);
  const i18n = createAppI18n();

  app.use(PrimeVue, primeVueOptions);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.use(DialogService);
  app.use(pinia);

  const auth = useAuthStore(pinia);
  const client = createBackendClient({
    baseUrl: config.backendHost,
    getAccessToken: () => auth.token,
    onUnauthorized: createUnauthorizedHandler(router, pinia),
    fetch: options.fetch,
  });
  setBackendClient(client);
  app.provide(backendClientKey, client);

  // The locale store decides, vue-i18n and the document follow without a reload
  const locale = useLocaleStore(pinia);
  watch(
    () => locale.locale,
    (value) => {
      i18n.global.locale.value = value;
      document.documentElement.lang = value;
    },
    { immediate: true },
  );

  installGuards(router, pinia);
  app.use(router);
  app.use(i18n);

  void useBootstrapStore(pinia).start();

  return { app, router, pinia, i18n, client };
}
