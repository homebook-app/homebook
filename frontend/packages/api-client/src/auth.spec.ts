import { describe, expect, it, vi } from 'vitest';
import { BearerAccessTokenProvider, UnauthorizedMiddleware } from './auth.js';
import { createBackendClient } from './client.js';
import { isUnauthorized } from './errors.js';
import { createFetchMock, jsonResponse, textResponse } from './testing/fetchMock.js';

describe('BearerAccessTokenProvider', () => {
  it('returns the token from the source', async () => {
    const provider = new BearerAccessTokenProvider(() => 'token-123');

    await expect(provider.getAuthorizationToken()).resolves.toBe('token-123');
  });

  it('returns an empty string when there is no token', async () => {
    const provider = new BearerAccessTokenProvider(async () => null);

    await expect(provider.getAuthorizationToken()).resolves.toBe('');
  });
});

describe('UnauthorizedMiddleware', () => {
  it('throws when it is the last middleware', async () => {
    const middleware = new UnauthorizedMiddleware(() => undefined);

    await expect(middleware.execute('/api/version', {})).rejects.toThrow(/last middleware/);
  });
});

describe('authentication through the client', () => {
  it('sends the bearer token', async () => {
    const mock = createFetchMock(() => jsonResponse({ version: '1.0.0' }));
    const client = createBackendClient({ getAccessToken: () => 'abc', fetch: mock.fetch });

    await client.api.version.get();

    expect(mock.last().headers.get('authorization')).toBe('Bearer abc');
  });

  it('sends no authorization header without a token', async () => {
    const mock = createFetchMock(() => jsonResponse({ version: '1.0.0' }));
    const client = createBackendClient({ getAccessToken: () => null, fetch: mock.fetch });

    await client.api.version.get();

    expect(mock.last().headers.has('authorization')).toBe(false);
  });

  it('reports 401 through the callback and throws a status-code error', async () => {
    const onUnauthorized = vi.fn();
    const mock = createFetchMock(() => textResponse('Unauthorized', 401));
    const client = createBackendClient({
      getAccessToken: () => 'expired',
      onUnauthorized,
      fetch: mock.fetch,
    });

    const failure = await client.api.info.get().catch((error: unknown) => error);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(isUnauthorized(failure)).toBe(true);
  });

  it('does not invoke the callback on success', async () => {
    const onUnauthorized = vi.fn();
    const mock = createFetchMock(() => jsonResponse({ version: '1.0.0' }));
    const client = createBackendClient({ getAccessToken: () => 'abc', onUnauthorized, fetch: mock.fetch });

    await client.api.version.get();

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
