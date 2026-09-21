import { useMenuStore } from '@homebook/module-sdk';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore, type BootStatus } from '@/stores/bootstrap';

import { installGuards } from './guards';
import { routes } from './index';

interface Session {
  status?: BootStatus;
  authenticated?: boolean;
  hasSession?: boolean;
  admin?: boolean;
  devMode?: boolean;
}

function setup(session: Session = {}): { router: Router; pinia: Pinia } {
  const pinia = createPinia();
  setActivePinia(pinia);

  const bootstrap = useBootstrapStore();
  vi.spyOn(bootstrap, 'start').mockResolvedValue(session.status ?? 'ready');
  bootstrap.devMode = session.devMode ?? false;

  const auth = useAuthStore();
  const authenticated = session.authenticated ?? true;
  vi.spyOn(auth, 'isAuthenticated').mockReturnValue(authenticated);
  vi.spyOn(auth, 'clear').mockImplementation(() => undefined);
  // Computed getters of a setup store are read-only; the token drives hasSession and isAdmin
  auth.token = session.hasSession === false || (!authenticated && session.hasSession !== true) ? null : 'token';
  vi.spyOn(auth, 'isAdmin', 'get').mockReturnValue(session.admin ?? false);

  const router = createRouter({ history: createMemoryHistory(), routes });
  installGuards(router, pinia);
  return { router, pinia };
}

async function visit(router: Router, path: string) {
  await router.push(path).catch(() => undefined);
  return router.currentRoute.value;
}

describe('installGuards', () => {
  it('lets a signed-in user through', async () => {
    const { router } = setup();

    expect((await visit(router, '/Settings/About')).fullPath).toBe('/Settings/About');
  });

  it.each(['setupRequired', 'updateRequired'] as const)('sends everything to /Setup while %s', async (status) => {
    const { router } = setup({ status });

    expect((await visit(router, '/Settings')).path).toBe('/Setup');
    expect((await visit(router, '/Setup')).path).toBe('/Setup');
  });

  it('sends a signed-out user to the login page and back afterwards', async () => {
    const { router } = setup({ authenticated: false, hasSession: false });

    const location = await visit(router, '/Settings/About?tab=2');

    expect(location.path).toBe('/Login');
    expect(location.query).toEqual({ returnUrl: '/Settings/About?tab=2' });
  });

  it('marks an expired session and clears it', async () => {
    const { router } = setup({ authenticated: false, hasSession: true });

    const location = await visit(router, '/Settings');

    expect(location.query).toEqual({ returnUrl: '/Settings', reason: 'expired' });
    expect(useAuthStore().clear).toHaveBeenCalled();
  });

  it('keeps the login page reachable without a session', async () => {
    const { router } = setup({ authenticated: false, hasSession: false });

    expect((await visit(router, '/Login')).path).toBe('/Login');
  });

  it('keeps the setup reachable without a session while it is needed', async () => {
    const { router } = setup({ status: 'setupRequired', authenticated: false, hasSession: false });

    expect((await visit(router, '/Setup')).path).toBe('/Setup');
  });

  it('sends everyone away from the setup of an operational instance', async () => {
    const { router } = setup();

    expect((await visit(router, '/Setup')).path).toBe('/');
  });

  it('sends a signed-in user away from the login page', async () => {
    const { router } = setup();

    expect((await visit(router, '/Login')).path).toBe('/');
  });

  it('keeps regular users out of the user administration', async () => {
    const { router } = setup({ admin: false });

    expect((await visit(router, '/Settings/Users')).path).toBe('/');
    expect((await visit(router, '/Settings/Users/0f8fad5b-d9cb-469f-a165-70867728950e')).path).toBe('/');
  });

  it('lets admins into the user administration', async () => {
    const { router } = setup({ admin: true });

    expect((await visit(router, '/Settings/Users/Add')).path).toBe('/Settings/Users/Add');
  });

  it('hides the developer pages outside developer mode', async () => {
    const { router } = setup({ devMode: false });

    const location = await visit(router, '/Settings/Developer/Colors');

    expect(location.name).toBe('not-found');
    expect(location.path).toBe('/Settings/Developer/Colors');
  });

  it('shows the developer pages in developer mode', async () => {
    const { router } = setup({ devMode: true });

    expect((await visit(router, '/Settings/Developer/Colors')).name).toBe('settings-developer-colors');
  });

  it('corrects the spelling of a path to its canonical form', async () => {
    const { router } = setup({ authenticated: false, hasSession: false });

    expect((await visit(router, '/login')).fullPath).toBe('/Login');
  });

  it('corrects the spelling of the setup path while it is needed', async () => {
    const { router } = setup({ status: 'setupRequired' });

    expect((await visit(router, '/setup?step=2')).fullPath).toBe('/Setup?step=2');
  });

  it('keeps the spelling of route parameters', async () => {
    const { router } = setup({ admin: true });
    const id = '0F8FAD5B-D9CB-469F-A165-70867728950E';

    expect((await visit(router, `/settings/users/${id}`)).path).toBe(`/Settings/Users/${id}`);
  });

  it('shows the not-found page for unknown paths', async () => {
    const { router } = setup();

    expect((await visit(router, '/Nowhere')).name).toBe('not-found');
  });

  it('lets any page through while the backend is unreachable, the app shows the error', async () => {
    const { router } = setup({ status: 'unreachable', authenticated: false });

    expect((await visit(router, '/Settings')).path).toBe('/Settings');
  });

  it('clears the context menu on every navigation', async () => {
    const { router } = setup();
    useMenuStore().setItems([{ title: 'Recipes', url: '/Kitchen/Recipes' }]);

    await visit(router, '/Settings');

    expect(useMenuStore().items).toEqual([]);
  });
});
