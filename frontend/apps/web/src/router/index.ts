import { createRouter, createWebHistory, type Router, type RouteRecordRaw, type RouterHistory } from 'vue-router';

import PlaceholderPage from '@/pages/PlaceholderPage.vue';

// Placeholder until step 06 brings the real route table
export const routes: RouteRecordRaw[] = [{ path: '/', name: 'placeholder', component: PlaceholderPage }];

export function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)): Router {
  return createRouter({ history, routes });
}
