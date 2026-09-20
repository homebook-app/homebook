import { createIconRegistry, getIconRegistry, type IconSetModule } from './iconRegistry';
import { iconSets, isTintableIconSet } from './iconSets';

function setModule(set: string, names: string[]): IconSetModule {
  const symbols = names.map((name) => `<symbol id="hb-${set}-${name}" viewBox="0 0 48 48"></symbol>`).join('');
  return { names, sprite: `<svg data-hb-icon-set="${set}">${symbols}</svg>` };
}

describe('createIconRegistry', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('loads a set once, however often it is asked for', async () => {
    const loader = vi.fn().mockResolvedValue(setModule('logos', ['GitHub', 'Docker']));
    const registry = createIconRegistry({ logos: loader });

    const [first, second] = await Promise.all([registry.load('logos'), registry.load('logos')]);
    await registry.load('logos');

    expect(loader).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect([...first]).toEqual(['GitHub', 'Docker']);
    expect(document.querySelectorAll('[data-hb-icon-set="logos"]')).toHaveLength(1);
  });

  it('does not load sets nobody asks for', async () => {
    const used = vi.fn().mockResolvedValue(setModule('logos', ['GitHub']));
    const unused = vi.fn().mockResolvedValue(setModule('glass-morphism', ['Book']));
    const registry = createIconRegistry({ logos: used, 'glass-morphism': unused });

    await registry.load('logos');

    expect(unused).not.toHaveBeenCalled();
    expect(document.querySelector('[data-hb-icon-set="glass-morphism"]')).toBeNull();
  });

  it('injects the symbols into one hidden container that is still rendered', async () => {
    const registry = createIconRegistry({
      logos: () => Promise.resolve(setModule('logos', ['GitHub'])),
      'glass-morphism': () => Promise.resolve(setModule('glass-morphism', ['Book'])),
    });

    await registry.load('logos');
    await registry.load('glass-morphism');

    const containers = document.querySelectorAll('#hb-icon-sprites');
    expect(containers).toHaveLength(1);
    expect(containers[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(containers[0]?.getAttribute('style')).not.toContain('display');
    expect(document.getElementById('hb-logos-GitHub')).not.toBeNull();
    expect(document.getElementById('hb-glass-morphism-Book')).not.toBeNull();
  });

  it('rejects an unknown set', async () => {
    await expect(createIconRegistry({}).load('nope')).rejects.toThrow('Unknown icon set "nope"');
  });

  it('tries again after a failed download', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(setModule('logos', ['GitHub']));
    const registry = createIconRegistry({ logos: loader });

    await expect(registry.load('logos')).rejects.toThrow('offline');
    await expect(registry.load('logos')).resolves.toEqual(new Set(['GitHub']));
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

describe('the bundled sprites', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('serve every declared set through the Vite plugin', async () => {
    const registry = getIconRegistry();

    for (const set of iconSets) {
      expect((await registry.load(set)).size, set).toBeGreaterThan(0);
    }
    expect((await registry.load('windows11-outline')).has('Home')).toBe(true);
  });
});

describe('isTintableIconSet', () => {
  it('separates single-color sets from the ones with own colors', () => {
    expect(iconSets.filter(isTintableIconSet)).toEqual(['windows11-outline', 'windows11-filled', 'logos']);
    expect(isTintableIconSet('glass-morphism')).toBe(false);
    expect(isTintableIconSet('unknown')).toBe(false);
  });
});
