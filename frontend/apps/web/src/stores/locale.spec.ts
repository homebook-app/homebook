import { createPinia, setActivePinia } from 'pinia';

import { mockBackend } from '@/test/backend';

import { useAuthStore } from './auth';
import { LOCALE_STORAGE_KEY, useLocaleStore } from './locale';

function mockPreferences(locale: string | undefined, post = vi.fn(async () => undefined)) {
  const get = vi.fn(async () => (locale === undefined ? undefined : { locale }));
  mockBackend({ api: { user: { preferences: { locale: { get, post } } } } as never });
  return { get, post };
}

function signIn(authenticated: boolean) {
  vi.spyOn(useAuthStore(), 'isAuthenticated').mockReturnValue(authenticated);
}

describe('useLocaleStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
  });

  describe('initialize', () => {
    it('prefers the stored choice', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'fr-FR');
      const { get } = mockPreferences('de-DE');
      signIn(true);
      const store = useLocaleStore();

      await store.initialize('en-US');

      expect(store.locale).toBe('fr');
      expect(store.tag).toBe('fr-FR');
      expect(get).not.toHaveBeenCalled();
    });

    it('takes the user preference of a signed-in user next', async () => {
      mockPreferences('de-DE');
      signIn(true);
      const store = useLocaleStore();

      await store.initialize('fr-FR');

      expect(store.locale).toBe('de');
    });

    it('does not ask for a preference without a session', async () => {
      const { get } = mockPreferences('de-DE');
      signIn(false);
      const store = useLocaleStore();

      await store.initialize('fr-FR');

      expect(get).not.toHaveBeenCalled();
      expect(store.locale).toBe('fr');
    });

    it('falls back to the browser languages', async () => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-ES', 'ru-RU']);
      mockPreferences(undefined);
      signIn(false);
      const store = useLocaleStore();

      await store.initialize(null);

      expect(store.locale).toBe('ru');
    });

    it('ends with English', async () => {
      mockPreferences(undefined);
      signIn(false);
      const store = useLocaleStore();

      await store.initialize('es-ES');

      expect(store.locale).toBe('en');
    });

    it('ignores a stored value without a catalog', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'es-ES');
      mockPreferences(undefined);
      signIn(false);
      const store = useLocaleStore();

      await store.initialize('de-DE');

      expect(store.locale).toBe('de');
    });
  });

  describe('setLocale', () => {
    it('switches, remembers and saves the preference', async () => {
      const { post } = mockPreferences(undefined);
      signIn(true);
      const store = useLocaleStore();

      await expect(store.setLocale('de-DE')).resolves.toBe(true);

      expect(store.locale).toBe('de');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de-DE');
      expect(post).toHaveBeenCalledWith({ locale: 'de-DE' });
    });

    it('switches even when saving fails', async () => {
      mockPreferences(
        undefined,
        vi.fn(() => Promise.reject(new Error('offline'))),
      );
      signIn(true);
      const store = useLocaleStore();

      await expect(store.setLocale('fr-FR')).resolves.toBe(false);

      expect(store.locale).toBe('fr');
    });

    it('does not save without a session', async () => {
      const { post } = mockPreferences(undefined);
      signIn(false);

      await useLocaleStore().setLocale('ru');

      expect(post).not.toHaveBeenCalled();
    });

    it('uses English for a language without a catalog', async () => {
      mockPreferences(undefined);
      signIn(false);
      const store = useLocaleStore();

      await store.setLocale('es-ES');

      expect(store.locale).toBe('en');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    });
  });

  it('loads the preference of a user who just signed in', async () => {
    mockPreferences('ru-RU');
    signIn(true);
    const store = useLocaleStore();

    await store.loadUserPreference();

    expect(store.locale).toBe('ru');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ru-RU');
  });
});
