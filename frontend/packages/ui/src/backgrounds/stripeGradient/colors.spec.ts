import { parseHexColor, stripeSchemes } from './colors';
import { createStripeGradient } from './gradient';

describe('parseHexColor', () => {
  it('converts six digits to channels between 0 and 1', () => {
    expect(parseHexColor('#ff0080')).toEqual([1, 0, 128 / 255]);
  });

  it('expands the three digit shorthand', () => {
    expect(parseHexColor('#f08')).toEqual(parseHexColor('#ff0088'));
  });

  it('tolerates whitespace and upper case', () => {
    expect(parseHexColor('  #7EBBFC ')).toEqual([126 / 255, 187 / 255, 252 / 255]);
  });

  it('rejects everything else', () => {
    expect(parseHexColor('')).toBeNull();
    expect(parseHexColor('red')).toBeNull();
    expect(parseHexColor('#ff00')).toBeNull();
  });
});

describe('stripeSchemes', () => {
  it('holds five valid colors per build mode', () => {
    for (const colors of Object.values(stripeSchemes)) {
      expect(colors).toHaveLength(5);
      expect(colors.map(parseHexColor)).not.toContain(null);
    }
  });
});

describe('createStripeGradient', () => {
  it('returns null instead of throwing where WebGL is missing', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);

    expect(createStripeGradient(canvas, { colors: stripeSchemes.release, width: 100, height: 100 })).toBeNull();
  });

  it('returns null without a usable color', () => {
    expect(
      createStripeGradient(document.createElement('canvas'), { colors: ['nope'], width: 1, height: 1 }),
    ).toBeNull();
  });
});
