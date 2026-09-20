// Pulls the declarations of the virtual modules into every program that follows imports into this
// package. An `import` cannot do that for an ambient declaration file.
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../env.d.ts" />
import { iconSetLoaders } from 'virtual:homebook-icons';
import type { InjectionKey } from 'vue';

export interface IconSetModule {
  names: readonly string[];
  sprite: string;
}

export type IconSetLoaders = Record<string, (() => Promise<IconSetModule>) | undefined>;

export interface IconRegistry {
  /**
   * Loads the sprite of a set on first demand, injects it into the document and resolves with the
   * icon names of the set. Later calls share the first result.
   */
  load(set: string): Promise<ReadonlySet<string>>;
}

const CONTAINER_ID = 'hb-icon-sprites';

function spriteContainer(doc: Document): HTMLElement {
  const existing = doc.getElementById(CONTAINER_ID);
  if (existing !== null) return existing;

  const container = doc.createElement('div');
  container.id = CONTAINER_ID;
  container.setAttribute('aria-hidden', 'true');
  // Not `display: none`, that would switch off the gradients and filters referenced from the symbols
  container.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  doc.body.prepend(container);
  return container;
}

/**
 * The sprites are inlined instead of referenced as external files: `url(#gradient)` references
 * inside an externally `<use>`d file do not resolve reliably across browsers.
 */
export function createIconRegistry(loaders: IconSetLoaders, doc: Document = document): IconRegistry {
  const sets = new Map<string, Promise<ReadonlySet<string>>>();

  async function loadSet(set: string): Promise<ReadonlySet<string>> {
    const loader = loaders[set];
    if (loader === undefined) {
      throw new Error(`Unknown icon set "${set}"`);
    }

    const { names, sprite } = await loader();
    spriteContainer(doc).insertAdjacentHTML('beforeend', sprite);
    return new Set(names);
  }

  return {
    load(set) {
      let pending = sets.get(set);
      if (pending === undefined) {
        pending = loadSet(set);
        sets.set(set, pending);
        // A failed download must not stick, the next icon tries again
        pending.catch(() => sets.delete(set));
      }
      return pending;
    },
  };
}

let defaultRegistry: IconRegistry | undefined;

/** The registry backed by the sprites of the `homebookIconSprites` Vite plugin. */
export function getIconRegistry(): IconRegistry {
  defaultRegistry ??= createIconRegistry(iconSetLoaders);
  return defaultRegistry;
}

/** Lets an app or a test replace the registry: `app.provide(iconRegistryKey, registry)`. */
export const iconRegistryKey: InjectionKey<IconRegistry> = Symbol('hb-icon-registry');
