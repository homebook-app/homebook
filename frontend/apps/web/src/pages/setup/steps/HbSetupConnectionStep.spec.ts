import { flushPromises } from '@vue/test-utils';

import { useBootstrapStore } from '@/stores/bootstrap';
import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, stepSuccess, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupConnectionStep from './HbSetupConnectionStep.vue';

function mountConnection(
  availability: () => Promise<number>,
  version: () => Promise<string | undefined> = async () => '1.0.0',
) {
  return mountStep(HbSetupConnectionStep, {
    step: 'backendConnection',
    backend: {
      api: { version: { get: vi.fn(version) } } as never,
      getSetupAvailability: vi.fn(availability) as never,
    },
  });
}

describe('HbSetupConnectionStep', () => {
  useFastSetupTiming();

  it('goes on with the installation when the setup is required', async () => {
    const { wrapper, setup } = await mountConnection(async () => 200);

    expect(stepSuccess(wrapper)).toBe('setup.backendConnection.serverFound.text');
    await finishCountdown(wrapper);

    expect(setup.branch).toBe('install');
    expect(setup.currentStep).toBe('licenseAgreement');
  });

  it('switches to the update when the backend wants one', async () => {
    const { wrapper, setup } = await mountConnection(async () => 201);

    await finishCountdown(wrapper);

    expect(setup.branch).toBe('update');
    expect(setup.currentStep).toBe('updateProcess');
  });

  it('leaves for the start page when the instance is already set up', async () => {
    const { router, pinia } = await mountStep(HbSetupConnectionStep, {
      step: 'backendConnection',
      backend: {
        api: { version: { get: vi.fn(async () => '1.0.0') } } as never,
        getSetupAvailability: vi.fn(async () => 204) as never,
      },
      prepare: () => {
        vi.spyOn(useBootstrapStore(), 'retry').mockResolvedValue('ready');
      },
    });

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
    expect(useBootstrapStore(pinia).retry).toHaveBeenCalled();
  });

  it.each([
    ['a running setup (409 answer)', async () => 409 as const],
    ['a running setup (409 error)', () => Promise.reject(apiError(409))],
  ])('reports %s', async (_label, availability) => {
    const { wrapper, setup } = await mountConnection(availability);

    expect(stepError(wrapper)).toBe('setup.backendConnection.check.setupInProgressError.message');
    expect(setup.stepStates.backendConnection).toBe('error');
  });

  it('reports a server error', async () => {
    const { wrapper } = await mountConnection(() => Promise.reject(apiError(500)));

    expect(stepError(wrapper)).toBe('setup.backendConnection.check.unknownError.message');
  });

  it('reports an unreachable backend', async () => {
    const { wrapper } = await mountConnection(
      async () => 200,
      () => Promise.reject(new TypeError('Failed to fetch')),
    );

    expect(stepError(wrapper)).toBe('setup.backendConnectionFailed.message');
  });

  it('reports a backend without a version', async () => {
    const { wrapper } = await mountConnection(
      async () => 200,
      async () => '',
    );

    expect(stepError(wrapper)).toBe('setup.backendConnection.check.versionError.message');
  });

  it('checks again on retry', async () => {
    const availability = vi.fn().mockRejectedValueOnce(apiError(500)).mockResolvedValue(200);
    const { wrapper, setup } = await mountStep(HbSetupConnectionStep, {
      step: 'backendConnection',
      backend: { api: { version: { get: vi.fn(async () => '1.0.0') } } as never, getSetupAvailability: availability },
    });

    await wrapper.find('.hb-setup-step__retry').trigger('click');
    await flushPromises();

    expect(stepError(wrapper)).toBeUndefined();
    expect(stepSuccess(wrapper)).toBe('setup.backendConnection.serverFound.text');
    expect(setup.stepStates.backendConnection).toBeUndefined();
  });
});
