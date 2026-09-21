import type { GetLicensesResponse } from '@homebook/api-client';
import { UiLicenseDialog } from '@homebook/ui';
import { flushPromises } from '@vue/test-utils';

import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, stepSuccess, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupLicenseStep from './HbSetupLicenseStep.vue';

function mountLicenses(get: () => Promise<GetLicensesResponse | undefined>) {
  return mountStep(HbSetupLicenseStep, {
    step: 'licenseAgreement',
    backend: { api: { setup: { licenses: { get: vi.fn(get) } } } as never },
  });
}

const LICENSES: GetLicensesResponse = {
  licensesAccepted: false,
  licenses: [
    { name: 'vue', content: '<p>MIT</p>' },
    { name: 'Npgsql', content: '<p>PostgreSQL</p>' },
  ],
};

describe('HbSetupLicenseStep', () => {
  useFastSetupTiming();

  it('skips with a hint when the environment accepted the licenses', async () => {
    const { wrapper, setup } = await mountLicenses(async () => ({ ...LICENSES, licensesAccepted: true }));

    expect(stepSuccess(wrapper)).toBe('setup.licenses.alreadyAccepted.text');
    await finishCountdown(wrapper);

    expect(setup.licensesAccepted).toBe(true);
    expect(setup.stepStates.licenseAgreement).toBe('skipped');
    expect(setup.currentStep).toBe('databaseConfiguration');
  });

  it('waits for the consent and moves on right after it', async () => {
    const { wrapper, setup } = await mountLicenses(async () => LICENSES);

    expect(setup.licensesAccepted).toBe(false);
    await wrapper.find('.hb-setup-licenses__accept').trigger('click');

    expect(setup.licensesAccepted).toBe(true);
    expect(setup.stepStates.licenseAgreement).toBe('done');
    expect(setup.currentStep).toBe('databaseConfiguration');
  });

  it('shows the sorted licenses in the dialog and accepts from there', async () => {
    const { wrapper, setup } = await mountLicenses(async () => LICENSES);

    await wrapper.find('.hb-setup-licenses__show').trigger('click');
    const dialog = wrapper.findComponent(UiLicenseDialog);
    expect(dialog.props('visible')).toBe(true);
    expect(dialog.props('licenses')).toEqual([
      { name: 'Npgsql', htmlContent: '<p>PostgreSQL</p>' },
      { name: 'vue', htmlContent: '<p>MIT</p>' },
    ]);

    dialog.vm.$emit('accepted');
    dialog.vm.$emit('accepted');
    await flushPromises();

    expect(setup.licensesAccepted).toBe(true);
    expect(setup.currentStep).toBe('databaseConfiguration');
  });

  it('reports a failure to load with the status code and loads again on retry', async () => {
    const get = vi.fn().mockRejectedValueOnce(apiError(500)).mockResolvedValue(LICENSES);
    const { wrapper } = await mountStep(HbSetupLicenseStep, {
      step: 'licenseAgreement',
      backend: { api: { setup: { licenses: { get } } } as never },
    });

    expect(stepError(wrapper)).toBe('setup.licenses.loadingError.messageTemplate');
    await wrapper.find('.hb-setup-step__retry').trigger('click');
    await flushPromises();

    expect(stepError(wrapper)).toBeUndefined();
    expect(wrapper.find('.hb-setup-licenses__accept').exists()).toBe(true);
  });

  it('reports an unreachable backend', async () => {
    const { wrapper } = await mountLicenses(() => Promise.reject(new TypeError('Failed to fetch')));

    expect(stepError(wrapper)).toBe('setup.backendConnectionFailed.message');
  });
});
