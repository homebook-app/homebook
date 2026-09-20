import { mountWithPlugins } from '@homebook/test-utils';
import { flushPromises } from '@vue/test-utils';

import { iconRegistryKey, type IconRegistry } from '../icons/iconRegistry';
import UiIcon from './UiIcon.vue';

function fakeRegistry(sets: Record<string, string[]>): IconRegistry & { load: ReturnType<typeof vi.fn> } {
  return {
    load: vi.fn((set: string) => {
      const names = sets[set];
      return names === undefined ? Promise.reject(new Error('offline')) : Promise.resolve(new Set(names));
    }),
  };
}

async function mountIcon(registry: IconRegistry, props: Record<string, unknown>, attrs: Record<string, string> = {}) {
  const { wrapper } = await mountWithPlugins(UiIcon, {
    props,
    attrs,
    global: { provide: { [iconRegistryKey as symbol]: registry } },
  });
  return wrapper;
}

describe('UiIcon', () => {
  it('references the symbol of the icon once its set is loaded', async () => {
    let finishLoading: (names: ReadonlySet<string>) => void = () => undefined;
    const registry = {
      load: vi.fn(() => new Promise<ReadonlySet<string>>((resolve) => (finishLoading = resolve))),
    };
    const wrapper = await mountIcon(registry, { set: 'windows11-outline', name: 'Home' });

    // The box is there right away, so nothing shifts when the sprite arrives
    expect(wrapper.find('svg.ui-icon').exists()).toBe(true);
    expect(wrapper.find('use').exists()).toBe(false);

    finishLoading(new Set(['Home']));
    await flushPromises();

    expect(registry.load).toHaveBeenCalledWith('windows11-outline');
    expect(wrapper.find('use').attributes('href')).toBe('#hb-windows11-outline-Home');
  });

  it('renders nothing and warns for an unknown name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = await mountIcon(fakeRegistry({ logos: ['GitHub'] }), { set: 'logos', name: 'Nope' });
    await flushPromises();

    expect(wrapper.find('svg').exists()).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Nope" in set "logos"'));
  });

  it('renders nothing when the set cannot be loaded, without throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = await mountIcon(fakeRegistry({}), { set: 'logos', name: 'GitHub' });
    await flushPromises();

    expect(wrapper.find('svg').exists()).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('maps named sizes to tokens, numbers to pixels and keeps any other length', async () => {
    const registry = fakeRegistry({ logos: ['GitHub'] });

    const medium = await mountIcon(registry, { set: 'logos', name: 'GitHub' });
    expect(medium.find('svg').attributes('style')).toContain('width: var(--hb-icon-size-md)');

    const large = await mountIcon(registry, { set: 'logos', name: 'GitHub', size: 'large' });
    expect(large.find('svg').attributes('style')).toContain('height: var(--hb-icon-size-lg)');

    const pixels = await mountIcon(registry, { set: 'logos', name: 'GitHub', size: 60 });
    expect(pixels.find('svg').attributes('style')).toContain('width: 60px');

    const length = await mountIcon(registry, { set: 'logos', name: 'GitHub', size: '2em' });
    expect(length.find('svg').attributes('style')).toContain('width: 2em');
  });

  it('applies the color, the symbols are drawn in currentColor', async () => {
    const wrapper = await mountIcon(fakeRegistry({ logos: ['GitHub'] }), {
      set: 'logos',
      name: 'GitHub',
      color: 'var(--hb-color-aqua)',
    });

    expect(wrapper.find('svg').attributes('style')).toContain('color: var(--hb-color-aqua)');
  });

  it('follows changes of name and set', async () => {
    const registry = fakeRegistry({ logos: ['GitHub', 'Docker'], 'windows11-filled': ['Home'] });
    const wrapper = await mountIcon(registry, { set: 'logos', name: 'GitHub' });
    await flushPromises();

    await wrapper.setProps({ name: 'Docker' });
    expect(wrapper.find('use').attributes('href')).toBe('#hb-logos-Docker');

    await wrapper.setProps({ set: 'windows11-filled', name: 'Home' });
    await flushPromises();
    expect(wrapper.find('use').attributes('href')).toBe('#hb-windows11-filled-Home');
    expect(registry.load).toHaveBeenCalledTimes(2);
  });

  it('is decorative unless the caller labels it', async () => {
    const registry = fakeRegistry({ logos: ['GitHub'] });

    const decorative = await mountIcon(registry, { set: 'logos', name: 'GitHub' });
    expect(decorative.find('svg').attributes('aria-hidden')).toBe('true');

    const labelled = await mountIcon(
      registry,
      { set: 'logos', name: 'GitHub' },
      { role: 'img', 'aria-label': 'GitHub', 'aria-hidden': 'false' },
    );
    expect(labelled.find('svg').attributes('aria-label')).toBe('GitHub');
    expect(labelled.find('svg').attributes('aria-hidden')).toBe('false');
  });
});
