import { effectScope } from 'vue';

import { DEFAULT_SETUP_TIMING, setupTiming } from '@/setup/timing';
import { apiError, mockBackend } from '@/test/backend';

import { useRestartingProcess, type RestartingProcessOptions } from './useRestartingProcess';

function create(options: Partial<RestartingProcessOptions> = {}) {
  const onFailed = vi.fn();
  const onFinished = vi.fn();
  const scope = effectScope();
  const process = scope.run(() =>
    useRestartingProcess({
      start: async () => undefined,
      accept: [204],
      errorKey: (status) => `error.${status}`,
      restartErrorKey: 'error.restart',
      onFailed,
      onFinished,
      ...options,
    }),
  )!;
  return { ...process, onFailed, onFinished, scope };
}

describe('useRestartingProcess', () => {
  beforeEach(() => {
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING, {
      restartInitialDelayMs: 0,
      restartIntervalMs: 10,
      restartTimeoutMs: 1000,
    });
  });

  afterEach(() => {
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING);
  });

  it('finishes once the backend is back', async () => {
    const availability = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue(204);
    mockBackend({ getSetupAvailability: availability });
    const { phase, run, onFinished, onFailed } = create();

    await run();

    expect(phase.value).toBe('finished');
    expect(onFinished).toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
  });

  it.each([
    ['a dropped connection', new TypeError('Failed to fetch')],
    ['a gateway error of nginx', apiError(502)],
    ['an unavailable upstream', apiError(503)],
  ])('treats %s as the expected restart', async (_label, failure) => {
    mockBackend({ getSetupAvailability: vi.fn().mockResolvedValue(204) });
    const { phase, run, onFailed } = create({ start: () => Promise.reject(failure) });

    await run();

    expect(phase.value).toBe('finished');
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('reports an answer of the backend by its status code and does not poll', async () => {
    const availability = vi.fn();
    mockBackend({ getSetupAvailability: availability });
    const { phase, run, onFailed } = create({ start: () => Promise.reject(apiError(422)) });

    await run();

    expect(phase.value).toBe('failed');
    expect(onFailed).toHaveBeenCalledWith('error.422');
    expect(availability).not.toHaveBeenCalled();
  });

  it('reports a backend that does not come back', async () => {
    vi.useFakeTimers();
    try {
      mockBackend({ getSetupAvailability: vi.fn().mockResolvedValue(201) });
      const { phase, run, onFailed } = create();

      const running = run();
      await vi.advanceTimersByTimeAsync(2000);
      await running;

      expect(phase.value).toBe('failed');
      expect(onFailed).toHaveBeenCalledWith('error.restart');
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores a second start while running', async () => {
    mockBackend({ getSetupAvailability: vi.fn().mockResolvedValue(204) });
    const start = vi.fn(async () => undefined);
    const { run } = create({ start });

    await Promise.all([run(), run()]);

    expect(start).toHaveBeenCalledTimes(1);
  });

  it('stops polling when its scope ends', async () => {
    Object.assign(setupTiming, { restartInitialDelayMs: 60_000 });
    const availability = vi.fn();
    mockBackend({ getSetupAvailability: availability });
    const { phase, run, onFailed, onFinished, scope } = create();

    const running = run();
    scope.stop();
    await running;

    expect(availability).not.toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
    expect(onFinished).not.toHaveBeenCalled();
    expect(phase.value).toBe('running');
  });
});
