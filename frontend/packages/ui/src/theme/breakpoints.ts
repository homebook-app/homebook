/** The breakpoints in pixels, the same values as `$breakpoints` in `abstracts/_tokens.scss`. */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  xxl: 2560,
  xxxl: 3840,
  xxxxl: 5120,
} as const;

export type BreakpointName = keyof typeof breakpoints;
