import { describe, expect, it } from 'vitest';
import { createBackendClient } from './client.js';
import { mediaUrl, prefixMediaPath } from './media.js';
import { createFetchMock, jsonResponse } from './testing/fetchMock.js';

const MEDIA_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

describe('prefixMediaPath', () => {
  it('prefixes the base URL', () => {
    expect(prefixMediaPath('/api', `/storage/media/${MEDIA_ID}`)).toBe(`/api/storage/media/${MEDIA_ID}`);
  });

  it('tolerates a trailing slash on the base and a missing leading slash on the path', () => {
    expect(prefixMediaPath('/api/', `storage/media/${MEDIA_ID}`)).toBe(`/api/storage/media/${MEDIA_ID}`);
  });

  it('leaves already prefixed paths alone', () => {
    expect(prefixMediaPath('/api', `/api/storage/media/${MEDIA_ID}`)).toBe(`/api/storage/media/${MEDIA_ID}`);
  });

  it('leaves absolute URLs alone', () => {
    expect(prefixMediaPath('/api', 'https://cdn.example/x.png')).toBe('https://cdn.example/x.png');
  });

  it('works with an absolute base URL', () => {
    expect(prefixMediaPath('http://localhost:5032', `/storage/media/${MEDIA_ID}`)).toBe(
      `http://localhost:5032/storage/media/${MEDIA_ID}`,
    );
  });
});

describe('mediaUrl', () => {
  it('builds the raw media URL', () => {
    expect(mediaUrl('/api', MEDIA_ID)).toBe(`/api/storage/media/${MEDIA_ID}`);
  });
});

describe('client.resolveMediaUrl', () => {
  it('calls the url endpoint and prefixes the result', async () => {
    const mock = createFetchMock(() => jsonResponse({ mediaUri: `/storage/media/${MEDIA_ID}` }));
    const client = createBackendClient({ getAccessToken: () => 'abc', fetch: mock.fetch });

    const url = await client.resolveMediaUrl(MEDIA_ID);

    expect(mock.last().url).toBe(`/api/media/${MEDIA_ID}/url`);
    expect(url).toBe(`/api/storage/media/${MEDIA_ID}`);
  });

  it('fails when the backend returns no URL', async () => {
    const mock = createFetchMock(() => jsonResponse({}));
    const client = createBackendClient({ getAccessToken: () => 'abc', fetch: mock.fetch });

    await expect(client.resolveMediaUrl(MEDIA_ID)).rejects.toThrow(/no URL/);
  });

  it('exposes the raw media URL without a request', () => {
    const mock = createFetchMock(() => jsonResponse({}));
    const client = createBackendClient({ getAccessToken: () => 'abc', fetch: mock.fetch });

    expect(client.mediaUrl(MEDIA_ID)).toBe(`/api/storage/media/${MEDIA_ID}`);
    expect(mock.calls).not.toHaveBeenCalled();
  });
});
