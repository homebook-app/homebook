import { delay } from './timing';

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after the time', async () => {
    const done = vi.fn();
    void delay(1000).then(done);

    await vi.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it('resolves at once for no time or an aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(delay(0)).resolves.toBeUndefined();
    await expect(delay(1000, controller.signal)).resolves.toBeUndefined();
  });

  it('resolves early when the signal aborts meanwhile', async () => {
    const controller = new AbortController();
    const done = vi.fn();
    void delay(60_000, controller.signal).then(done);

    controller.abort();
    await vi.advanceTimersByTimeAsync(0);

    expect(done).toHaveBeenCalled();
  });
});
