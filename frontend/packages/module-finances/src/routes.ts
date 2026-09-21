import { GUID_ROUTE_PATTERN, ModulePlaceholderPage } from '@homebook/module-sdk';
import type { RouteRecordRaw } from 'vue-router';

// Paths taken over character by character from the Blazor pages. Empty shells until step 10.
export const financesRoutes: RouteRecordRaw[] = [
  { path: '/Finances', name: 'finances', component: () => import('./pages/FinancesOverviewPage.vue') },
  { path: '/Finances/Savings/Overview', name: 'finances-savings', component: ModulePlaceholderPage },
  { path: '/Finances/Savings/Add', name: 'finances-savings-add', component: ModulePlaceholderPage },
  {
    path: `/Finances/Savings/:SavingGoalId(${GUID_ROUTE_PATTERN})`,
    name: 'finances-savings-edit',
    component: ModulePlaceholderPage,
  },
  { path: '/Finances/Settings', name: 'finances-settings', component: ModulePlaceholderPage },
];
