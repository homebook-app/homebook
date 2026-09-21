import { describeCatalogs, flattenCatalog } from './catalogs';

describe('flattenCatalog', () => {
  it('joins nested keys with dots', () => {
    expect(flattenCatalog({ a: { b: 'x', c: { d: 'y' } }, e: '' })).toEqual({ 'a.b': 'x', 'a.c.d': 'y', e: '' });
  });
});

describeCatalogs('consistent', {
  en: { title: 'Title', group: { label: 'Label' } },
  de: { title: 'Titel', group: { label: '' } },
});
