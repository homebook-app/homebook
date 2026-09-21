// Entry point of the finances module. Saving goals are ported in step 10.
import { defineModule } from '@homebook/module-sdk';

import HbSavingGoalSearchResults from './components/HbSavingGoalSearchResults.vue';
import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import { financesRoutes } from './routes';

export const financesModule = defineModule({
  key: 'homebook.finances',
  nameKey: 'finances.moduleName',
  descriptionKey: 'finances.moduleDescription',
  icon: { set: 'liquid-glass-color', name: 'Investment' },
  routes: financesRoutes,
  startMenuItems: [
    {
      titleKey: 'finances.startMenuItem.overview.title',
      captionKey: 'finances.startMenuItem.overview.caption',
      url: '/Finances',
      icon: 'Graph',
      color: 'var(--hb-color-denim)',
    },
  ],
  // CurrentBudgetWidget arrives with the widget grid in step 10
  widgets: [],
  searchResultComponents: {
    'HomeBook.Backend.Module.Finances.Module.SavingGoalSearchHandler': HbSavingGoalSearchResults,
  },
  messages: { en, de, fr, ru },
});
