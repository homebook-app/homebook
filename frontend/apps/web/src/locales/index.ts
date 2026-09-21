import { createI18n } from 'vue-i18n';

import de from './de.json';
import en from './en.json';
import fr from './fr.json';
import ru from './ru.json';

/** Catalogs are plain language codes. English is the only complete one. */
export const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'ru'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const messages: Record<AppLocale, typeof en> = { en, de, fr, ru };

function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Maps a culture tag as the backend and the browser use it (`de-DE`, `en-GB`, `en-EN`) to the
 * catalog of its language. `undefined` when there is no catalog for that language.
 */
export function resolveLocale(tag: string | null | undefined): AppLocale | undefined {
  const language = tag?.trim().split(/[-_]/)[0]?.toLowerCase();
  return language !== undefined && isAppLocale(language) ? language : undefined;
}

/**
 * Creates the i18n instance. There is deliberately no fallback language: an untranslated value
 * is an empty string in the catalog and renders as nothing until Weblate fills it. A key that is
 * missing altogether renders nothing as well, and warns during development.
 */
export function createAppI18n(locale: AppLocale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: false,
    messages,
    missingWarn: import.meta.env.DEV,
    fallbackWarn: false,
    missing: () => '',
  });
}

export type AppI18n = ReturnType<typeof createAppI18n>;
