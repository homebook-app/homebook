import { createRouter, createWebHistory, type Router, type RouteRecordRaw, type RouterHistory } from 'vue-router';

import { coreRoutes, devRoutes, notFoundRoute } from './routes';

export { installGuards, loginLocation, SESSION_EXPIRED_REASON } from './guards';
export { coreRoutes, devRoutes, notFoundRoute, RouteNames } from './routes';

/** Every route the app itself declares. Module routes are added by the module registry. */
export const routes: RouteRecordRaw[] = [...coreRoutes, ...devRoutes, notFoundRoute];

export function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)): Router {
  return createRouter({ history, routes });
}
