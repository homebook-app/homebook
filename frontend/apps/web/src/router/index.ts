import { createRouter, createWebHistory, type Router, type RouteRecordRaw, type RouterHistory } from 'vue-router';

import PlaceholderPage from '@/pages/PlaceholderPage.vue';

// Exists in development only, the condition is dead code in a production build and the page is
// not bundled. Step 08 turns it into /Settings/Developer/Colors and /Settings/Developer/Icons.
const devRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/design-system',
        name: 'dev-design-system',
        component: () => import('@/pages/dev/DesignProofPage.vue'),
      },
    ]
  : [];

// Placeholder until step 06 brings the real route table
export const routes: RouteRecordRaw[] = [{ path: '/', name: 'placeholder', component: PlaceholderPage }, ...devRoutes];

export function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)): Router {
  return createRouter({ history, routes });
}
