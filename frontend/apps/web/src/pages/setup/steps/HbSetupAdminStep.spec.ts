import type { VueWrapper } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';

import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, stepSuccess, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupAdminStep from './HbSetupAdminStep.vue';

function mountAdmin(get: () => Promise<ArrayBuffer | undefined>) {
  return mountStep(HbSetupAdminStep, {
    step: 'adminUser',
    backend: { api: { setup: { user: { get: vi.fn(get) } } } as never },
  });
}

const notPreset = () => Promise.reject(apiError(404));

async function fill(wrapper: VueWrapper, username: string, password: string, confirm = password) {
  await wrapper.find('#setup-admin-username').setValue(username);
  await wrapper.find('#setup-admin-password').setValue(password);
  await wrapper.find('#setup-admin-password-confirm').setValue(confirm);
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('HbSetupAdminStep', () => {
  useFastSetupTiming();

  it('skips with a hint when the environment presets the user', async () => {
    const { wrapper, setup } = await mountAdmin(async () => undefined);

    expect(wrapper.find('form').exists()).toBe(false);
    expect(stepSuccess(wrapper)).toBe('setup.adminUser.configurationFound.text');
    await finishCountdown(wrapper);

    expect(setup.admin).toBeNull();
    expect(setup.stepStates.adminUser).toBe('skipped');
    expect(setup.currentStep).toBe('configuration');
  });

  it('collects the user and moves on after the countdown', async () => {
    const { wrapper, setup } = await mountAdmin(notPreset);

    await fill(wrapper, 'admin_1', 'S3cure!pw');

    expect(wrapper.find('form').exists()).toBe(false);
    expect(stepSuccess(wrapper)).toBe('setup.adminUser.configurationSaved.text');
    await finishCountdown(wrapper);

    expect(setup.admin).toEqual({ username: 'admin_1', password: 'S3cure!pw' });
    expect(setup.currentStep).toBe('configuration');
  });

  it('refuses a password that breaks the rules and says why', async () => {
    const { wrapper, setup } = await mountAdmin(notPreset);

    await fill(wrapper, 'admin', 'pass wörd', 'pass wörd');

    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.passwordCharacters');
    expect(setup.admin).toBeNull();
  });

  it('refuses a repetition that does not match', async () => {
    const { wrapper, setup } = await mountAdmin(notPreset);

    await fill(wrapper, 'admin', 'S3cure!pw', 'S3cure!pW');

    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.passwordMismatch');
    expect(setup.admin).toBeNull();
  });

  it('refuses a username the backend would reject', async () => {
    const { wrapper, setup } = await mountAdmin(notPreset);

    await fill(wrapper, 'adm', 'S3cure!pw');

    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.minLength');
    expect(setup.admin).toBeNull();
  });

  it('reports a server error and checks again on retry', async () => {
    const get = vi.fn().mockRejectedValueOnce(apiError(500)).mockRejectedValue(apiError(404));
    const { wrapper } = await mountStep(HbSetupAdminStep, {
      step: 'adminUser',
      backend: { api: { setup: { user: { get } } } as never },
    });

    expect(stepError(wrapper)).toBe('setup.adminUser.presetError.message');
    await wrapper.find('.hb-setup-step__retry').trigger('click');
    await flushPromises();

    expect(stepError(wrapper)).toBeUndefined();
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('reports an unreachable backend', async () => {
    const { wrapper } = await mountAdmin(() => Promise.reject(new TypeError('Failed to fetch')));

    expect(stepError(wrapper)).toBe('setup.backendConnectionFailed.message');
  });
});
