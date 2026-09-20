/** Single-color sets, drawn in `currentColor`. Rendered by `UiIcon`. */
export const tintableIconSets = ['windows11-outline', 'windows11-filled', 'logos'] as const;

/** Sets that bring their own colors and gradients and must not be recolored. Rendered by `UiPictogram`. */
export const multicolorIconSets = ['windows11-colored', 'glass-morphism', 'liquid-glass-color'] as const;

export const iconSets = [...tintableIconSets, ...multicolorIconSets] as const;

export type TintableIconSet = (typeof tintableIconSets)[number];
export type MulticolorIconSet = (typeof multicolorIconSets)[number];
export type IconSetName = (typeof iconSets)[number];

/** For icons that arrive as strings at runtime: decides between `UiIcon` and `UiPictogram`. */
export function isTintableIconSet(set: string): set is TintableIconSet {
  return (tintableIconSets as readonly string[]).includes(set);
}

/** Id of an icon's `<symbol>` inside the sprite of its set. */
export function iconSymbolId(set: string, name: string): string {
  return `hb-${set}-${name}`;
}
