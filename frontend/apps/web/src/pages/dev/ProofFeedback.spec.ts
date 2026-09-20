import { mountWithPlugins } from '@homebook/test-utils';
import { UiCountdownAlert, UiLicenseDialog } from '@homebook/ui';
import Button from 'primevue/button';

import ProofFeedback from './ProofFeedback.vue';

function button(wrapper: Awaited<ReturnType<typeof mountWithPlugins>>['wrapper'], key: string) {
  return wrapper.findAllComponents(Button).find((candidate) => candidate.props('label') === key);
}

describe('ProofFeedback', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  it('opens the license dialog on demand', async () => {
    const { wrapper } = await mountWithPlugins(ProofFeedback, { attachTo: document.body });

    expect(wrapper.findComponent(UiLicenseDialog).props('visible')).toBe(false);

    await button(wrapper, 'settings.developer.components.showLicenses')?.trigger('click');

    expect(wrapper.findComponent(UiLicenseDialog).props('visible')).toBe(true);
  });

  it('closes again when the dialog asks for it', async () => {
    const { wrapper } = await mountWithPlugins(ProofFeedback, { attachTo: document.body });
    await button(wrapper, 'settings.developer.components.showLicenses')?.trigger('click');

    wrapper.findComponent(UiLicenseDialog).vm.$emit('update:visible', false);
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(UiLicenseDialog).props('visible')).toBe(false);
  });

  it('restarts the countdown by mounting it again', async () => {
    const { wrapper } = await mountWithPlugins(ProofFeedback, { attachTo: document.body });
    const before = wrapper.findComponent(UiCountdownAlert).vm.$;

    await button(wrapper, 'settings.developer.components.restartCountdown')?.trigger('click');

    // A new instance behind the same slot, which is what the `key` is for
    expect(wrapper.findComponent(UiCountdownAlert).vm.$).not.toBe(before);
  });
});
