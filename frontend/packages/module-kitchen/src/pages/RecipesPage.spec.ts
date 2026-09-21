import { useMenuStore } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';

import RecipesPage from './RecipesPage.vue';

describe('RecipesPage', () => {
  it('links the recipes to the meal plan in the context menu', async () => {
    await mountWithPlugins(RecipesPage);

    expect(useMenuStore().items).toEqual([
      {
        title: 'kitchen.startMenuItem.mealPlan.title',
        url: '/Kitchen/MealPlan',
        icon: { set: 'windows11-outline', name: 'RestaurantMenu' },
      },
    ]);
  });
});
