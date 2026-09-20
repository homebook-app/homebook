import { createI18n } from 'vue-i18n';

import deDE from './de-DE.json';
import enUS from './en-US.json';
import frFR from './fr-FR.json';

export const FALLBACK_LOCALE = 'en-US';

export const messages = {
  'de-DE': deDE,
  'en-US': enUS,
  'fr-FR': frFR,
};

// The catalogs are filled in step 06, locale detection arrives with the user preferences
export function createAppI18n() {
  return createI18n({
    legacy: false,
    locale: FALLBACK_LOCALE,
    fallbackLocale: FALLBACK_LOCALE,
    messages,
  });
}
