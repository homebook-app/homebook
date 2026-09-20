import { mountWithPlugins } from '@homebook/test-utils';

import UiColoredIcon from './UiColoredIcon.vue';
import UiStartMenuItem from './UiStartMenuItem.vue';

const props = {
  title: 'Kitchen',
  caption: 'Recipes and the weekly plan',
  url: '/Kitchen',
  icon: 'Home',
  color: 'var(--hb-color-emerald)',
};

const routes = [{ path: '/Kitchen', component: { template: '<div />' } }];

describe('UiStartMenuItem', () => {
  it('links to its route', async () => {
    const { wrapper } = await mountWithPlugins(UiStartMenuItem, { props, routes });

    expect(wrapper.find('a').attributes('href')).toBe('/Kitchen');
  });

  it('carries the accent as a custom property and hands it to the icons', async () => {
    const { wrapper } = await mountWithPlugins(UiStartMenuItem, { props, routes });

    expect(wrapper.attributes('style')).toContain('--startmenu-item-color: var(--hb-color-emerald)');
    expect(wrapper.findComponent(UiColoredIcon).props('color')).toBe('var(--hb-color-emerald)');
  });

  it('shows title and caption, and translates only its own open label', async () => {
    const { wrapper } = await mountWithPlugins(UiStartMenuItem, { props, routes });

    expect(wrapper.find('.ui-startmenu-item-title').text()).toBe('Kitchen');
    expect(wrapper.find('.ui-startmenu-item-caption').text()).toBe('Recipes and the weekly plan');
    // The test i18n carries no catalog, so a key renders as itself
    expect(wrapper.find('.ui-startmenu-item-nav').text()).toContain('ui.startMenuItem.open');
  });

  it('leaves the caption out when there is none', async () => {
    const { wrapper } = await mountWithPlugins(UiStartMenuItem, {
      props: { ...props, caption: undefined },
      routes,
    });

    expect(wrapper.find('.ui-startmenu-item-caption').exists()).toBe(false);
  });

  it('keeps the frosted tile, it is the signature of the start page', async () => {
    const { wrapper } = await mountWithPlugins(UiStartMenuItem, { props, routes });

    expect(wrapper.find('.ui-startmenu-container').classes()).toContain('frosted-b7');
  });
});
