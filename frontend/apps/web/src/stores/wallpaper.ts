import { isNotFound, type GetUserPreferenceWallpaperResponse } from '@homebook/api-client';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import { useBackend } from '@/api/backend';

export type WallpaperKind = 'static' | 'dynamic' | 'uploaded';

/** A resolved wallpaper: images are shown as background, dynamic wallpapers in an iframe. */
export interface Wallpaper {
  kind: WallpaperKind;
  url: string;
}

const KIND_BY_PREFIX: Readonly<Record<string, WallpaperKind>> = {
  stawp: 'static',
  dynwp: 'dynamic',
  usrwp: 'uploaded',
};

/**
 * Parses the stored wallpaper key `{stawp}-{file}`, `{dynwp}-{name}` or `{usrwp}-{mediaId}`.
 * `undefined` for anything else.
 */
export function parseWallpaperKey(key: string): { kind: WallpaperKind; value: string } | undefined {
  const match = /^\{([^}]+)\}-\{(.*)\}$/.exec(key.trim());
  const kind = match?.[1] === undefined ? undefined : KIND_BY_PREFIX[match[1].toLowerCase()];
  const value = match?.[2];
  return kind === undefined || value === undefined || value === '' ? undefined : { kind, value };
}

/**
 * The first image of a theme configuration. The Blazor frontend took the first entry and left
 * light and dark variants for later; that behavior is kept.
 */
function firstThemeImage(configuration: GetUserPreferenceWallpaperResponse['configuration']): string | undefined {
  const first = Object.values(configuration?.additionalData ?? {})[0];
  const image = Array.isArray(first) ? (first as unknown[])[0] : undefined;
  return typeof image === 'string' && image !== '' ? image : undefined;
}

async function resolveWallpaper(response: GetUserPreferenceWallpaperResponse): Promise<Wallpaper | undefined> {
  const parsed = response.key ? parseWallpaperKey(response.key) : undefined;
  if (!response.wallpaper || parsed === undefined) {
    return undefined;
  }
  const client = useBackend();
  switch (parsed.kind) {
    case 'static':
      return {
        kind: 'static',
        url: client.staticWallpaperUrl(firstThemeImage(response.configuration) ?? parsed.value),
      };
    case 'uploaded':
      return { kind: 'uploaded', url: await client.resolveMediaUrl(parsed.value) };
    case 'dynamic':
      // Served by the frontend itself, next to the SPA
      return { kind: 'dynamic', url: `/wallpaper/${encodeURIComponent(parsed.value)}/index.html` };
  }
}

/** The wallpaper of the signed-in user. */
export const useWallpaperStore = defineStore('wallpaper', () => {
  const wallpaper = shallowRef<Wallpaper | undefined>();

  /** Loads the user's wallpaper. No preference (404) or a broken one means no wallpaper. */
  async function load(): Promise<void> {
    try {
      const response = await useBackend().api.user.preferences.wallpaper.get();
      wallpaper.value = response ? await resolveWallpaper(response) : undefined;
    } catch (error) {
      if (!isNotFound(error)) {
        console.error(error);
      }
      wallpaper.value = undefined;
    }
  }

  function clear(): void {
    wallpaper.value = undefined;
  }

  return { wallpaper, load, clear };
});
