import '@homebook/ui/styles';

import { createHomeBookApp } from '@/bootstrap/createHomeBookApp';
import { renderBootError } from '@/bootstrap/renderBootError';
import { setAppConfig } from '@/composables/useAppConfig';
import { loadAppConfig } from '@/config/loadAppConfig';

const MOUNT_SELECTOR = '#app';

async function bootstrap(): Promise<void> {
  // The configuration comes first: everything below may depend on it
  const config = await loadAppConfig();
  setAppConfig(config);

  // Mounted right away: the app shows its own loading state while the startup sequence runs
  createHomeBookApp(config).app.mount(MOUNT_SELECTOR);
}

bootstrap().catch((error: unknown) => {
  console.error(error);

  const target = document.querySelector(MOUNT_SELECTOR);
  if (target !== null) {
    renderBootError(target, error);
  }
});
