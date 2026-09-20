import type { PrimeVueConfiguration } from 'primevue/config';

import { HomeBookPreset } from './preset';

/**
 * PrimeVue configuration shared by the app and the test helper.
 *
 * The `primevue` layer is declared before `hb`, so project styles in the `hb` layer win
 * without `!important`. There is no dark mode, hence `darkModeSelector: false`.
 */
export const primeVueOptions: PrimeVueConfiguration = {
  theme: {
    preset: HomeBookPreset,
    options: {
      darkModeSelector: false,
      cssLayer: { name: 'primevue', order: 'primevue, hb' },
    },
  },
};
