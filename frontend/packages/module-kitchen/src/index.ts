// Entry point of the kitchen module. Recipes and the meal plan are ported in step 09.
import { defineModule } from '@homebook/module-sdk';

import HbRecipeSearchResults from './components/HbRecipeSearchResults.vue';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import { kitchenRoutes } from './routes';

export const kitchenModule = defineModule({
  key: 'homebook.kitchen',
  nameKey: 'kitchen.moduleName',
  descriptionKey: 'kitchen.moduleDescription',
  icon: { set: 'glass-morphism', name: 'Tableware' },
  routes: kitchenRoutes,
  startMenuItems: [
    {
      titleKey: 'kitchen.startMenuItem.recipes.title',
      captionKey: 'kitchen.startMenuItem.recipes.caption',
      url: '/Kitchen/Recipes',
      icon: 'CookBook',
      color: 'var(--hb-color-amber)',
    },
    {
      titleKey: 'kitchen.startMenuItem.pantry.title',
      captionKey: 'kitchen.startMenuItem.pantry.caption',
      url: '/Kitchen/Pantry',
      icon: 'GroceryShelf',
      color: 'var(--hb-color-teal)',
    },
    {
      titleKey: 'kitchen.startMenuItem.mealPlan.title',
      captionKey: 'kitchen.startMenuItem.mealPlan.caption',
      url: '/Kitchen/MealPlan',
      icon: 'RestaurantMenu',
      color: 'var(--hb-color-cerulean)',
    },
  ],
  widgets: [],
  searchResultComponents: {
    'HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler': HbRecipeSearchResults,
  },
  messages: { en, de, fr, ru },
});
