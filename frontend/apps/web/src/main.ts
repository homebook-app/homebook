import '@homebook/ui/styles';

import { primeVueOptions } from '@homebook/ui';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';

import App from '@/App.vue';
import { renderBootError } from '@/bootstrap/renderBootError';
import { setAppConfig } from '@/composables/useAppConfig';
import { loadAppConfig } from '@/config/loadAppConfig';
import { createAppI18n } from '@/locales';
import { createAppRouter } from '@/router';

const MOUNT_SELECTOR = '#app';

async function bootstrap(): Promise<void> {
  // The configuration comes first: everything below may depend on it
  setAppConfig(await loadAppConfig());

  const app = createApp(App);
  const router = createAppRouter();

  app.use(PrimeVue, primeVueOptions);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.use(DialogService);
  app.use(createPinia());
  app.use(router);
  app.use(createAppI18n());

  await router.isReady();
  app.mount(MOUNT_SELECTOR);
}

bootstrap().catch((error: unknown) => {
  console.error(error);

  const target = document.querySelector(MOUNT_SELECTOR);
  if (target !== null) {
    renderBootError(target, error);
  }
});
