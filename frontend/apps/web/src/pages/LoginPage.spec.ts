import { mountWithPlugins } from '@homebook/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';

import LoginPage from './LoginPage.vue';

const Target = defineComponent({ render: () => h('div') });

const routes: RouteRecordRaw[] = [
  { path: '/Login', name: 'login', component: LoginPage },
  { path: '/', component: Target },
  { path: '/Settings', component: Target },
];

async function mountLogin(login: () => Promise<boolean>, initialRoute = '/Login') {
  const pinia = createPinia();
  setActivePinia(pinia);
  const loginSpy = vi.spyOn(useAuthStore(), 'login').mockImplementation(login);
  const preference = vi.spyOn(useLocaleStore(), 'loadUserPreference').mockResolvedValue();
  const mounted = await mountWithPlugins(LoginPage, { routes, pinia, initialRoute });
  return { ...mounted, loginSpy, preference };
}

async function submit(wrapper: Awaited<ReturnType<typeof mountLogin>>['wrapper'], user = 'lars', password = 'secret') {
  await wrapper.find('input[name="username"]').setValue(user);
  await wrapper.find('input[name="password"]').setValue(password);
  await wrapper.find('form').trigger('submit');
  await vi.waitFor(() => expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined());
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('signs in and returns to the requested page', async () => {
    const { wrapper, router, loginSpy, preference } = await mountLogin(async () => true, '/Login?returnUrl=/Settings');

    await submit(wrapper);

    expect(loginSpy).toHaveBeenCalledWith('lars', 'secret');
    expect(preference).toHaveBeenCalled();
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/Settings'));
  });

  it('goes to the start page without a return address', async () => {
    const { wrapper, router } = await mountLogin(async () => true);

    await submit(wrapper);

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
  });

  it('never returns to another origin', async () => {
    const { wrapper, router } = await mountLogin(async () => true, '/Login?returnUrl=//evil.example');

    await submit(wrapper);

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
  });

  it('reports rejected credentials', async () => {
    const { wrapper, router } = await mountLogin(async () => false);

    await submit(wrapper);

    expect(wrapper.find('[role="alert"]').text()).toBe('account.login.invalidCredentials');
    expect(router.currentRoute.value.path).toBe('/Login');
  });

  it('reports any other failure', async () => {
    const { wrapper } = await mountLogin(() => Promise.reject(new Error('offline')));

    await submit(wrapper);

    expect(wrapper.find('[role="alert"]').text()).toBe('account.login.error');
  });

  it('explains an expired session', async () => {
    const { wrapper } = await mountLogin(async () => true, '/Login?reason=expired');

    expect(wrapper.text()).toContain('account.login.sessionExpired');
  });

  it('does not submit empty fields', async () => {
    const { wrapper, loginSpy } = await mountLogin(async () => true);

    await wrapper.find('form').trigger('submit');

    expect(loginSpy).not.toHaveBeenCalled();
  });
});
