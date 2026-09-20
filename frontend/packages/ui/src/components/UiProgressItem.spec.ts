import { mountWithPlugins } from '@homebook/test-utils';
import ProgressBar from 'primevue/progressbar';

import UiProgressItem from './UiProgressItem.vue';

describe('UiProgressItem', () => {
  it('clamps the value into 0 to 100', async () => {
    const below = await mountWithPlugins(UiProgressItem, { props: { progressValue: -5 } });
    expect(below.wrapper.findComponent(ProgressBar).props('value')).toBe(0);

    const above = await mountWithPlugins(UiProgressItem, { props: { progressValue: 150 } });
    expect(above.wrapper.findComponent(ProgressBar).props('value')).toBe(100);

    const inside = await mountWithPlugins(UiProgressItem, { props: { progressValue: 45 } });
    expect(inside.wrapper.findComponent(ProgressBar).props('value')).toBe(45);
  });

  it('carries the accent as a custom property the progress bar inherits', async () => {
    const { wrapper } = await mountWithPlugins(UiProgressItem, { props: { color: 'var(--hb-color-crimson)' } });

    expect(wrapper.find('.ui-progress-item').attributes('style')).toContain(
      '--ui-element-accent-color: var(--hb-color-crimson)',
    );
  });

  it('carries a modifier class for each size', async () => {
    for (const size of ['small', 'medium', 'large'] as const) {
      const { wrapper } = await mountWithPlugins(UiProgressItem, { props: { progressSize: size } });

      expect(wrapper.find('.ui-progress-item').classes()).toContain(`ui-progress-item--${size}`);
    }
  });

  it('renders the four texts, and lets a slot replace one of them', async () => {
    const { wrapper } = await mountWithPlugins(UiProgressItem, {
      props: {
        headerTextStart: 'Storage',
        headerTextEnd: '12 GB',
        footerTextStart: 'of 64 GB',
        footerTextEnd: '19 %',
      },
      slots: { headerEnd: '<strong>nearly full</strong>' },
    });

    expect(wrapper.find('.ui-progress-item-header-start').text()).toBe('Storage');
    expect(wrapper.find('.ui-progress-item-header-end').text()).toBe('nearly full');
    expect(wrapper.find('.ui-progress-item-footer-start').text()).toBe('of 64 GB');
    expect(wrapper.find('.ui-progress-item-footer-end').text()).toBe('19 %');
  });

  it('hides the percentage label, the footer carries the numbers', async () => {
    const { wrapper } = await mountWithPlugins(UiProgressItem);

    expect(wrapper.findComponent(ProgressBar).props('showValue')).toBe(false);
  });
});
