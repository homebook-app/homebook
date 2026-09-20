import { $dt, Theme } from '@primeuix/themes';

import { brand } from './brand';
import { HomeBookPreset } from './preset';
import { primeVueOptions } from './primevue';

function lightValue(token: string): unknown {
  const { value } = $dt(token);

  if (typeof value === 'object' && value !== null && 'light' in value) {
    const light = (value as { light: { value: unknown } }).light;
    return light.value;
  }
  return value;
}

describe('HomeBookPreset', () => {
  beforeAll(() => {
    Theme.setTheme({ preset: HomeBookPreset, options: { darkModeSelector: false } });
  });

  it('puts the brand color at primary 500', () => {
    expect(lightValue('primary.500')).toBe(brand.primary);
    expect(lightValue('primary.color')).toBe(brand.primary);
  });

  it('pins the generated primary ramp', () => {
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    expect(shades.map((shade) => lightValue(`primary.${shade}`))).toEqual([
      '#f5f4f7',
      '#cfccd9',
      '#a9a3bb',
      '#847a9c',
      '#5e527e',
      '#382960',
      '#302352',
      '#271d43',
      '#1f1735',
      '#161026',
      '#0e0a18',
    ]);
  });

  it('uses a neutral surface whose 100 shade is the brand background', () => {
    expect(lightValue('surface.0')).toBe('#ffffff');
    expect(lightValue('surface.100')).toBe(brand.background);
  });

  it('uses the brand text colors', () => {
    expect(lightValue('text.color')).toBe(brand.textPrimary);
    expect(lightValue('text.muted.color')).toBe(brand.textSecondary);
  });

  it('rounds fields, content, overlays and cards with the brand radius', () => {
    for (const token of [
      'form.field.border.radius',
      'content.border.radius',
      'overlay.select.border.radius',
      'overlay.popover.border.radius',
      'overlay.modal.border.radius',
      'card.border.radius',
    ]) {
      expect(lightValue(token), token).toBe(brand.borderRadius);
    }
  });

  it('exposes secondary and tertiary as custom tokens', () => {
    expect($dt('secondary.color').name).toBe('--p-secondary-color');
    expect(lightValue('secondary.color')).toBe(brand.secondary);
    expect($dt('tertiary.color').name).toBe('--p-tertiary-color');
    expect(lightValue('tertiary.color')).toBe(brand.tertiary);
  });

  it('is what the shared PrimeVue options use, without dark mode', () => {
    expect(primeVueOptions.theme?.preset).toBe(HomeBookPreset);
    expect(primeVueOptions.theme?.options?.darkModeSelector).toBe(false);
    expect(primeVueOptions.theme?.options?.cssLayer).toEqual({ name: 'primevue', order: 'primevue, hb' });
  });
});
