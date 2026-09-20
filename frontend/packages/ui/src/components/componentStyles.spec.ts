// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compileString } from 'sass-embedded';

/**
 * Compiles the `<style lang="scss">` block of every component in this package.
 *
 * Nothing else does. Vitest turns SFC styles off, `vue-tsc` never looks at them, the package has
 * no build of its own, and the app tree-shakes a component it does not render - so a broken
 * mixin call or an unknown Sass variable would only surface once some page happens to use it.
 *
 * The abstracts are prepended the same way `apps/web/vite.config.ts` injects them, so a mixin
 * that works here works in the app. They are reached by path rather than by package name: the
 * injection in the app goes through Vite's resolver, plain Sass has none.
 */
const componentsDir = fileURLToPath(new URL('.', import.meta.url));
const ABSTRACTS = "@use '../styles/abstracts.scss' as *;\n";
const STYLE_BLOCK = /<style[^>]*\blang="scss"[^>]*>([\s\S]*?)<\/style>/g;

function styleBlocks(file: string): string[] {
  const source = readFileSync(`${componentsDir}${file}`, 'utf8');
  return [...source.matchAll(STYLE_BLOCK)].map((match) => match[1] ?? '');
}

const components = readdirSync(componentsDir).filter((file) => file.endsWith('.vue'));

describe('component styles', () => {
  it('finds the components of the package', () => {
    expect(components.length).toBeGreaterThan(5);
  });

  it.each(components)('compiles the scoped styles of %s', (file) => {
    // A `.vue` file next to the real ones, so relative imports resolve as they would in the app
    const url = pathToFileURL(`${componentsDir}${file}`);

    for (const block of styleBlocks(file)) {
      expect(() => compileString(`${ABSTRACTS}${block}`, { url })).not.toThrow();
    }
  });
});
