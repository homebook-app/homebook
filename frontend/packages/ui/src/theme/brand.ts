/**
 * Brand values of the former `HomebookTheme.cs`, consumed by the PrimeVue preset.
 *
 * `styles/_theme.scss` repeats them as `--hb-*` custom properties, `tokens.spec.ts` keeps both in sync.
 */
export const brand = {
  primary: '#382960',
  secondary: '#5a9690',
  tertiary: '#373f31',
  background: '#f5f5f5',
  textPrimary: '#080606',
  /** `textPrimary` with 0.4 added to its HSL lightness, what MudBlazor's `ColorLighten(0.4)` produced. */
  textSecondary: '#7d5e5e',
  borderRadius: '20px',
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  captionFontSize: '0.8rem',
} as const;
