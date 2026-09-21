import { useMenuStore } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, nextTick } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useWallpaperStore } from '@/stores/wallpaper';

import HbAppBar from './main/HbAppBar.vue';
import HbDrawer from './main/HbDrawer.vue';
import MainLayout from './MainLayout.vue';

const Empty = defineComponent({ render: () => h('div') });
const routes: RouteRecordRaw[] = [
  { path: '/', component: Empty },
  { path: '/Login', name: 'login', component: Empty },
];

function mockViewport(wide: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: wide, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}

async function mountLayout(signedIn: boolean) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const auth = useAuthStore();
  auth.token = signedIn ? 'token' : null;
  vi.spyOn(auth, 'userName', 'get').mockReturnValue('lars');
  useBootstrapStore().instanceName = 'Villa Kunterbunt';
  const wallpaper = useWallpaperStore();
  const load = vi.spyOn(wallpaper, 'load').mockResolvedValue();
  const clear = vi.spyOn(wallpaper, 'clear');
  const logout = vi.spyOn(auth, 'logout').mockImplementation(async () => {
    auth.token = null;
  });
  const mounted = await mountWithPlugins(MainLayout, {
    pinia,
    routes,
    slots: { default: '<p class="probe">page</p>' },
  });
  return { ...mounted, load, clear, logout, auth };
}

describe('MainLayout', () => {
  beforeEach(() => mockViewport(true));

  it('renders the page between the chrome', async () => {
    const { wrapper } = await mountLayout(true);

    expect(wrapper.find('.hb-main-content .probe').exists()).toBe(true);
    expect(wrapper.find('header.hb-header-appbar').exists()).toBe(true);
    expect(wrapper.find('footer.hb-footer-appbar').exists()).toBe(true);
  });

  it('passes session and instance to the app bar', async () => {
    const { wrapper } = await mountLayout(true);

    expect(wrapper.findComponent(HbAppBar).props()).toMatchObject({
      instanceName: 'Villa Kunterbunt',
      userName: 'lars',
      signedIn: true,
      compact: false,
    });
  });

  it('loads the wallpaper with the session and drops it without', async () => {
    const { load, clear, auth } = await mountLayout(true);
    expect(load).toHaveBeenCalledOnce();

    auth.token = null;
    await nextTick();

    expect(clear).toHaveBeenCalled();
  });

  it('shows the context entries of the current page in the drawer', async () => {
    const { wrapper } = await mountLayout(true);

    useMenuStore().setItems([{ title: 'Recipes', url: '/Kitchen/Recipes' }]);
    await nextTick();

    expect(wrapper.findComponent(HbDrawer).props('items')).toEqual([{ title: 'Recipes', url: '/Kitchen/Recipes' }]);
  });

  it('signs out and goes to the login page', async () => {
    const { wrapper, router, logout } = await mountLayout(true);

    wrapper.findComponent(HbAppBar).vm.$emit('logout');

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/Login'));
    expect(logout).toHaveBeenCalledOnce();
  });

  it('switches to the compact chrome below the md breakpoint', async () => {
    mockViewport(false);
    const { wrapper } = await mountLayout(false);

    expect(wrapper.find('.hb-main-layout--compact').exists()).toBe(true);
    expect(wrapper.findComponent(HbDrawer).props('compact')).toBe(true);

    wrapper.findComponent(HbAppBar).vm.$emit('toggleDrawer');
    await nextTick();
    expect(wrapper.findComponent(HbDrawer).props('open')).toBe(true);
  });
});
