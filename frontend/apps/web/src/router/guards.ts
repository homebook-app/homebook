import { useMenuStore } from '@homebook/module-sdk';
import type { Pinia } from 'pinia';
import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';

import { RouteNames } from './routes';

/** Query value on `/Login` telling the page why the user was sent there. */
export const SESSION_EXPIRED_REASON = 'expired';

/**
 * The path in its canonical spelling. vue-router matches case-insensitively, so `/login` finds
 * the `/Login` route; resolving the route by name gives the spelling it was declared with.
 */
function canonicalPath(router: Router, to: RouteLocationNormalized): string | undefined {
  if (to.name === undefined || to.name === RouteNames.notFound) {
    return undefined;
  }
  return router.resolve({ name: to.name, params: to.params }).path;
}

/** Where to send a user who needs to sign in first. */
export function loginLocation(returnTo: string | undefined, expired: boolean): RouteLocationRaw {
  const query: Record<string, string> = {};
  if (returnTo !== undefined && returnTo !== '/') {
    query.returnUrl = returnTo;
  }
  if (expired) {
    query.reason = SESSION_EXPIRED_REASON;
  }
  return { name: RouteNames.login, query };
}

/**
 * Installs the navigation guards: the context menu is cleared, the startup sequence is awaited,
 * the spelling is canonicalized, and setup, sign-in, admin and developer-mode requirements are
 * enforced.
 */
export function installGuards(router: Router, pinia: Pinia): void {
  router.beforeEach(async (to) => {
    useMenuStore(pinia).clear();

    const canonical = canonicalPath(router, to);
    if (canonical !== undefined && canonical !== to.path) {
      return { path: canonical, query: to.query, hash: to.hash, replace: true };
    }

    const bootstrap = useBootstrapStore(pinia);
    const status = await bootstrap.start();

    if (status === 'setupRequired' || status === 'updateRequired') {
      return to.name === RouteNames.setup ? true : { name: RouteNames.setup, replace: true };
    }
    if (status !== 'ready') {
      // The app shows the error view instead of the page
      return true;
    }
    if (to.name === RouteNames.setup) {
      // Nothing to set up on an operational instance
      return { name: RouteNames.home, replace: true };
    }

    const auth = useAuthStore(pinia);
    if (to.name === RouteNames.login) {
      return auth.isAuthenticated() ? { name: RouteNames.home, replace: true } : true;
    }
    if (to.meta.requiresAuth !== false && !auth.isAuthenticated()) {
      const expired = auth.hasSession;
      auth.clear();
      return loginLocation(to.fullPath, expired);
    }
    if (to.meta.requiresAdmin === true && !auth.isAdmin) {
      return { name: RouteNames.home, replace: true };
    }
    if (to.meta.devOnly === true && !bootstrap.devMode) {
      return {
        name: RouteNames.notFound,
        params: { pathMatch: to.path.split('/').filter(Boolean) },
        replace: true,
      };
    }
    return true;
  });
}
