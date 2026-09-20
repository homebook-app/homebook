import { mountWithPlugins } from '@homebook/test-utils';
import { iconRegistryKey, type IconRegistry } from '@homebook/ui';
import { flushPromises } from '@vue/test-utils';

import ProofIconSet from './ProofIconSet.vue';

function mountSet(set: string, registry: IconRegistry) {
  return mountWithPlugins(ProofIconSet, {
    props: { set },
    global: { provide: { [iconRegistryKey as symbol]: registry } },
  });
}

async function open(details: HTMLElement): Promise<void> {
  (details as HTMLDetailsElement).open = true;
  details.dispatchEvent(new Event('toggle'));
  await flushPromises();
}

describe('ProofIconSet', () => {
  it('loads the set only when its section is opened, and only once', async () => {
    const registry = { load: vi.fn().mockResolvedValue(new Set(['Home', 'Gear'])) };
    const { wrapper } = await mountSet('windows11-outline', registry);

    expect(registry.load).not.toHaveBeenCalled();

    await open(wrapper.element as HTMLElement);
    // Once for the list of names, once per rendered icon. The real registry shares one download.
    expect(registry.load).toHaveBeenCalledTimes(3);
    expect(registry.load).toHaveBeenCalledWith('windows11-outline');

    await open(wrapper.element as HTMLElement);
    expect(registry.load).toHaveBeenCalledTimes(3);
    expect(wrapper.findAll('button').map((button) => button.attributes('title'))).toEqual(['Gear', 'Home']);
  });

  it('renders single-color sets as icons and the others as pictograms', async () => {
    const registry = { load: vi.fn().mockResolvedValue(new Set(['Book'])) };

    const tintable = await mountSet('logos', registry);
    await open(tintable.wrapper.element as HTMLElement);
    expect(tintable.wrapper.find('.ui-icon').exists()).toBe(true);

    const multicolor = await mountSet('glass-morphism', registry);
    await open(multicolor.wrapper.element as HTMLElement);
    expect(multicolor.wrapper.find('.ui-pictogram').exists()).toBe(true);
    expect(multicolor.wrapper.find('.ui-icon').exists()).toBe(false);
  });

  it('copies the name of an icon and labels the button with the translation key', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const { wrapper } = await mountSet('logos', { load: () => Promise.resolve(new Set(['GitHub'])) });
    await open(wrapper.element as HTMLElement);
    await wrapper.find('button').trigger('click');

    expect(writeText).toHaveBeenCalledWith('GitHub');
    expect(wrapper.find('button').attributes('aria-label')).toBe('settings.developer.icons.copyName');
  });
});
