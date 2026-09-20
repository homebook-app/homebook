import { mountWithPlugins } from '@homebook/test-utils';
import { defineComponent, type Ref } from 'vue';

import { useCountdown, type UiCountdownEasing, type UseCountdownOptions } from './useCountdown';

/** Drives `requestAnimationFrame` by hand, so a test decides when a frame happens. */
function stubFrames() {
  const callbacks = new Map<number, FrameRequestCallback>();
  let next = 1;

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callbacks.set(next, callback);
    return next++;
  });
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => callbacks.delete(handle));

  return {
    get pending() {
      return callbacks.size;
    },
    run() {
      const due = [...callbacks.entries()];
      callbacks.clear();
      for (const [, callback] of due) callback(performance.now());
    },
  };
}

function reducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
}

async function mountCountdown(options: UseCountdownOptions) {
  let progress!: Readonly<Ref<number>>;

  const { wrapper } = await mountWithPlugins(
    defineComponent({
      setup() {
        ({ progress } = useCountdown(options));
        return () => null;
      },
    }),
  );

  return { wrapper, progress: () => progress.value };
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('eases the progress from 0 to 100 over the duration', async () => {
    const frames = stubFrames();
    const { progress } = await mountCountdown({ duration: 1000, easing: 'linear' });

    vi.advanceTimersByTime(500);
    frames.run();
    expect(progress()).toBeCloseTo(50, 5);

    vi.advanceTimersByTime(500);
    frames.run();
    expect(progress()).toBe(100);
  });

  it('applies each easing mode', async () => {
    const expected: Record<UiCountdownEasing, number> = {
      linear: 50,
      easeOutQuad: 75,
      easeOutCubic: 87.5,
      easeOutSine: 70.71,
      easeInOutSine: 50,
    };

    for (const [easing, halfway] of Object.entries(expected)) {
      const frames = stubFrames();
      const { progress } = await mountCountdown({ duration: 1000, easing: easing as UiCountdownEasing });

      vi.advanceTimersByTime(500);
      frames.run();

      expect(progress(), easing).toBeCloseTo(halfway, 1);
    }
  });

  it('lets a custom easing beat the named one', async () => {
    const frames = stubFrames();
    const { progress } = await mountCountdown({ duration: 1000, easing: 'linear', easingFn: () => 0.25 });

    vi.advanceTimersByTime(500);
    frames.run();

    expect(progress()).toBe(25);
  });

  it('clamps an easing that leaves the unit interval', async () => {
    const frames = stubFrames();
    const { progress } = await mountCountdown({ duration: 1000, easingFn: (t) => t * 10 - 5 });

    vi.advanceTimersByTime(100);
    frames.run();
    expect(progress()).toBe(0);

    vi.advanceTimersByTime(500);
    frames.run();
    expect(progress()).toBe(100);
  });

  it('reports the end exactly once', async () => {
    const frames = stubFrames();
    const onFinished = vi.fn();
    await mountCountdown({ duration: 100, onFinished });

    vi.advanceTimersByTime(200);
    frames.run();
    frames.run();

    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it('finishes right away for a duration of zero', async () => {
    const onFinished = vi.fn();
    const { progress } = await mountCountdown({ duration: 0, onFinished });

    expect(onFinished).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(onFinished).toHaveBeenCalledTimes(1);
    expect(progress()).toBe(100);
  });

  it('stops when the component goes away', async () => {
    const frames = stubFrames();
    const onFinished = vi.fn();
    const { wrapper } = await mountCountdown({ duration: 1000, onFinished });

    expect(frames.pending).toBe(1);
    wrapper.unmount();

    expect(frames.pending).toBe(0);
    vi.advanceTimersByTime(2000);
    expect(onFinished).not.toHaveBeenCalled();
  });

  it('steps once a second instead of once a frame when motion is unwelcome', async () => {
    reducedMotion(true);
    const frames = stubFrames();
    const { progress } = await mountCountdown({ duration: 4000, easing: 'linear' });

    expect(frames.pending).toBe(0);

    vi.advanceTimersByTime(1000);
    expect(progress()).toBeCloseTo(25, 5);

    vi.advanceTimersByTime(3000);
    expect(progress()).toBe(100);
  });
});
