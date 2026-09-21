import { apiError, mockBackend } from '@/test/backend';

import { DEFAULT_SETUP_TIMING, setupTiming } from './timing';
import { waitForBackendRestart } from './waitForBackendRestart';

describe('waitForBackendRestart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits first, then polls until the backend answers as expected', async () => {
    const availability = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(apiError(502))
      .mockResolvedValueOnce(200)
      .mockResolvedValueOnce(204);
    mockBackend({ getSetupAvailability: availability });

    const result = waitForBackendRestart({ accept: [204] });

    await vi.advanceTimersByTimeAsync(9999);
    expect(availability).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1 + 3 * 5000);

    await expect(result).resolves.toBe(true);
    expect(availability).toHaveBeenCalledTimes(4);
  });

  it('accepts any of the given answers', async () => {
    mockBackend({ getSetupAvailability: vi.fn().mockResolvedValue(201) });

    const result = waitForBackendRestart({ accept: [201, 204] });
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(result).resolves.toBe(true);
  });

  it('gives up after five minutes', async () => {
    const availability = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    mockBackend({ getSetupAvailability: availability });

    const result = waitForBackendRestart({ accept: [204] });
    await vi.advanceTimersByTimeAsync(5 * 60_000);

    await expect(result).resolves.toBe(false);
    // 10 s wait, then every 5 s up to the deadline
    expect(availability).toHaveBeenCalledTimes(59);
  });

  it('stops when aborted', async () => {
    const availability = vi.fn().mockResolvedValue(200);
    mockBackend({ getSetupAvailability: availability });
    const controller = new AbortController();

    const result = waitForBackendRestart({ accept: [204], signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10_000);
    controller.abort();

    await expect(result).resolves.toBe(false);
    expect(availability).toHaveBeenCalledTimes(1);
  });
});
