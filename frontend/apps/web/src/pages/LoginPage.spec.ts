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

type Wrapper = Awaited<ReturnType<typeof mountLogin>>['wrapper'];

async function fill(wrapper: Wrapper, user: string, password: string) {
  await wrapper.find('input[name="username"]').setValue(user);
  await wrapper.find('input[name="password"]').setValue(password);
}

async function submit(wrapper: Wrapper, user = 'lars.k', password = 'secret') {
  await fill(wrapper, user, password);
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

    await vi.waitFor(() => expect(loginSpy).toHaveBeenCalledWith('lars.k', 'secret'));
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

  it('reports rejected credentials with a translated message', async () => {
    const { wrapper, router } = await mountLogin(async () => false);

    await submit(wrapper);

    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').exists()).toBe(true));
    expect(wrapper.find('[role="alert"]').text()).toBe('account.login.invalidCredentials');
    expect(router.currentRoute.value.path).toBe('/Login');
  });

  it('reports any other failure', async () => {
    const { wrapper } = await mountLogin(() => Promise.reject(new Error('offline')));

    await submit(wrapper);

    await vi.waitFor(() => expect(wrapper.find('[role="alert"]').text()).toBe('account.login.error'));
  });

  it('explains an expired session', async () => {
    const { wrapper } = await mountLogin(async () => true, '/Login?reason=expired');

    expect(wrapper.text()).toContain('account.login.sessionExpired');
  });

  it('does not submit empty fields', async () => {
    const { wrapper, loginSpy } = await mountLogin(async () => true);

    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.text()).toContain('validation.required'));
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('demands at least five characters for username and password', async () => {
    const { wrapper, loginSpy } = await mountLogin(async () => true);

    await fill(wrapper, 'lars', '1234');
    await wrapper.find('form').trigger('submit');

    await vi.waitFor(() => expect(wrapper.findAll('.hb-form-field__error')).toHaveLength(2));
    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.minLength');
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('keeps both fields and the submit button in one form, so Enter submits', async () => {
    // happy-dom has no implicit submission; the browser submits a form with a submit button on Enter
    const { wrapper } = await mountLogin(async () => true);

    const form = wrapper.find('form');
    expect(form.find('input[name="username"]').exists()).toBe(true);
    expect(form.find('input[name="password"]').exists()).toBe(true);
    expect(form.find('button[type="submit"]').exists()).toBe(true);
  });

  it('shows the busy state and does not send a second request meanwhile', async () => {
    let resolve: (value: boolean) => void = () => undefined;
    const { wrapper, loginSpy } = await mountLogin(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );

    await fill(wrapper, 'lars.k', 'secret');
    await wrapper.find('form').trigger('submit');
    await vi.waitFor(() => expect(loginSpy).toHaveBeenCalledTimes(1));

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.text()).toContain('account.login.signingInButton.text');

    await wrapper.find('form').trigger('submit');
    await new Promise((settle) => setTimeout(settle, 0));
    expect(loginSpy).toHaveBeenCalledTimes(1);

    resolve(false);
    await vi.waitFor(() => expect(button.attributes('disabled')).toBeUndefined());
  });
});
