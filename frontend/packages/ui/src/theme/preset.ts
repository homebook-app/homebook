import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

import { brand } from './brand';

const SURFACE_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

// Aura ships a blueish slate. The Blazor frontend sat on a neutral gray whose 100 shade is exactly
// the brand background (#f5f5f5).
const neutralSurface: Record<string, string> = { 0: '#ffffff' };
for (const shade of SURFACE_SHADES) {
  neutralSurface[shade] = `{neutral.${shade}}`;
}

/**
 * Aura, adjusted to the look of the former MudBlazor theme (`HomebookTheme.cs`).
 *
 * Light scheme only, there is no dark mode. What has no design token in Aura - the page
 * background, the font family, a few component deviations - lives in `styles/_base.scss` and
 * `styles/_primevue.scss`.
 */
export const HomeBookPreset = definePreset(Aura, {
  semantic: {
    // 500 is the brand color itself
    primary: palette(brand.primary),
    formField: {
      borderRadius: '{hb.border.radius}',
    },
    content: {
      borderRadius: '{hb.border.radius}',
    },
    overlay: {
      select: { borderRadius: '{hb.border.radius}' },
      popover: { borderRadius: '{hb.border.radius}' },
      modal: { borderRadius: '{hb.border.radius}' },
    },
    colorScheme: {
      light: {
        surface: neutralSurface,
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        text: {
          color: brand.textPrimary,
          hoverColor: brand.textPrimary,
          mutedColor: brand.textSecondary,
          hoverMutedColor: brand.textSecondary,
        },
      },
    },
  },
  components: {
    card: {
      root: {
        borderRadius: '{hb.border.radius}',
      },
      // Header, content and footer carry their own padding, see styles/_primevue.scss
      body: {
        padding: '0',
        gap: '0',
      },
    },
    fileupload: {
      root: {
        background: 'color-mix(in srgb, {content.background} 50%, transparent)',
      },
    },
  },
  extend: {
    hb: {
      borderRadius: brand.borderRadius,
    },
    secondary: {
      color: brand.secondary,
      contrastColor: '#ffffff',
    },
    tertiary: {
      color: brand.tertiary,
      contrastColor: '#ffffff',
    },
  },
});
