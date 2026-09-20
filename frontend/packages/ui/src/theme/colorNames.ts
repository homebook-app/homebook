/** The brand entries of the palette, `--hb-color-brand-*`. */
export const brandColorNames = ['brand-github', 'brand-docker', 'brand-ubuntu', 'brand-homebook'] as const;

/** The named colors of the palette, in the order of `styles/_color-palette.scss`. */
export const paletteColorNames = [
  'aqua',
  'amethyst',
  'indigo',
  'denim',
  'cerulean',
  'ocean',
  'purple',
  'azure',
  'lavender',
  'plum',
  'rose',
  'pink',
  'crimson',
  'ruby',
  'spring',
  'apple',
  'lime',
  'emerald',
  'teal',
  'petrol',
  'wine',
  'mulberry',
  'fern',
  'honey',
  'lemon',
  'gold',
  'amber',
  'coral',
  'orange',
  'caramel',
  'stone',
  'graphite',
  'charcoal',
  'storm',
  'smoke',
  'shadow',
  'steel',
  'peach',
  'sunset',
  'chartreuse',
  'jade',
] as const;

/** Every color that has `--hb-color-<name>` tokens and `.ui-color-*` classes. */
export const colorNames = [...brandColorNames, ...paletteColorNames] as const;

export type ColorName = (typeof colorNames)[number];
