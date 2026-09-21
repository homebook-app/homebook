import type { StartSetupRequest } from '@homebook/api-client';
import { flushPromises } from '@vue/test-utils';

import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupProcessStep from './HbSetupProcessStep.vue';

function mountProcess(start: (body: StartSetupRequest) => Promise<unknown>, availability = vi.fn(async () => 204)) {
  const startSpy = vi.fn(start);
  return mountStep(HbSetupProcessStep, {
    step: 'setupProcess',
    backend: { api: { setup: { start: { post: startSpy } } } as never, getSetupAvailability: availability as never },
  }).then((mounted) => {
    // What the earlier steps collected
    mounted.setup.licensesAccepted = true;
    mounted.setup.admin = { username: 'admin', password: 'S3cure!pw' };
    return { ...mounted, startSpy, availability };
  });
}

describe('HbSetupProcessStep', () => {
  useFastSetupTiming();

  it('starts after the countdown with everything collected', async () => {
    const { wrapper, startSpy } = await mountProcess(async () => undefined);

    expect(wrapper.text()).toContain('setup.process.setupIsPrepared.message');
    expect(startSpy).not.toHaveBeenCalled();

    await finishCountdown(wrapper);

    expect(startSpy).toHaveBeenCalledWith({
      licensesAccepted: true,
      homebookUserName: 'admin',
      homebookUserPassword: 'S3cure!pw',
    });
  });

  it('waits for the restarted backend and then offers to open HomeBook', async () => {
    const availability = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue(204);
    const { wrapper, setup } = await mountProcess(() => Promise.reject(new TypeError('Failed to fetch')), availability);

    await finishCountdown(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.hb-setup-process__finished').exists()).toBe(true));

    expect(stepError(wrapper)).toBeUndefined();
    expect(wrapper.find('h2').text()).toBe('setup.processFinished.title');
    expect(wrapper.text()).toContain('setup.process.finished.removeEnvironmentVariables.message');
    expect(setup.stepStates.setupProcess).toBe('done');

    await wrapper.find('.hb-setup-process__finished button').trigger('click');
    expect(setup.finished).toBe(true);
  });

  it('leaves on its own when the last countdown ran out', async () => {
    const { wrapper, setup } = await mountProcess(async () => undefined);

    await finishCountdown(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.hb-setup-process__finished').exists()).toBe(true));
    await finishCountdown(wrapper);

    expect(setup.finished).toBe(true);
  });

  it.each([
    [400, 'setup.process.processingValidationError.message'],
    [422, 'setup.process.processingLicenseError.message'],
    [500, 'setup.process.processingUnknownError.message'],
  ])('reports status %i by its code', async (status, message) => {
    const { wrapper, setup, availability } = await mountProcess(() => Promise.reject(apiError(status)));

    await finishCountdown(wrapper);

    expect(stepError(wrapper)).toBe(message);
    expect(setup.stepStates.setupProcess).toBe('error');
    expect(availability).not.toHaveBeenCalled();
  });

  it('reports a backend that does not come back', async () => {
    const { wrapper } = await mountProcess(
      async () => undefined,
      vi.fn(async () => 200),
    );

    await finishCountdown(wrapper);

    await vi.waitFor(() => expect(stepError(wrapper)).toBe('setup.process.processingServerRestartError.message'));
  });

  it('starts again on retry', async () => {
    const start = vi.fn().mockRejectedValueOnce(apiError(500)).mockResolvedValue(undefined);
    const { wrapper } = await mountProcess(start);

    await finishCountdown(wrapper);
    await wrapper.find('.hb-setup-step__retry').trigger('click');
    await flushPromises();

    await vi.waitFor(() => expect(wrapper.find('.hb-setup-process__finished').exists()).toBe(true));
    expect(start).toHaveBeenCalledTimes(2);
  });
});
