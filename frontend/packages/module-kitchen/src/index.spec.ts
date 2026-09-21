import { describeCatalogs } from '@homebook/test-utils';

import { kitchenModule } from './index';

describeCatalogs('kitchen', kitchenModule.messages);

describe('kitchenModule', () => {
  it('uses the backend module key', () => {
    expect(kitchenModule.key).toBe('homebook.kitchen');
  });

  it('keeps every route in its original spelling', () => {
    expect(kitchenModule.routes.map((route) => route.path)).toEqual([
      '/Kitchen/Recipes',
      '/Kitchen/Recipes/New',
      expect.stringMatching(/^\/Kitchen\/Recipes\/:RecipeId\(.+\)\/Edit$/),
      expect.stringMatching(/^\/Kitchen\/Recipes\/:RecipeId\(.+\)\/View$/),
      '/Kitchen/MealPlan',
      '/Kitchen/Pantry',
    ]);
  });

  it('translates its name and its tiles in its own catalog', () => {
    const keys = [
      kitchenModule.nameKey,
      ...kitchenModule.startMenuItems.flatMap((item) => [item.titleKey, item.captionKey]),
    ];
    for (const key of keys) {
      const value = key
        .split('.')
        .reduce<unknown>((node, segment) => (node as Record<string, unknown>)[segment], kitchenModule.messages.en);
      expect(typeof value, key).toBe('string');
    }
  });
});
