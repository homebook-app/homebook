import { isBackendApiError, statusCodeOf, type SetupAvailability } from '@homebook/api-client';
import { onScopeDispose, shallowRef } from 'vue';

import { waitForBackendRestart } from '@/setup/waitForBackendRestart';

/**
 * - `idle` not started yet
 * - `running` the request is out or the backend is restarting
 * - `finished` the backend is back in the expected state
 * - `failed` see the error of the step
 */
export type RestartingProcessPhase = 'idle' | 'running' | 'finished' | 'failed';

// nginx answers these while the backend behind it is gone, the backend itself never does here
const GATEWAY_STATUSES = new Set([502, 503, 504]);

export interface RestartingProcessOptions {
  /** Sends the request that makes the backend stop itself afterwards. */
  start: () => Promise<unknown>;
  /** Availability answers that mean the work is done. */
  accept: readonly SetupAvailability[];
  /** Maps a status code of the request to the catalog key of its error. */
  errorKey: (status: number) => string;
  /** Catalog key shown when the backend did not come back in time. */
  restartErrorKey: string;
  onFailed: (key: string) => void;
  onFinished: () => void;
}

/**
 * A backend process that ends with the backend stopping itself: `POST /setup/start` and
 * `POST /update/start`. The container restarts it. A request that dies on the way - no answer,
 * a refused connection, nginx answering 502 to 504 for the vanished upstream - is therefore
 * normal and never reported; only an answer of the backend itself is an error. After that the
 * availability is polled until the backend is back.
 */
export function useRestartingProcess(options: RestartingProcessOptions) {
  const phase = shallowRef<RestartingProcessPhase>('idle');
  let controller: AbortController | undefined;

  async function run(): Promise<void> {
    if (phase.value === 'running') {
      return;
    }
    phase.value = 'running';
    controller = new AbortController();
    const { signal } = controller;

    try {
      await options.start();
    } catch (error) {
      if (isBackendApiError(error) && !GATEWAY_STATUSES.has(statusCodeOf(error) ?? 0)) {
        phase.value = 'failed';
        options.onFailed(options.errorKey(statusCodeOf(error) ?? 0));
        return;
      }
      // The backend went down on its way to the restart
    }

    const back = await waitForBackendRestart({ accept: options.accept, signal });
    if (signal.aborted) {
      return;
    }
    if (back) {
      phase.value = 'finished';
      options.onFinished();
    } else {
      phase.value = 'failed';
      options.onFailed(options.restartErrorKey);
    }
  }

  onScopeDispose(() => controller?.abort());

  return { phase, run };
}
