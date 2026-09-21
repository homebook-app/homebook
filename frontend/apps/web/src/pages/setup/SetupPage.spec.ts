import { mountWithPlugins } from '@homebook/test-utils';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';

import { setAppConfig } from '@/composables/useAppConfig';
import type { SetupStepKey } from '@/setup/steps';
import { useBootstrapStore, type BootStatus } from '@/stores/bootstrap';
import { useSetupStore } from '@/stores/setup';
import { useFastSetupTiming, wizardRoutes } from '@/test/setupWizard';

import SetupPage from './SetupPage.vue';

// The steps have their own specs; here they only have to show which one is active
function stubStep(key: SetupStepKey) {
  return {
    __esModule: true,
    default: defineComponent({ name: key, render: () => h('div', { class: 'step-stub' }, key) }),
  };
}

vi.mock('./steps/HbSetupConnectionStep.vue', () => stubStep('backendConnection'));
vi.mock('./steps/HbSetupLicenseStep.vue', () => stubStep('licenseAgreement'));
vi.mock('./steps/HbSetupDatabaseStep.vue', () => stubStep('databaseConfiguration'));
vi.mock('./steps/HbSetupAdminStep.vue', () => stubStep('adminUser'));
vi.mock('./steps/HbSetupConfigurationStep.vue', () => stubStep('configuration'));
vi.mock('./steps/HbSetupProcessStep.vue', () => stubStep('setupProcess'));
vi.mock('./steps/HbSetupUpdateStep.vue', () => stubStep('updateProcess'));

async function mountPage(status: BootStatus = 'setupRequired') {
  setAppConfig({
    version: '1.2.3',
    backendHost: '/api',
    features: { widgetMenu: false },
    upload: { maxFileSizeBytes: 1 },
  });
  const pinia = createPinia();
  setActivePinia(pinia);
  const bootstrap = useBootstrapStore();
  bootstrap.status = status;
  const retry = vi.spyOn(bootstrap, 'retry').mockResolvedValue('ready');

  const mounted = await mountWithPlugins(SetupPage, { pinia, routes: wizardRoutes, initialRoute: '/Setup' });
  await flushPromises();
  return { ...mounted, setup: useSetupStore(), retry };
}

function stepTitles(wrapper: Awaited<ReturnType<typeof mountPage>>['wrapper']): string[] {
  return wrapper.findAll('.p-step-title').map((title) => title.text());
}

describe('SetupPage', () => {
  useFastSetupTiming();

  it('lists the steps of the installation and shows the first one', async () => {
    const { wrapper } = await mountPage();

    expect(stepTitles(wrapper)).toEqual([
      'uiSetupStepper.backendConnectionSetupStep.title',
      'uiSetupStepper.licenseAgreementSetupStep.title',
      'uiSetupStepper.databaseConfigurationSetupStep.title',
      'uiSetupStepper.adminUserSetupStep.title',
      'uiSetupStepper.configurationSetupStep.title',
      'uiSetupStepper.setupProcessSetupStep.title',
    ]);
    expect(wrapper.find('.step-stub').text()).toBe('backendConnection');
  });

  it('starts the update branch when the backend wants an update', async () => {
    const { wrapper, setup } = await mountPage('updateRequired');

    expect(setup.branch).toBe('update');
    expect(stepTitles(wrapper)).toEqual([
      'uiSetupStepper.backendConnectionSetupStep.title',
      'uiSetupStepper.updateProcessSetupStep.title',
    ]);
  });

  it('renders the step list once, not a second time for small screens', async () => {
    const { wrapper } = await mountPage();

    expect(wrapper.findAll('.p-stepper')).toHaveLength(1);
  });

  it('follows the wizard to the next step and marks the finished and failed ones', async () => {
    const { wrapper, setup } = await mountPage();

    setup.completeStep('backendConnection');
    setup.failStep('licenseAgreement');
    await flushPromises();

    expect(wrapper.find('.step-stub').text()).toBe('licenseAgreement');
    const steps = wrapper.findAll('.hb-setup__step');
    expect(steps[0]!.classes()).toContain('hb-setup__step--done');
    expect(steps[1]!.classes()).toContain('hb-setup__step--error');
    expect(steps[1]!.attributes('data-p-active')).toBe('true');
  });

  it('does not let the user jump to another step', async () => {
    const { wrapper } = await mountPage();

    expect(wrapper.findAll('.p-step-header').map((header) => header.attributes('disabled'))).toEqual([
      undefined,
      '',
      '',
      '',
      '',
      '',
    ]);
  });

  it('shows version and server in the footer', async () => {
    const { wrapper } = await mountPage();

    const footer = wrapper.find('.hb-setup__footer').text();
    expect(footer).toContain('1.2.3');
    expect(footer).toContain('/api');
  });

  it('plays the closing animation, restarts the startup sequence and opens the login', async () => {
    const { wrapper, router, setup, retry } = await mountPage();

    setup.finish();
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/Login'));

    expect(retry).toHaveBeenCalled();
    expect(wrapper.find('.hb-setup').classes()).toContain('is-finished');
    expect(wrapper.find('.hb-setup__tiles').classes()).toContain('is-finished');
  });
});
