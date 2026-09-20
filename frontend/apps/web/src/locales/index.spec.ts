import { FALLBACK_LOCALE, messages } from './index';

function flatten(node: unknown, prefix = ''): Record<string, unknown> {
  if (typeof node !== 'object' || node === null) return { [prefix]: node };

  return Object.entries(node).reduce<Record<string, unknown>>(
    (entries, [key, value]) => ({ ...entries, ...flatten(value, prefix === '' ? key : `${prefix}.${key}`) }),
    {},
  );
}

describe('catalogs', () => {
  const reference = Object.keys(flatten(messages[FALLBACK_LOCALE])).sort();

  it.each(Object.keys(messages) as (keyof typeof messages)[])('%s has every key, none of them empty', (locale) => {
    const entries = flatten(messages[locale]);

    expect(Object.keys(entries).sort()).toEqual(reference);
    for (const [key, value] of Object.entries(entries)) {
      // Weblate shows nothing at all for an empty value
      expect(typeof value === 'string' && value.trim() !== '', key).toBe(true);
    }
  });
});
