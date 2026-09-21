import { shallowRef } from 'vue';

import { message, type Message } from '@/setup/messages';
import type { SetupStepKey } from '@/setup/steps';
import { delay, setupTiming } from '@/setup/timing';
import { useSetupStore } from '@/stores/setup';

export interface StepSuccess extends Message {
  skipped: boolean;
}

/**
 * What every step of the setup wizard shares: a busy flag, the error it shows, and the countdown
 * after it succeeded. A step validates and submits on its own; it reports back through
 * {@link fail}, {@link succeed} (countdown first) or {@link complete} (right away).
 */
export function useSetupStep(key: SetupStepKey) {
  const setup = useSetupStore();

  const busy = shallowRef(false);
  const error = shallowRef<Message>();
  const success = shallowRef<StepSuccess>();

  /**
   * Runs a check. It takes at least `minDurationMs` either way, as in the Blazor wizard, so a fast
   * answer does not make the spinner flicker.
   */
  async function run<T>(task: () => Promise<T>, minDurationMs = 0): Promise<T> {
    busy.value = true;
    error.value = undefined;
    setup.clearError(key);
    try {
      const [result] = await Promise.allSettled([task(), delay(minDurationMs)]);
      if (result.status === 'rejected') {
        throw result.reason;
      }
      return result.value;
    } finally {
      busy.value = false;
    }
  }

  /** Shows the error and marks the step in the step list. */
  function fail(messageKey: string, params?: Message['params']): void {
    error.value = message(messageKey, params);
    setup.failStep(key);
  }

  /** Shows the countdown; the step completes when it runs out, see {@link finish}. */
  function succeed(messageKey: string, params?: Message['params'], options: { skipped?: boolean } = {}): void {
    error.value = undefined;
    success.value = { ...message(messageKey, params), skipped: options.skipped === true };
  }

  /** Called when the countdown ran out. */
  function finish(): void {
    if (success.value !== undefined) {
      complete({ skipped: success.value.skipped });
    }
  }

  /** Completes the step without a countdown. */
  function complete(options: { skipped?: boolean } = {}): void {
    setup.completeStep(key, options);
  }

  return { busy, error, success, run, fail, succeed, finish, complete, countdownMs: setupTiming.countdownMs };
}
