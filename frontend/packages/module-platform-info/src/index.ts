// Entry point of the platform info module. It has no pages; its VersionWidget arrives with the
// widget grid in step 10.
import { defineModule } from '@homebook/module-sdk';

import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';

export const platformInfoModule = defineModule({
  key: 'homebook.platforminfo',
  nameKey: 'platformInfo.moduleName',
  descriptionKey: 'platformInfo.moduleDescription',
  icon: { set: 'liquid-glass-color', name: 'Help' },
  routes: [],
  startMenuItems: [],
  widgets: [],
  searchResultComponents: {},
  messages: { en, de, fr, ru },
});
