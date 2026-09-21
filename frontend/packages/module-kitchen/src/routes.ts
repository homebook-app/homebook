import { GUID_ROUTE_PATTERN, ModulePlaceholderPage } from '@homebook/module-sdk';
import type { RouteRecordRaw } from 'vue-router';

// Paths taken over character by character from the Blazor pages. Empty shells until step 09.
export const kitchenRoutes: RouteRecordRaw[] = [
  { path: '/Kitchen/Recipes', name: 'kitchen-recipes', component: () => import('./pages/RecipesPage.vue') },
  { path: '/Kitchen/Recipes/New', name: 'kitchen-recipes-new', component: ModulePlaceholderPage },
  {
    path: `/Kitchen/Recipes/:RecipeId(${GUID_ROUTE_PATTERN})/Edit`,
    name: 'kitchen-recipes-edit',
    component: ModulePlaceholderPage,
  },
  {
    path: `/Kitchen/Recipes/:RecipeId(${GUID_ROUTE_PATTERN})/View`,
    name: 'kitchen-recipes-view',
    component: ModulePlaceholderPage,
  },
  { path: '/Kitchen/MealPlan', name: 'kitchen-meal-plan', component: () => import('./pages/MealPlanPage.vue') },
  { path: '/Kitchen/Pantry', name: 'kitchen-pantry', component: ModulePlaceholderPage },
];
