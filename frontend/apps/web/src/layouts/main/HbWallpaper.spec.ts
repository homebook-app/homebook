import { mountWithPlugins } from '@homebook/test-utils';

import HbWallpaper from './HbWallpaper.vue';

describe('HbWallpaper', () => {
  it.each(['static', 'uploaded'] as const)('shows a %s wallpaper as background image', async (kind) => {
    const { wrapper } = await mountWithPlugins(HbWallpaper, {
      props: { wallpaper: { kind, url: '/api/system/wallpaper/forest%2Ejpg' } },
    });

    const layer = wrapper.find('div.ui-wallpaper');
    expect(layer.attributes('style')).toContain('/api/system/wallpaper/forest%2Ejpg');
    expect(wrapper.find('iframe').exists()).toBe(false);
  });

  it('shows a dynamic wallpaper in an iframe', async () => {
    const { wrapper } = await mountWithPlugins(HbWallpaper, {
      props: { wallpaper: { kind: 'dynamic', url: '/wallpaper/ocean_waves/index.html' } },
    });

    expect(wrapper.find('iframe.ui-wallpaper').attributes('src')).toBe('/wallpaper/ocean_waves/index.html');
  });

  it('renders nothing without a wallpaper', async () => {
    const { wrapper } = await mountWithPlugins(HbWallpaper);

    expect(wrapper.find('.ui-wallpaper').exists()).toBe(false);
  });
});
