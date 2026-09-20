import { mountWithPlugins } from '@homebook/test-utils';

import UiWaveBackground from './UiWaveBackground.vue';

describe('UiWaveBackground', () => {
  it('shows the dark image behind three waves by default', async () => {
    const { wrapper } = await mountWithPlugins(UiWaveBackground);

    expect(wrapper.classes()).toContain('ui-wavebackground-container--image');
    expect(wrapper.findAll('.ui-wavebackground-wave')).toHaveLength(3);
  });

  it.each(['gradient', 'image-light'] as const)('switches to the %s variant', async (variant) => {
    const { wrapper } = await mountWithPlugins(UiWaveBackground, { props: { variant } });

    expect(wrapper.classes()).toContain(`ui-wavebackground-container--${variant}`);
  });
});
