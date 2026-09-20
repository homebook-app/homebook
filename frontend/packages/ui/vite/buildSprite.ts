import { iconSymbolId } from '../src/icons/iconSets.ts';

export interface IconFile {
  /** File name without extension, equals the former C# constant. */
  name: string;
  svg: string;
}

// Attributes of the root element that still matter once the icon is a <symbol>
const CARRIED_ATTRIBUTES = ['viewBox', 'fill', 'style'];

function readAttribute(tag: string, attribute: string): string | undefined {
  return new RegExp(`\\s${attribute}="([^"]*)"`).exec(tag)?.[1];
}

/**
 * Turns one icon file into a `<symbol>`.
 *
 * Every id inside the icon is prefixed with the symbol id. All sprites end up in the same
 * document, and the multicolor sets are full of gradient, mask and filter ids.
 */
export function buildSymbol(set: string, icon: IconFile): string {
  const svg = icon.svg.trim();
  const rootEnd = svg.indexOf('>');
  const closing = svg.lastIndexOf('</svg>');
  if (!svg.startsWith('<svg') || rootEnd === -1 || closing === -1) {
    throw new Error(`Icon ${set}/${icon.name} is not an <svg> element`);
  }

  const root = svg.slice(0, rootEnd);
  if (readAttribute(root, 'viewBox') === undefined) {
    throw new Error(`Icon ${set}/${icon.name} has no viewBox`);
  }

  const id = iconSymbolId(set, icon.name);
  const attributes = CARRIED_ATTRIBUTES.map((attribute) => {
    const value = readAttribute(root, attribute);
    return value === undefined ? '' : ` ${attribute}="${value}"`;
  }).join('');

  const content = svg
    .slice(rootEnd + 1, closing)
    .replace(/(\s)id="([^"]+)"/g, `$1id="${id}-$2"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${id}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${id}-$1"`)
    .trim();

  return `<symbol id="${id}"${attributes}>${content}</symbol>`;
}

/** Bundles the icons of one set into a sprite that is injected into the document as is. */
export function buildSprite(set: string, icons: readonly IconFile[]): string {
  const symbols = icons.map((icon) => buildSymbol(set, icon)).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-hb-icon-set="${set}">${symbols}</svg>`;
}
