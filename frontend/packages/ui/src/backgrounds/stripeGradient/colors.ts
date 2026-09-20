export type StripeScheme = 'alpha' | 'beta' | 'release';

/**
 * The gradient colors per build mode, formerly `.build-mode-*` in `_ui-stripe-background.scss`.
 * The first color is the base, the others are blended over it as wave layers.
 */
export const stripeSchemes: Record<StripeScheme, readonly string[]> = {
  // Noctara
  alpha: ['#003a7a', '#003f90', '#00366e', '#002790', '#005fe0'],
  // Nerion
  beta: ['#1b5d8a', '#1c5d89', '#009ac7', '#114d7b', '#26a4d2'],
  // Frosted
  release: ['#7ebbfc', '#3366ff', '#1340c8', '#0029a3', '#1c1d7c'],
};

export type RgbColor = [red: number, green: number, blue: number];

/** `#rgb` or `#rrggbb` to channels between 0 and 1, `null` for anything else. */
export function parseHexColor(hex: string): RgbColor | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (match?.[1] === undefined) return null;

  const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
  const code = Number.parseInt(digits, 16);

  return [((code >> 16) & 255) / 255, ((code >> 8) & 255) / 255, (code & 255) / 255];
}
