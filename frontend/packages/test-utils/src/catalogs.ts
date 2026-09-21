/** A nested translation catalog as stored in a `locales/<language>.json` file. */
export interface CatalogTree {
  [key: string]: string | CatalogTree;
}

/** Flattens a nested catalog into dotted paths. */
export function flattenCatalog(tree: CatalogTree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((entries, [key, value]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return typeof value === 'string' ? { ...entries, [path]: value } : { ...entries, ...flattenCatalog(value, path) };
  }, {});
}

/**
 * Checks a set of catalogs by language: every language has exactly the keys of the default
 * language, and the default language has no empty value. Other languages may be empty, Weblate
 * fills them.
 */
export function describeCatalogs(
  name: string,
  catalogs: Readonly<Record<string, CatalogTree>>,
  defaultLanguage = 'en',
): void {
  describe(`${name} catalogs`, () => {
    const reference = catalogs[defaultLanguage];

    it(`has a ${defaultLanguage} catalog`, () => {
      expect(reference).toBeDefined();
    });

    const referenceEntries = flattenCatalog(reference ?? {});
    const referenceKeys = Object.keys(referenceEntries).sort();

    it(`has no empty ${defaultLanguage} value`, () => {
      const empty = Object.entries(referenceEntries)
        .filter(([, value]) => value.trim() === '')
        .map(([key]) => key);
      expect(empty).toEqual([]);
    });

    it.each(Object.keys(catalogs))('%s has exactly the keys of the default language', (language) => {
      expect(Object.keys(flattenCatalog(catalogs[language] ?? {})).sort()).toEqual(referenceKeys);
    });
  });
}
