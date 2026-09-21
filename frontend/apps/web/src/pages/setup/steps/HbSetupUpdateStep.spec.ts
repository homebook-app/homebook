import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupUpdateStep from './HbSetupUpdateStep.vue';

function mountUpdate(start: () => Promise<unknown>, availability = vi.fn(async () => 204)) {
  return mountStep(HbSetupUpdateStep, {
    branch: 'update',
    step: 'updateProcess',
    backend: {
      api: { update: { start: { post: vi.fn(start) } } } as never,
      getSetupAvailability: availability as never,
    },
  });
}

describe('HbSetupUpdateStep', () => {
  useFastSetupTiming();

  it('updates after the countdown and expects the backend to go away meanwhile', async () => {
    const availability = vi.fn().mockRejectedValueOnce(apiError(502)).mockResolvedValueOnce(201).mockResolvedValue(204);
    const { wrapper, setup } = await mountUpdate(() => Promise.reject(new TypeError('Failed to fetch')), availability);

    expect(wrapper.text()).toContain('update.process.updateIsPrepared.message');
    await finishCountdown(wrapper);
    expect(wrapper.text()).toContain('update.process.restartHint.message');

    await vi.waitFor(() => expect(wrapper.find('.hb-setup-update__finished').exists()).toBe(true));
    expect(stepError(wrapper)).toBeUndefined();
    expect(wrapper.find('h2').text()).toBe('update.processFinished.title');
    expect(setup.stepStates.updateProcess).toBe('done');
    expect(availability).toHaveBeenCalledTimes(3);

    await wrapper.find('.hb-setup-update__finished button').trigger('click');
    expect(setup.finished).toBe(true);
  });

  it('finishes at once when there was nothing to update', async () => {
    const { wrapper } = await mountUpdate(async () => undefined);

    await finishCountdown(wrapper);

    await vi.waitFor(() => expect(wrapper.find('.hb-setup-update__finished').exists()).toBe(true));
  });

  it.each([
    [409, 'update.process.processingSetupMissingError.message'],
    [500, 'update.process.processingUnknownError.message'],
  ])('reports status %i by its code', async (status, message) => {
    const { wrapper, setup } = await mountUpdate(() => Promise.reject(apiError(status)));

    await finishCountdown(wrapper);

    expect(stepError(wrapper)).toBe(message);
    expect(setup.stepStates.updateProcess).toBe('error');
    expect(wrapper.find('.hb-setup-step__retry').text()).toBe('update.process.retry.button.text');
  });

  it('reports a backend that stays on the old version', async () => {
    const { wrapper } = await mountUpdate(
      async () => undefined,
      vi.fn(async () => 201),
    );

    await finishCountdown(wrapper);

    await vi.waitFor(() => expect(stepError(wrapper)).toBe('update.process.processingServerRestartError.message'));
  });
});
