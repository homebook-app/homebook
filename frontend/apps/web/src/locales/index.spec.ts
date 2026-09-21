import { describeCatalogs } from '@homebook/test-utils';

import { createAppI18n, messages, resolveLocale } from './index';

describeCatalogs('app', messages);

describe('resolveLocale', () => {
  it.each([
    ['de-DE', 'de'],
    ['de', 'de'],
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['en-EN', 'en'],
    ['FR_fr', 'fr'],
    ['ru', 'ru'],
  ])('%s -> %s', (tag, expected) => {
    expect(resolveLocale(tag)).toBe(expected);
  });

  it.each(['es-ES', '', null, undefined])('has no catalog for %s', (tag) => {
    expect(resolveLocale(tag)).toBeUndefined();
  });
});

describe('createAppI18n', () => {
  it('renders an untranslated value as nothing instead of falling back to English', () => {
    const i18n = createAppI18n('fr');
    i18n.global.mergeLocaleMessage('en', { probe: { empty: 'English' } });
    i18n.global.mergeLocaleMessage('fr', { probe: { empty: '' } });

    expect(i18n.global.t('probe.empty')).toBe('');
  });

  it('renders a missing key as nothing', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const i18n = createAppI18n('de');

    expect(i18n.global.t('probe.doesNotExist')).toBe('');
  });

  it('switches the language at runtime', () => {
    const i18n = createAppI18n('en');
    i18n.global.mergeLocaleMessage('en', { probe: { text: 'Hello' } });
    i18n.global.mergeLocaleMessage('de', { probe: { text: 'Hallo' } });

    i18n.global.locale.value = 'de';

    expect(i18n.global.t('probe.text')).toBe('Hallo');
  });
});
