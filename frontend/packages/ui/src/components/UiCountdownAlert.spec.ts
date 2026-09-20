import { mountWithPlugins } from '@homebook/test-utils';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';

import UiCountdownAlert from './UiCountdownAlert.vue';

describe('UiCountdownAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Without a stub happy-dom has no matchMedia, the composable then assumes full motion
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the slot inside a message of the given severity', async () => {
    const { wrapper } = await mountWithPlugins(UiCountdownAlert, {
      props: { severity: 'warn' },
      slots: { default: 'The instance restarts now.' },
    });

    expect(wrapper.findComponent(Message).props('severity')).toBe('warn');
    expect(wrapper.text()).toContain('The instance restarts now.');
  });

  it('defaults to the neutral severity of the original', async () => {
    const { wrapper } = await mountWithPlugins(UiCountdownAlert);

    expect(wrapper.findComponent(Message).props('severity')).toBe('secondary');
  });

  it('carries the accent as a custom property and hides the percentage', async () => {
    const { wrapper } = await mountWithPlugins(UiCountdownAlert, { props: { color: 'var(--hb-color-amber)' } });

    expect(wrapper.attributes('style')).toContain('--ui-element-accent-color: var(--hb-color-amber)');
    expect(wrapper.findComponent(ProgressBar).props('showValue')).toBe(false);
  });

  it('reports the end of the countdown', async () => {
    const { wrapper } = await mountWithPlugins(UiCountdownAlert, { props: { duration: 0 } });

    vi.advanceTimersByTime(1);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('finished')).toHaveLength(1);
    expect(wrapper.findComponent(ProgressBar).props('value')).toBe(100);
  });
});
