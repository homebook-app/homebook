import { onUnmounted, readonly, ref, type Ref } from 'vue';

/** The former `EasingMode` of `UiCountdownAlert`. */
export type UiCountdownEasing = 'linear' | 'easeOutQuad' | 'easeOutCubic' | 'easeOutSine' | 'easeInOutSine';

export interface UseCountdownOptions {
  /** Running time in milliseconds. Zero or less finishes right away. */
  duration: number;
  easing?: UiCountdownEasing;
  /** Takes precedence over `easing`. Gets and returns a value between 0 and 1. */
  easingFn?: (t: number) => number;
  onFinished?: () => void;
}

export interface UseCountdown {
  /** Percentage between 0 and 100. */
  progress: Readonly<Ref<number>>;
}

/** One step per second is enough to show that time is passing without anything moving. */
const REDUCED_MOTION_INTERVAL = 1000;

const EASINGS: Record<UiCountdownEasing, (t: number) => number> = {
  linear: (t) => t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Drives a progress value from 0 to 100 over `duration` and calls `onFinished` once at the end.
 *
 * The options are read once, when the countdown starts. A countdown that changes its duration
 * halfway through has no meaning; to run it again, remount the caller with a new `key` - which
 * is what the Blazor original did too, its loop sat in `OnInitializedAsync`.
 *
 * That original looped `Task.Delay(100)`, which drifts and overruns, and it never stopped on
 * dispose. This runs off `performance.now()`, so it corrects itself, and it cancels in
 * `onUnmounted`. With `prefers-reduced-motion` it steps once a second instead of once a frame:
 * the remaining time stays readable, the continuous movement goes away.
 */
export function useCountdown(options: UseCountdownOptions): UseCountdown {
  const { duration, easing = 'easeOutSine', easingFn, onFinished } = options;
  const ease = easingFn ?? EASINGS[easing];

  const progress = ref(0);

  let frame: number | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let finished = false;

  function stop(): void {
    if (frame !== null) cancelAnimationFrame(frame);
    if (timer !== null) clearInterval(timer);
    frame = null;
    timer = null;
  }

  function finish(): void {
    stop();
    progress.value = 100;

    if (!finished) {
      finished = true;
      onFinished?.();
    }
  }

  const started = performance.now();

  function tick(): void {
    const elapsed = performance.now() - started;

    if (elapsed >= duration) {
      finish();
      return;
    }

    progress.value = clamp01(ease(clamp01(elapsed / duration))) * 100;
  }

  if (duration <= 0) {
    // Still asynchronous, so a caller can attach its listener before this fires
    timer = setInterval(finish, 0);
  } else if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) {
    timer = setInterval(tick, REDUCED_MOTION_INTERVAL);
  } else {
    const step = (): void => {
      tick();
      // `tick` clears the handle once it is done, which ends the loop
      if (frame !== null) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  onUnmounted(stop);

  return { progress: readonly(progress) };
}
