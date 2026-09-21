// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { compile } from 'sass-embedded';

import { brand } from '../theme/brand';
import { breakpoints } from '../theme/breakpoints';
import { colorNames } from '../theme/colorNames';

type Declarations = Map<string, string>;
/** Rules keyed by `<media query>|<selector>`, the media query is empty outside of `@media`. */
type Rules = Map<string, Declarations>;

const entryFile = fileURLToPath(new URL('./index.scss', import.meta.url));
// The stylesheet the Blazor frontend compiled from the original partials
const legacyFile = fileURLToPath(
  new URL('../../../../../backend/HomeBook.Frontend/wwwroot/css/app.css', import.meta.url),
);

function normalize(text: string): string {
  return text
    .replace(/\s*!important/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*,\s*/g, ', ')
    .trim()
    .toLowerCase();
}

function findBlockEnd(css: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
    if (depth === 0) return index;
  }
  throw new Error('Unbalanced braces');
}

function parseDeclarations(body: string, target: Declarations): void {
  for (const declaration of body.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator === -1) continue;
    target.set(declaration.slice(0, separator).trim(), normalize(declaration.slice(separator + 1)));
  }
}

function parseRules(css: string, media = '', rules: Rules = new Map()): Rules {
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf('{', index);
    if (open === -1) break;

    const close = findBlockEnd(css, open);
    // A statement like `@charset "UTF-8";` may precede the prelude
    const prelude = normalize(css.slice(index, open).split(';').pop() ?? '');
    const body = css.slice(open + 1, close);

    if (prelude.startsWith('@layer')) {
      parseRules(body, media, rules);
    } else if (prelude.startsWith('@media')) {
      parseRules(body, prelude, rules);
    } else if (!prelude.startsWith('@')) {
      const key = `${media}|${prelude}`;
      const declarations = rules.get(key) ?? new Map<string, string>();
      parseDeclarations(body, declarations);
      rules.set(key, declarations);
    }

    index = close + 1;
  }
  return rules;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

const rules = parseRules(stripComments(compile(entryFile).css));
const root = rules.get('|:root') ?? new Map<string, string>();

describe('design tokens', () => {
  it('emits four custom properties for each of the 45 palette colors', () => {
    expect(colorNames).toHaveLength(45);

    for (const name of colorNames) {
      for (const suffix of ['', '-rgb', '-dark', '-dark-rgb']) {
        expect(root.has(`--hb-color-${name}${suffix}`), `--hb-color-${name}${suffix}`).toBe(true);
      }
    }
  });

  it('keeps colorNames.ts in sync with the SCSS palette', () => {
    const fromScss = [...root.keys()]
      .map((property) => /^--hb-color-(.+)-dark-rgb$/.exec(property)?.[1])
      .filter((name): name is string => name !== undefined);

    expect(fromScss).toEqual([...colorNames]);
  });

  it('picks black text above 60 percent lightness and white below', () => {
    expect(rules.get('|.ui-color-bg-lemon')?.get('color')).toBe('#000000');
    expect(rules.get('|.ui-color-bg-chartreuse')?.get('color')).toBe('#ffffff');
    expect(rules.get('|.ui-color-bg-graphite')?.get('color')).toBe('#ffffff');
  });

  it('emits ten frosted steps from alpha 0.05 to 0.5', () => {
    for (let step = 1; step <= 10; step += 1) {
      const alpha = Number((step * 0.05).toFixed(2));
      const background = rules.get(`|.frosted-b${step}`)?.get('background');

      expect(background).toContain(`linear-gradient(160deg, rgba(255, 255, 255, ${alpha}) 0%`);
      expect(rules.get(`|.frosted-b${step}`)?.get('backdrop-filter')).toBe('blur(6px)');
      expect(rules.get(`|.frosted-bg-b${step}`)?.get('background')).toBe(background);
      expect(rules.get(`|.frosted-b${step}.no-backdrop-blur`)?.get('backdrop-filter')).toBe('none');
    }
    expect(rules.has('|.frosted-b11')).toBe(false);
  });

  it('emits the eight breakpoints', () => {
    const emitted = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'xxxxl'].map((name) =>
      root.get(`--hb-breakpoint-${name}`),
    );

    expect(emitted).toEqual(['0px', '600px', '960px', '1280px', '1920px', '2560px', '3840px', '5120px']);
  });

  it('keeps breakpoints.ts in sync with the custom properties', () => {
    for (const [name, pixels] of Object.entries(breakpoints)) {
      expect(root.get(`--hb-breakpoint-${name}`), name).toBe(`${pixels}px`);
    }
  });

  it('never uses !important, the hb layer already wins over PrimeVue', () => {
    expect(compile(entryFile).css).not.toContain('!important');
  });

  it('keeps brand.ts in sync with the custom properties', () => {
    expect(root.get('--hb-color-primary')).toBe(brand.primary);
    expect(root.get('--hb-color-secondary')).toBe(brand.secondary);
    expect(root.get('--hb-color-tertiary')).toBe(brand.tertiary);
    expect(root.get('--hb-color-background')).toBe(brand.background);
    expect(root.get('--hb-text-primary')).toBe(brand.textPrimary);
    expect(root.get('--hb-text-secondary')).toBe(brand.textSecondary);
    expect(root.get('--hb-border-radius-default')).toBe(brand.borderRadius);
    expect(root.get('--hb-font-family')).toBe(normalize(brand.fontFamily));
    expect(root.get('--hb-font-size-caption')).toBe(brand.captionFontSize);
  });
});

// Goes dormant once the Blazor frontend is removed from the repository
describe.skipIf(!existsSync(legacyFile))('parity with the Blazor stylesheet', () => {
  const legacy: Rules = existsSync(legacyFile)
    ? parseRules(stripComments(readFileSync(legacyFile, 'utf8')))
    : new Map<string, Declarations>();

  // Ported as tokens, utilities and chrome. Component and view styles follow in later steps.
  const portedSelector =
    /^\.(ui-color-|frosted-|w-|float-|github-|docker-|ubuntu-|ui-widget|hb-widget|ui-wallpaper)|^\.ui-widget/;

  it('matches every --hb-* custom property', () => {
    const legacyRoot: Declarations = legacy.get('|:root') ?? new Map();
    const properties = [...legacyRoot.keys()].filter(
      (property) => property.startsWith('--hb-') || property.startsWith('--cell-'),
    );

    expect(properties.length).toBeGreaterThan(200);
    for (const property of properties) {
      expect(root.get(property), property).toBe(legacyRoot.get(property));
    }
  });

  it('matches every ported rule', () => {
    const keys = [...legacy.keys()].filter((key) => portedSelector.test(key.split('|')[1] ?? ''));

    expect(keys.length).toBeGreaterThan(200);
    for (const key of keys) {
      // `@extend` of the MudBlazor overrides widened some selectors, those parts are not ported
      const [media = '', selector = ''] = key.split('|');
      const ported = selector
        .split(', ')
        .filter((part) => !part.includes('.mud-'))
        .join(', ');

      const actual = rules.get(`${media}|${ported}`);
      expect(actual, key).toBeDefined();
      expect(Object.fromEntries(actual ?? []), key).toEqual(Object.fromEntries(legacy.get(key) ?? []));
    }
  });
});
