import { mountWithPlugins } from '@homebook/test-utils';

import HbNavMenu from './HbNavMenu.vue';

const links = (wrapper: Awaited<ReturnType<typeof mountWithPlugins>>['wrapper']) =>
  wrapper.findAll('a.hb-nav-link').map((link) => link.attributes('href'));

describe('HbNavMenu', () => {
  it('shows the start page and the settings without context entries', async () => {
    const { wrapper } = await mountWithPlugins(HbNavMenu);

    expect(links(wrapper)).toEqual(['/', '/Settings']);
    expect(wrapper.find('.hb-nav__divider').exists()).toBe(false);
  });

  it('shows the context entries between them, behind a divider', async () => {
    const { wrapper } = await mountWithPlugins(HbNavMenu, {
      props: {
        items: [
          { title: 'Meal plan', url: '/Kitchen/MealPlan', icon: { set: 'windows11-outline', name: 'RestaurantMenu' } },
        ],
      },
    });

    expect(links(wrapper)).toEqual(['/', '/Kitchen/MealPlan', '/Settings']);
    expect(wrapper.find('.hb-nav__divider').exists()).toBe(true);
    expect(wrapper.find('.hb-nav__context').text()).toContain('Meal plan');
  });

  it('reports a chosen entry', async () => {
    const { wrapper } = await mountWithPlugins(HbNavMenu);

    await wrapper.find('a.hb-nav-link').trigger('click');

    expect(wrapper.emitted('navigate')).toHaveLength(1);
  });
});
