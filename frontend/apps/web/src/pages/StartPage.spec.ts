import { UiStartMenuItem } from '@homebook/ui';
import { mountWithPlugins } from '@homebook/test-utils';

import { createModuleRegistry, moduleRegistryKey, modules } from '@/modules';

import StartPage from './StartPage.vue';

describe('StartPage', () => {
  it('shows the tiles of every module with translated texts', async () => {
    const { wrapper } = await mountWithPlugins(StartPage, {
      global: { provide: { [moduleRegistryKey as symbol]: createModuleRegistry(modules) } },
    });

    const tiles = wrapper.findAllComponents(UiStartMenuItem);
    expect(tiles.map((tile) => tile.props('url'))).toEqual([
      '/Kitchen/Recipes',
      '/Kitchen/Pantry',
      '/Kitchen/MealPlan',
      '/Finances',
    ]);
    expect(tiles[0]?.props()).toMatchObject({
      title: 'kitchen.startMenuItem.recipes.title',
      caption: 'kitchen.startMenuItem.recipes.caption',
      icon: 'CookBook',
      color: 'var(--hb-color-amber)',
    });
  });
});
