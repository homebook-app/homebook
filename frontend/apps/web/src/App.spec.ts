import { mountWithPlugins } from '@homebook/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import App from '@/App.vue';
import BootErrorView from '@/components/boot/BootErrorView.vue';
import { createModuleRegistry, moduleRegistryKey } from '@/modules';
import { useBootstrapStore, type BootStatus } from '@/stores/bootstrap';

const Page = defineComponent({ render: () => h('div', { class: 'probe-page' }) });

const routes: RouteRecordRaw[] = [
  { path: '/', component: Page },
  { path: '/Login', component: Page, meta: { layout: 'contentOnly' } },
];

async function mountApp(status: BootStatus, initialRoute = '/') {
  const pinia = createPinia();
  setActivePinia(pinia);
  const bootstrap = useBootstrapStore();
  bootstrap.status = status;
  const retry = vi.spyOn(bootstrap, 'retry').mockImplementation(async () => {
    bootstrap.status = 'ready';
    return 'ready';
  });
  const mounted = await mountWithPlugins(App, {
    routes,
    pinia,
    initialRoute,
    global: { provide: { [moduleRegistryKey as symbol]: createModuleRegistry([]) } },
  });
  await vi.waitFor(() => expect(mounted.wrapper.find('.hb-boot-screen').exists()).toBe(status === 'loading'));
  return { ...mounted, retry };
}

describe('App', () => {
  it('shows the loading state while the startup sequence runs', async () => {
    const { wrapper } = await mountApp('loading');

    expect(wrapper.find('.probe-page').exists()).toBe(false);
  });

  it('renders the page inside the main layout', async () => {
    const { wrapper } = await mountApp('ready');

    expect(wrapper.find('.hb-main-layout .probe-page').exists()).toBe(true);
  });

  it('renders pages without chrome in the content-only layout', async () => {
    const { wrapper } = await mountApp('ready', '/Login');

    expect(wrapper.find('.hb-content-only .probe-page').exists()).toBe(true);
    expect(wrapper.find('.hb-main-layout').exists()).toBe(false);
  });

  it.each([
    ['unreachable', 'unreachable'],
    ['setupRunning', 'setupRunning'],
  ] as const)('explains the %s state and retries', async (status, reason) => {
    const { wrapper, retry } = await mountApp(status);

    const error = wrapper.findComponent(BootErrorView);
    expect(error.props('reason')).toBe(reason);

    error.vm.$emit('retry');
    await vi.waitFor(() => expect(wrapper.find('.probe-page').exists()).toBe(true));
    expect(retry).toHaveBeenCalledOnce();
  });
});
