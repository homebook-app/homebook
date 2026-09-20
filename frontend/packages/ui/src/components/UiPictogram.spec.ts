import { mountWithPlugins } from '@homebook/test-utils';
import { flushPromises } from '@vue/test-utils';

import { iconRegistryKey, type IconRegistry } from '../icons/iconRegistry';
import UiPictogram from './UiPictogram.vue';

const registry: IconRegistry = {
  load: (set) => Promise.resolve(new Set(set === 'glass-morphism' ? ['Book'] : [])),
};

async function mountPictogram(props: Record<string, unknown>) {
  const { wrapper } = await mountWithPlugins(UiPictogram, {
    props,
    global: { provide: { [iconRegistryKey as symbol]: registry } },
  });
  await flushPromises();
  return wrapper;
}

describe('UiPictogram', () => {
  it('references the symbol and never sets a color', async () => {
    const wrapper = await mountPictogram({ set: 'glass-morphism', name: 'Book', size: 60 });

    expect(wrapper.find('use').attributes('href')).toBe('#hb-glass-morphism-Book');
    expect(wrapper.find('svg').attributes('style')).toContain('width: 60px');
    expect(wrapper.find('svg').attributes('style')).not.toContain('color');
  });

  it('renders nothing for an unknown name', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = await mountPictogram({ set: 'glass-morphism', name: 'Nope' });

    expect(wrapper.find('svg').exists()).toBe(false);
  });
});
