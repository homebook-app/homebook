import { createPinia, setActivePinia } from 'pinia';

import { apiError, mockBackend } from '@/test/backend';

import { parseWallpaperKey, useWallpaperStore } from './wallpaper';

const MEDIA_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

function mockPreference(get: () => Promise<unknown>) {
  const resolveMediaUrl = vi.fn(async (id: string) => `/api/storage/media/${id}`);
  mockBackend({
    staticWallpaperUrl: (file: string) => `/api/system/wallpaper/${file}`,
    resolveMediaUrl,
    api: { user: { preferences: { wallpaper: { get } } } } as never,
  });
  return { resolveMediaUrl };
}

describe('parseWallpaperKey', () => {
  it.each([
    ['{stawp}-{forest.jpg}', 'static', 'forest.jpg'],
    ['{DYNWP}-{ocean_waves}', 'dynamic', 'ocean_waves'],
    [`{usrwp}-{${MEDIA_ID}}`, 'uploaded', MEDIA_ID],
  ])('parses %s', (key, kind, value) => {
    expect(parseWallpaperKey(key)).toEqual({ kind, value });
  });

  it.each(['', 'forest.jpg', '{other}-{x}', '{stawp}-{}'])('rejects %s', (key) => {
    expect(parseWallpaperKey(key)).toBeUndefined();
  });
});

describe('useWallpaperStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('resolves a static wallpaper', async () => {
    mockPreference(async () => ({ key: '{stawp}-{forest.jpg}', wallpaper: 'forest.jpg' }));
    const store = useWallpaperStore();

    await store.load();

    expect(store.wallpaper).toEqual({ kind: 'static', url: '/api/system/wallpaper/forest.jpg' });
  });

  it('takes the first image of a theme configuration', async () => {
    mockPreference(async () => ({
      key: '{stawp}-{forest}',
      wallpaper: 'forest',
      configuration: { additionalData: { light: ['forest-light.jpg', 'x.jpg'], dark: ['forest-dark.jpg'] } },
    }));
    const store = useWallpaperStore();

    await store.load();

    expect(store.wallpaper?.url).toBe('/api/system/wallpaper/forest-light.jpg');
  });

  it('resolves an uploaded wallpaper through the media endpoint', async () => {
    const { resolveMediaUrl } = mockPreference(async () => ({ key: `{usrwp}-{${MEDIA_ID}}`, wallpaper: MEDIA_ID }));
    const store = useWallpaperStore();

    await store.load();

    expect(resolveMediaUrl).toHaveBeenCalledWith(MEDIA_ID);
    expect(store.wallpaper).toEqual({ kind: 'uploaded', url: `/api/storage/media/${MEDIA_ID}` });
  });

  it('points a dynamic wallpaper to the bundled page', async () => {
    mockPreference(async () => ({ key: '{dynwp}-{ocean_waves}', wallpaper: 'ocean_waves' }));
    const store = useWallpaperStore();

    await store.load();

    expect(store.wallpaper).toEqual({ kind: 'dynamic', url: '/wallpaper/ocean_waves/index.html' });
  });

  it('shows no wallpaper without a preference', async () => {
    mockPreference(() => Promise.reject(apiError(404)));
    const store = useWallpaperStore();

    await store.load();

    expect(store.wallpaper).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('shows no wallpaper for an empty preference', async () => {
    mockPreference(async () => ({ key: '{stawp}-{forest.jpg}', wallpaper: '' }));
    const store = useWallpaperStore();

    await store.load();

    expect(store.wallpaper).toBeUndefined();
  });

  it('forgets the wallpaper on clear', async () => {
    mockPreference(async () => ({ key: '{dynwp}-{ocean_waves}', wallpaper: 'ocean_waves' }));
    const store = useWallpaperStore();
    await store.load();

    store.clear();

    expect(store.wallpaper).toBeUndefined();
  });
});
