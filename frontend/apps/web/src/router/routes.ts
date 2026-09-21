import { GUID_ROUTE_PATTERN } from '@homebook/module-sdk';
import type { RouteRecordRaw } from 'vue-router';

import NotFoundPage from '@/pages/NotFoundPage.vue';
import PlaceholderPage from '@/pages/PlaceholderPage.vue';

export const RouteNames = {
  home: 'home',
  login: 'login',
  setup: 'setup',
  settings: 'settings',
  notFound: 'not-found',
} as const;

// The paths are taken over character by character from the Blazor pages, so existing bookmarks
// keep working. The pages are empty shells until their migration step.
export const coreRoutes: RouteRecordRaw[] = [
  { path: '/', name: RouteNames.home, component: () => import('@/pages/StartPage.vue') },
  {
    path: '/Login',
    name: RouteNames.login,
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'contentOnly', requiresAuth: false },
  },
  {
    path: '/Setup',
    name: RouteNames.setup,
    component: PlaceholderPage,
    meta: { layout: 'contentOnly', requiresAuth: false },
  },
  { path: '/Settings', name: RouteNames.settings, component: PlaceholderPage },
  { path: '/Settings/About', name: 'settings-about', component: PlaceholderPage },
  { path: '/Settings/Appearance', name: 'settings-appearance', component: PlaceholderPage },
  { path: '/Settings/Localization', name: 'settings-localization', component: PlaceholderPage },
  { path: '/Settings/Instance', name: 'settings-instance', component: PlaceholderPage },
  { path: '/Settings/Modules', name: 'settings-modules', component: PlaceholderPage },
  { path: '/Settings/Database', name: 'settings-database', component: PlaceholderPage },
  { path: '/Settings/Storage', name: 'settings-storage', component: PlaceholderPage },
  { path: '/Settings/Ai', name: 'settings-ai', component: PlaceholderPage },
  { path: '/Settings/Feedback', name: 'settings-feedback', component: PlaceholderPage },
  { path: '/Settings/Users', name: 'settings-users', component: PlaceholderPage, meta: { requiresAdmin: true } },
  {
    path: '/Settings/Users/Add',
    name: 'settings-users-add',
    component: PlaceholderPage,
    meta: { requiresAdmin: true },
  },
  {
    path: `/Settings/Users/:UserId(${GUID_ROUTE_PATTERN})`,
    name: 'settings-users-edit',
    component: PlaceholderPage,
    meta: { requiresAdmin: true },
  },
  { path: '/Settings/Developer', name: 'settings-developer', component: PlaceholderPage, meta: { devOnly: true } },
  {
    path: '/Settings/Developer/Components',
    name: 'settings-developer-components',
    component: PlaceholderPage,
    meta: { devOnly: true },
  },
  {
    path: '/Settings/Developer/Colors',
    name: 'settings-developer-colors',
    component: PlaceholderPage,
    meta: { devOnly: true },
  },
  {
    path: '/Settings/Developer/Icons',
    name: 'settings-developer-icons',
    component: PlaceholderPage,
    meta: { devOnly: true },
  },
];

// Exists in development builds only, the condition is dead code in a production build and the
// page is not bundled. Step 08 turns it into /Settings/Developer/Colors and /Settings/Developer/Icons.
export const devRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/design-system',
        name: 'dev-design-system',
        component: () => import('@/pages/dev/DesignProofPage.vue'),
        meta: { requiresAuth: false },
      },
    ]
  : [];

/** vue-router ranks the catch-all below every other route, module routes added later included. */
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: RouteNames.notFound,
  component: NotFoundPage,
  meta: { requiresAuth: false },
};
