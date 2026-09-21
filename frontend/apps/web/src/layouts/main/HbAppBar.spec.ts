import { mountWithPlugins } from '@homebook/test-utils';

import HbAppBar from './HbAppBar.vue';

const props = { instanceName: 'Villa Kunterbunt', userName: 'lars', signedIn: true };

describe('HbAppBar', () => {
  it('offers the profile menu when signed in', async () => {
    const { wrapper } = await mountWithPlugins(HbAppBar, { props });

    expect(wrapper.find('[aria-label="mainLayout.profileMenu.label"]').exists()).toBe(true);
    expect(wrapper.find('.hb-app-bar__login').exists()).toBe(false);
  });

  it('offers the login button when signed out', async () => {
    const { wrapper } = await mountWithPlugins(HbAppBar, { props: { ...props, signedIn: false } });

    expect(wrapper.find('.hb-app-bar__login').attributes('href')).toBe('/Login');
    expect(wrapper.find('[aria-label="mainLayout.profileMenu.label"]').exists()).toBe(false);
  });

  it('shows the menu button, the title and the overflow menu only when compact', async () => {
    const wide = await mountWithPlugins(HbAppBar, { props });
    expect(wide.wrapper.find('[aria-label="mainLayout.menuButton.label"]').exists()).toBe(false);
    expect(wide.wrapper.find('[aria-label="mainLayout.moreMenu.label"]').exists()).toBe(false);

    const compact = await mountWithPlugins(HbAppBar, { props: { ...props, compact: true } });
    expect(compact.wrapper.find('.hb-app-bar__title').text()).toBe('Villa Kunterbunt - appTitle');
    expect(compact.wrapper.find('[aria-label="mainLayout.moreMenu.label"]').exists()).toBe(true);

    await compact.wrapper.find('[aria-label="mainLayout.menuButton.label"]').trigger('click');
    expect(compact.wrapper.emitted('toggleDrawer')).toHaveLength(1);
  });

  it('shows the user name and signs out from the profile menu', async () => {
    const { wrapper } = await mountWithPlugins(HbAppBar, { props, attachTo: document.body });

    await wrapper.find('[aria-label="mainLayout.profileMenu.label"]').trigger('click');
    const menu = document.body.querySelector('.hb-app-bar__menu');
    expect(menu?.textContent).toContain('lars');

    const logout = [...document.body.querySelectorAll<HTMLElement>('.p-menu-item-link')].find((link) =>
      link.textContent?.includes('accountMenu.logout'),
    );
    logout?.click();

    expect(wrapper.emitted('logout')).toHaveLength(1);
    wrapper.unmount();
  });

  it('renders the search slot', async () => {
    const { wrapper } = await mountWithPlugins(HbAppBar, {
      props,
      slots: { search: '<input class="probe-search" />' },
    });

    expect(wrapper.find('.hb-app-bar__search .probe-search').exists()).toBe(true);
  });
});
