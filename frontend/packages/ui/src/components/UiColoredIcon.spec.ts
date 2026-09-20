import { mountWithPlugins } from '@homebook/test-utils';
import { flushPromises } from '@vue/test-utils';

import { iconRegistryKey, type IconRegistry } from '../icons/iconRegistry';
import UiColoredIcon from './UiColoredIcon.vue';
import UiIcon from './UiIcon.vue';

const registry: IconRegistry = {
  load: () => Promise.resolve(new Set(['Home'])),
};

describe('UiColoredIcon', () => {
  it('hands the color to frame and icon through a custom property', async () => {
    const { wrapper } = await mountWithPlugins(UiColoredIcon, {
      props: { set: 'windows11-filled', name: 'Home', color: '#ff88ff' },
      global: { provide: { [iconRegistryKey as symbol]: registry } },
    });
    await flushPromises();

    expect(wrapper.find('.ui-colored-icon-container').attributes('style')).toContain(
      '--ui-colored-icon-color: #ff88ff',
    );
    expect(wrapper.find('.ui-colored-icon-frame').exists()).toBe(true);
  });

  it('renders the icon through UiIcon in the token size', async () => {
    const { wrapper } = await mountWithPlugins(UiColoredIcon, {
      props: { set: 'windows11-filled', name: 'Home', color: 'var(--hb-color-aqua)' },
      global: { provide: { [iconRegistryKey as symbol]: registry } },
    });
    await flushPromises();

    const icon = wrapper.findComponent(UiIcon);
    expect(icon.props()).toMatchObject({
      set: 'windows11-filled',
      name: 'Home',
      size: 'var(--hb-ui-colored-icon-size)',
    });
    expect(icon.find('use').attributes('href')).toBe('#hb-windows11-filled-Home');
  });
});
