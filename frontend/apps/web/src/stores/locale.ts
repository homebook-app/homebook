import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import { useBackend } from '@/api/backend';
import { DEFAULT_LOCALE, resolveLocale, type AppLocale } from '@/locales';

import { useAuthStore } from './auth';

/** localStorage key of the chosen culture, unchanged from the Blazor frontend. */
export const LOCALE_STORAGE_KEY = 'HomeBook.User.Locale';

function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLocale(tag: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, tag);
  } catch {
    // Storage blocked: the choice lasts until the page is reloaded
  }
}

function browserLanguages(): readonly string[] {
  return typeof navigator === 'undefined' ? [] : navigator.languages;
}

/**
 * The display language. The store holds the culture tag the user chose (`de-DE`, as the backend
 * stores it) and the catalog that tag maps to (`de`). The app mirrors `locale` into vue-i18n.
 */
export const useLocaleStore = defineStore('locale', () => {
  const locale = shallowRef<AppLocale>(DEFAULT_LOCALE);
  const tag = shallowRef<string>(DEFAULT_LOCALE);

  function apply(candidate: string): boolean {
    const resolved = resolveLocale(candidate);
    if (resolved === undefined) {
      return false;
    }
    locale.value = resolved;
    tag.value = candidate;
    return true;
  }

  async function userPreference(): Promise<string | undefined> {
    if (!useAuthStore().isAuthenticated()) {
      return undefined;
    }
    try {
      return (await useBackend().api.user.preferences.locale.get())?.locale ?? undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Picks the language at startup: the stored choice, then the user preference, then the
   * instance default, then the browser languages, then English.
   */
  async function initialize(instanceDefault: string | null): Promise<void> {
    const stored = readStoredLocale();
    if (stored !== null && apply(stored)) {
      return;
    }
    const preferred = await userPreference();
    const candidates = [preferred, instanceDefault ?? undefined, ...browserLanguages()];
    if (!candidates.some((candidate) => candidate !== undefined && apply(candidate))) {
      apply(DEFAULT_LOCALE);
    }
  }

  /** Takes over the preference of a user who just signed in. */
  async function loadUserPreference(): Promise<void> {
    const preferred = await userPreference();
    if (preferred !== undefined && apply(preferred)) {
      storeLocale(preferred);
    }
  }

  /**
   * Switches the language at runtime, remembers it and saves it as the user preference. Returns
   * `false` when the preference could not be saved; the switch itself happens regardless.
   */
  async function setLocale(candidate: string): Promise<boolean> {
    if (!apply(candidate)) {
      apply(DEFAULT_LOCALE);
    }
    storeLocale(tag.value);
    if (!useAuthStore().isAuthenticated()) {
      return true;
    }
    try {
      await useBackend().api.user.preferences.locale.post({ locale: tag.value });
      return true;
    } catch {
      return false;
    }
  }

  return { locale, tag, initialize, loadUserPreference, setLocale };
});
