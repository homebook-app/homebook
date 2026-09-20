// @vitest-environment node
import { buildSprite, buildSymbol } from './buildSprite.ts';

const tintable =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor">\n<path d="M1 1"></path>\n</svg>\n';

const gradient =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><linearGradient id="a1" x1="0"><stop offset="0"/></linearGradient>' +
  '<mask id="m"><rect width="7" height="7"/></mask>' +
  '<path fill="url(#a1)" mask="url(#m)" d="M1 1"/><use xlink:href="#a1"/><use href="#m"/></svg>';

describe('buildSymbol', () => {
  it('keeps viewBox and fill of the root element and names the symbol after set and icon', () => {
    expect(buildSymbol('windows11-outline', { name: 'Home', svg: tintable })).toBe(
      '<symbol id="hb-windows11-outline-Home" viewBox="0 0 48 48" fill="currentColor"><path d="M1 1"></path></symbol>',
    );
  });

  it('keeps the viewBox of sets that are not 48 units wide', () => {
    expect(buildSymbol('liquid-glass-color', { name: 'Gear', svg: gradient })).toContain('viewBox="0 0 32 32"');
  });

  it('prefixes ids and every reference to them', () => {
    const symbol = buildSymbol('liquid-glass-color', { name: 'Gear', svg: gradient });
    const prefix = 'hb-liquid-glass-color-Gear';

    expect(symbol).toContain(`<linearGradient id="${prefix}-a1"`);
    expect(symbol).toContain(`<mask id="${prefix}-m"`);
    expect(symbol).toContain(`fill="url(#${prefix}-a1)"`);
    expect(symbol).toContain(`mask="url(#${prefix}-m)"`);
    expect(symbol).toContain(`xlink:href="#${prefix}-a1"`);
    expect(symbol).toContain(`<use href="#${prefix}-m"/>`);
  });

  it('leaves attributes of inner elements alone', () => {
    expect(buildSymbol('liquid-glass-color', { name: 'Gear', svg: gradient })).toContain(
      '<rect width="7" height="7"/>',
    );
  });

  it('carries a style attribute of the root element over', () => {
    const svg = '<svg viewBox="0 0 960 1148" style="fill-rule:evenodd;"><g/></svg>';

    expect(buildSymbol('logos', { name: 'HomeBook', svg })).toBe(
      '<symbol id="hb-logos-HomeBook" viewBox="0 0 960 1148" style="fill-rule:evenodd;"><g/></symbol>',
    );
  });

  it('rejects files that are not an svg or have no viewBox', () => {
    expect(() => buildSymbol('logos', { name: 'Broken', svg: '<div></div>' })).toThrow('logos/Broken');
    expect(() => buildSymbol('logos', { name: 'NoBox', svg: '<svg><g/></svg>' })).toThrow('no viewBox');
  });
});

describe('buildSprite', () => {
  it('wraps one symbol per icon', () => {
    const sprite = buildSprite('windows11-outline', [
      { name: 'Home', svg: tintable },
      { name: 'Gear', svg: tintable },
    ]);

    expect(sprite.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(sprite).toContain('xmlns:xlink=');
    expect(sprite.match(/<symbol /g)).toHaveLength(2);
    expect(sprite).toContain('id="hb-windows11-outline-Gear"');
  });
});
