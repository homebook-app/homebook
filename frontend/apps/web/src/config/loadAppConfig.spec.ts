import { AppConfigError, type AppConfigErrorKind } from './appConfig';
import { loadAppConfig } from './loadAppConfig';

const validFile = {
  Version: '1.0.42',
  Backend: { Host: '/api' },
  FeatureManagement: { WidgetMenu: true },
  Upload: { MaxFileSizeBytes: 1024 },
};

function stubFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function expectKind(kind: AppConfigErrorKind): Promise<void> {
  const error: unknown = await loadAppConfig().catch((reason: unknown) => reason);

  expect(error).toBeInstanceOf(AppConfigError);
  expect((error as AppConfigError).kind).toBe(kind);
}

describe('loadAppConfig', () => {
  it('requests appsettings.json without caching and returns the parsed configuration', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(Response.json(validFile)));

    const config = await loadAppConfig();

    expect(fetchMock).toHaveBeenCalledWith('/appsettings.json', { cache: 'no-store' });
    expect(config).toEqual({
      version: '1.0.42',
      backendHost: '/api',
      features: { widgetMenu: true },
      upload: { maxFileSizeBytes: 1024 },
    });
  });

  it('reports a rejected request as a network error', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    await expectKind('network');
  });

  it('reports a non-success status as an http error', async () => {
    stubFetch(() => Promise.resolve(new Response('Not Found', { status: 404 })));

    await expectKind('http');
  });

  it('reports a body that is not JSON as a parse error', async () => {
    stubFetch(() => Promise.resolve(new Response('<!doctype html><html></html>', { status: 200 })));

    await expectKind('parse');
  });

  it('reports a file with the wrong shape as invalid', async () => {
    stubFetch(() => Promise.resolve(Response.json({ ...validFile, Backend: {} })));

    await expectKind('invalid');
  });
});
