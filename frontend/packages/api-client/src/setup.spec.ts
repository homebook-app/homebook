import { describe, expect, it } from 'vitest';
import { createBackendClient } from './client.js';
import { statusCodeOf } from './errors.js';
import { staticWallpaperUrl } from './media.js';
import { createFetchMock, emptyResponse, jsonResponse, textResponse } from './testing/fetchMock.js';

function clientWith(mock: ReturnType<typeof createFetchMock>) {
  return createBackendClient({ getAccessToken: () => undefined, fetch: mock.fetch });
}

describe('getSetupAvailability', () => {
  it.each([200, 201, 204, 409] as const)('returns status %i', async (status) => {
    const mock = createFetchMock(() => (status === 204 ? emptyResponse(204) : jsonResponse({}, status)));

    const result = await clientWith(mock).getSetupAvailability();

    expect(result).toBe(status);
    expect(mock.last().url).toBe('/api/setup/availability');
  });

  it('rejects any other status with its status code', async () => {
    const mock = createFetchMock(() => textResponse('boom', 500));

    const failure = await clientWith(mock)
      .getSetupAvailability()
      .catch((error: unknown) => error);

    expect(statusCodeOf(failure)).toBe(500);
  });

  it('propagates network failures', async () => {
    const mock = createFetchMock(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(clientWith(mock).getSetupAvailability()).rejects.toThrow('Failed to fetch');
  });
});

describe('staticWallpaperUrl', () => {
  it('encodes the file name and escapes dots', () => {
    expect(staticWallpaperUrl('/api/', 'bg/sunset beach.jpg')).toBe('/api/system/wallpaper/bg%2Fsunset%20beach%2Ejpg');
  });

  it('is exposed on the client with its base URL', () => {
    const client = clientWith(createFetchMock(() => emptyResponse()));

    expect(client.staticWallpaperUrl('a.png')).toBe('/api/system/wallpaper/a%2Epng');
  });
});
