import type { SetupAvailability } from '@homebook/api-client';

import { useBackend } from '@/api/backend';

import { delay, setupTiming } from './timing';

export interface WaitForRestartOptions {
  /** Availability answers that mean the backend is back in the expected state. */
  accept: readonly SetupAvailability[];
  signal?: AbortSignal;
}

/**
 * Waits for the backend to come back after it stopped itself. Every failure while it is away -
 * refused connections, gateway errors, anything - is expected and just means "not yet".
 *
 * @returns `true` once the backend answers with one of `accept`, `false` after the timeout or
 * when `signal` aborts.
 */
export async function waitForBackendRestart({ accept, signal }: WaitForRestartOptions): Promise<boolean> {
  const { restartInitialDelayMs, restartIntervalMs, restartTimeoutMs } = setupTiming;
  const deadline = Date.now() + restartTimeoutMs;

  await delay(restartInitialDelayMs, signal);
  while (signal?.aborted !== true) {
    try {
      if (accept.includes(await useBackend().getSetupAvailability())) {
        return true;
      }
    } catch {
      // Still restarting
    }
    if (Date.now() + restartIntervalMs > deadline) {
      return false;
    }
    await delay(restartIntervalMs, signal);
  }
  return false;
}
