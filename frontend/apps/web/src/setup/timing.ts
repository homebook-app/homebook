/**
 * The pauses of the setup wizard, taken over from the Blazor frontend. A mutable object so the
 * specs can shorten them; nothing in the app writes to it.
 */
export const setupTiming = {
  /** A check is shown at least this long, a flicker of a spinner reads as a glitch. */
  minCheckDurationMs: 2000,
  /** Running time of the countdown after a step succeeded. */
  countdownMs: 5000,
  /** First look at the backend after it was told to restart. */
  restartInitialDelayMs: 10_000,
  restartIntervalMs: 5000,
  restartTimeoutMs: 5 * 60_000,
  /** Pause between the stages of the closing animation. */
  finishStageMs: 1000,
};

export const DEFAULT_SETUP_TIMING = Object.freeze({ ...setupTiming });

/** Resolves after `ms`, or right away once `signal` aborts. */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (ms <= 0 || signal?.aborted === true) {
      resolve();
      return;
    }
    const timer = setTimeout(done, ms);
    signal?.addEventListener('abort', done, { once: true });
    function done(): void {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    }
  });
}
