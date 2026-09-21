import { mountWithPlugins } from '@homebook/test-utils';

import HbDrawer from './HbDrawer.vue';
import HbNavMenu from './HbNavMenu.vue';

describe('HbDrawer', () => {
  it('is a pinned panel with title and instance name on wide screens', async () => {
    const { wrapper } = await mountWithPlugins(HbDrawer, { props: { instanceName: 'Villa Kunterbunt' } });

    const panel = wrapper.find('aside.hb-drawer--pinned');
    expect(panel.text()).toContain('appTitle');
    expect(panel.text()).toContain('Villa Kunterbunt');
  });

  it('passes the context entries to the navigation', async () => {
    const items = [{ title: 'Recipes', url: '/Kitchen/Recipes' }];
    const { wrapper } = await mountWithPlugins(HbDrawer, { props: { instanceName: '', items } });

    expect(wrapper.findComponent(HbNavMenu).props('items')).toEqual(items);
  });

  it('is an overlay that closes after navigating on small screens', async () => {
    const { wrapper } = await mountWithPlugins(HbDrawer, {
      props: { instanceName: '', compact: true, open: true },
      attachTo: document.body,
    });

    expect(wrapper.find('aside.hb-drawer--pinned').exists()).toBe(false);
    wrapper.findComponent(HbNavMenu).vm.$emit('navigate');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
    wrapper.unmount();
  });
});
