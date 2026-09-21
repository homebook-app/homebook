import type { GetLocalesResponse } from '@homebook/api-client';
import { flushPromises } from '@vue/test-utils';
import Select from 'primevue/select';

import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, stepSuccess, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupConfigurationStep from './HbSetupConfigurationStep.vue';

const LOCALES: GetLocalesResponse = {
  locales: [
    { code: 'de-DE', name: 'Deutsch (German)' },
    { code: 'en-GB', name: 'English (British English)' },
    { code: 'en-US', name: 'English (US English)' },
  ],
};

function mountConfiguration(
  get: () => Promise<ArrayBuffer | undefined>,
  locales: () => Promise<GetLocalesResponse | undefined> = async () => LOCALES,
) {
  return mountStep(HbSetupConfigurationStep, {
    step: 'configuration',
    backend: {
      api: {
        setup: { configuration: { get: vi.fn(get) } },
        platform: { locales: { get: vi.fn(locales) } },
      } as never,
    },
  });
}

const notPreset = () => Promise.reject(apiError(404));

describe('HbSetupConfigurationStep', () => {
  useFastSetupTiming();

  it('skips with a hint when the environment presets the instance', async () => {
    const { wrapper, setup } = await mountConfiguration(async () => undefined);

    expect(stepSuccess(wrapper)).toBe('setup.configuration.configurationFound.title');
    await finishCountdown(wrapper);

    expect(setup.configuration).toBeNull();
    expect(setup.stepStates.configuration).toBe('skipped');
    expect(setup.currentStep).toBe('setupProcess');
  });

  it('offers the platform languages and preselects the one of the wizard', async () => {
    const { wrapper } = await mountConfiguration(notPreset);

    const select = wrapper.findComponent(Select);
    expect(select.props('options')).toEqual([
      { code: 'de-DE', name: 'Deutsch (German)' },
      { code: 'en-GB', name: 'English (British English)' },
      { code: 'en-US', name: 'English (US English)' },
    ]);
    expect((wrapper.find('#setup-configuration-name').element as HTMLInputElement).value).toBe(
      'setup.configuration.form.instanceName.defaultValue',
    );
  });

  it('collects name and language and moves on after the countdown', async () => {
    const { wrapper, setup } = await mountConfiguration(notPreset);

    await wrapper.find('#setup-configuration-name').setValue(' Our Home ');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(stepSuccess(wrapper)).toBe('setup.configuration.configurationSaved.title');
    await finishCountdown(wrapper);

    // The test locale is `en`, the first English culture wins
    expect(setup.configuration).toEqual({ instanceName: 'Our Home', defaultLocale: 'en-GB' });
    expect(setup.currentStep).toBe('setupProcess');
  });

  it('needs a name', async () => {
    const { wrapper, setup } = await mountConfiguration(notPreset);

    await wrapper.find('#setup-configuration-name').setValue('');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.required');
    expect(setup.configuration).toBeNull();
  });

  it.each([
    ['the configuration check', () => Promise.reject(apiError(500)), async () => LOCALES],
    ['the languages', notPreset, () => Promise.reject(apiError(500))],
  ])('reports a server error of %s', async (_label, get, locales) => {
    const { wrapper } = await mountConfiguration(get, locales);

    expect(stepError(wrapper)).toBe('setup.configuration.loadingError.message');
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('reports an unreachable backend', async () => {
    const { wrapper } = await mountConfiguration(() => Promise.reject(new TypeError('Failed to fetch')));

    expect(stepError(wrapper)).toBe('setup.backendConnectionFailed.message');
  });
});
