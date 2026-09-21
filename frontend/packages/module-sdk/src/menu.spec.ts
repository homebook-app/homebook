import { createPinia, setActivePinia } from 'pinia';
import { effectScope, nextTick, shallowRef } from 'vue';

import { useContextMenu, useMenuStore, type MenuItem } from './menu';

const recipes: MenuItem = { title: 'Recipes', url: '/Kitchen/Recipes' };
const mealPlan: MenuItem = { title: 'Meal plan', url: '/Kitchen/MealPlan' };

describe('useMenuStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('replaces and clears the entries', () => {
    const store = useMenuStore();

    store.setItems([recipes]);
    expect(store.items).toEqual([recipes]);

    store.clear();
    expect(store.items).toEqual([]);
  });

  it('clears a registration only while it is current', () => {
    const store = useMenuStore();
    const first = store.setItems([recipes]);
    store.setItems([mealPlan]);

    store.clear(first);

    expect(store.items).toEqual([mealPlan]);
  });
});

describe('useContextMenu', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('registers the entries and follows reactive changes', async () => {
    const store = useMenuStore();
    const items = shallowRef<MenuItem[]>([recipes]);
    const scope = effectScope();

    scope.run(() => useContextMenu(items));
    expect(store.items).toEqual([recipes]);

    items.value = [mealPlan];
    await nextTick();
    expect(store.items).toEqual([mealPlan]);

    scope.stop();
    expect(store.items).toEqual([]);
  });

  it('keeps the entries of the next page when the previous one is disposed later', () => {
    const store = useMenuStore();
    const previous = effectScope();
    const next = effectScope();

    previous.run(() => useContextMenu([recipes]));
    next.run(() => useContextMenu([mealPlan]));
    previous.stop();

    expect(store.items).toEqual([mealPlan]);
  });
});
