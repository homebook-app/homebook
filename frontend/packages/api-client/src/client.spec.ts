import { describe, expect, it, vi } from 'vitest';
import { createBackendClient, DEFAULT_BASE_URL } from './client.js';
import { isServiceUnavailable, statusCodeOf } from './errors.js';
import { createFetchMock, emptyResponse, jsonResponse, textResponse } from './testing/fetchMock.js';

const SAVING_GOAL_ID = '6a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const SCOPE_ID = '11111111-2222-4333-8444-555555555555';

function clientWith(mock: ReturnType<typeof createFetchMock>, baseUrl?: string) {
  return createBackendClient({ baseUrl, getAccessToken: () => 'abc', fetch: mock.fetch });
}

describe('createBackendClient', () => {
  it('defaults the base URL to /api', () => {
    const client = clientWith(createFetchMock(() => emptyResponse()));

    expect(client.baseUrl).toBe(DEFAULT_BASE_URL);
  });

  it('sends through the global fetch when no fetch is configured', async () => {
    const mock = createFetchMock(() => jsonResponse({ searchModuleResponses: [] }));
    vi.stubGlobal('fetch', mock.fetch);
    try {
      const client = createBackendClient({ getAccessToken: () => 'abc' });

      await client.search('tea');

      expect(mock.last().url).toBe('/api/search?s=tea');
      expect(mock.last().headers.get('authorization')).toBe('Bearer abc');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('strips a trailing slash from the base URL', async () => {
    const mock = createFetchMock(() => jsonResponse({ version: '1' }));
    const client = clientWith(mock, 'http://localhost:5032/');

    await client.api.version.get();

    expect(client.baseUrl).toBe('http://localhost:5032');
    expect(mock.last().url).toBe('http://localhost:5032/version');
  });

  it('sends the search query as parameter s', async () => {
    const mock = createFetchMock(() => jsonResponse({ searchModuleResponses: [] }));

    await clientWith(mock).search('tea');

    expect(mock.last().url).toBe('/api/search?s=tea');
  });

  it('always sends searchFilter for the recipe list', async () => {
    const mock = createFetchMock(() => jsonResponse({ recipes: [] }));
    const client = clientWith(mock);

    await client.listRecipes();
    expect(mock.last().url).toBe('/api/modules/homebook/kitchen/recipes?searchFilter=');

    await client.listRecipes('soup');
    expect(mock.last().url).toBe('/api/modules/homebook/kitchen/recipes?searchFilter=soup');
  });

  it('deletes a saving goal by id', async () => {
    const mock = createFetchMock(() => emptyResponse(200));

    await clientWith(mock).deleteSavingGoal(SAVING_GOAL_ID);

    expect(mock.last().method).toBe('DELETE');
    expect(mock.last().url).toBe(`/api/modules/homebook/finances/saving-goals/${SAVING_GOAL_ID}`);
  });

  it('reads the scope id as a string', async () => {
    const mock = createFetchMock(() => jsonResponse(SCOPE_ID));

    const scopeId = await clientWith(mock).getScopeIdByName('homebook.kitchen.RecipeImages');

    expect(mock.last().url).toBe('/api/storage/scopes?name=homebook.kitchen.RecipeImages');
    expect(scopeId).toBe(SCOPE_ID);
  });

  it('uploads a file as JSON with base64 content', async () => {
    const mock = createFetchMock(() => jsonResponse({ mediaItemId: SCOPE_ID }));
    const file = new File([new Uint8Array([0xff, 0x00, 0x80])], 'pixel.bin');

    const response = await clientWith(mock).uploadFile(file, SCOPE_ID);

    const request = mock.last();
    expect(request.method).toBe('POST');
    expect(request.url).toBe('/api/storage/files');
    expect(request.headers.get('content-type')).toBe('application/json');
    expect(JSON.parse(request.body ?? '')).toEqual({ filename: 'pixel.bin', content: '/wCA', scopeId: SCOPE_ID });
    expect(response?.mediaItemId).toBe(SCOPE_ID);
  });

  it('surfaces a 503 immediately without retrying', async () => {
    const mock = createFetchMock(() => textResponse('database unreachable', 503));

    const failure = await clientWith(mock)
      .search('x')
      .catch((error: unknown) => error);

    expect(isServiceUnavailable(failure)).toBe(true);
    expect(statusCodeOf(failure)).toBe(503);
    expect(mock.calls).toHaveBeenCalledTimes(1);
  });
});
