import { useMenuStore } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';

import MealPlanPage from './MealPlanPage.vue';

describe('MealPlanPage', () => {
  it('links the meal plan to the recipes in the context menu', async () => {
    await mountWithPlugins(MealPlanPage);

    expect(useMenuStore().items).toEqual([
      {
        title: 'kitchen.startMenuItem.recipes.title',
        url: '/Kitchen/Recipes',
        icon: { set: 'windows11-outline', name: 'CookBook' },
      },
    ]);
  });
});
