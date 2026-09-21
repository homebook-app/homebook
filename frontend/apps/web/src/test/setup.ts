import '@homebook/test-utils/setup';

// The API client is always mocked, never called for real
vi.mock('@homebook/api-client', () => import('./apiClientMock'));
