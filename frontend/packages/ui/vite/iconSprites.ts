import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';

import { buildSprite, type IconFile } from './buildSprite.ts';

const VIRTUAL_ID = 'virtual:homebook-icons';
const RESOLVED_PREFIX = '\0';

export interface IconSpritesOptions {
  /** Folder with one sub folder of `.svg` files per set, defaults to `@homebook/ui/src/icons`. */
  iconsDir?: string;
}

function readSets(iconsDir: string): string[] {
  return readdirSync(iconsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readIcons(setDir: string): IconFile[] {
  return readdirSync(setDir)
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .map((file) => ({ name: basename(file, '.svg'), svg: readFileSync(join(setDir, file), 'utf8') }));
}

/**
 * Bundles one SVG sprite per icon set.
 *
 * `virtual:homebook-icons` exports a loader per set, `virtual:homebook-icons/<set>` holds the
 * sprite and its icon names. Each set becomes a lazy chunk of its own, so a set nobody renders is
 * never downloaded. Icons are referenced by string at runtime (module registry, start menu),
 * which rules out tree shaking over single imports.
 */
export function homebookIconSprites(options: IconSpritesOptions = {}): Plugin {
  const iconsDir = options.iconsDir ?? fileURLToPath(new URL('../src/icons', import.meta.url));

  return {
    name: 'homebook:icon-sprites',

    resolveId(id) {
      return id === VIRTUAL_ID || id.startsWith(`${VIRTUAL_ID}/`) ? RESOLVED_PREFIX + id : undefined;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX + VIRTUAL_ID)) return undefined;

      if (id === RESOLVED_PREFIX + VIRTUAL_ID) {
        const loaders = readSets(iconsDir).map(
          (set) => `  ${JSON.stringify(set)}: () => import(${JSON.stringify(`${VIRTUAL_ID}/${set}`)}),`,
        );
        return `export const iconSetLoaders = {\n${loaders.join('\n')}\n};\n`;
      }

      const set = id.slice(RESOLVED_PREFIX.length + VIRTUAL_ID.length + 1);
      if (!readSets(iconsDir).includes(set)) {
        throw new Error(`Unknown icon set "${set}"`);
      }

      const setDir = join(iconsDir, set);
      const icons = readIcons(setDir);
      for (const icon of icons) {
        this.addWatchFile(join(setDir, `${icon.name}.svg`));
      }

      const names = icons.map((icon) => icon.name);
      return `export const names = ${JSON.stringify(names)};\nexport const sprite = ${JSON.stringify(buildSprite(set, icons))};\n`;
    },

    configureServer(server) {
      server.watcher.add(iconsDir);

      const reload = (file: string): void => {
        if (!file.endsWith('.svg') || !file.startsWith(iconsDir + sep)) return;

        const set = basename(dirname(file));
        for (const id of [VIRTUAL_ID, `${VIRTUAL_ID}/${set}`]) {
          const module = server.moduleGraph.getModuleById(RESOLVED_PREFIX + id);
          if (module) server.moduleGraph.invalidateModule(module);
        }
        // The sprite is already injected into the document, only a reload replaces it
        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
