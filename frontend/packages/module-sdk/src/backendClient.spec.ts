import type { HomeBookClient } from '@homebook/api-client';
import { mountWithPlugins } from '@homebook/test-utils';
import { defineComponent, h } from 'vue';

import { backendClientKey, useBackendClient } from './backendClient';

let received: HomeBookClient | undefined;

const Probe = defineComponent({
  setup() {
    received = useBackendClient();
    return () => h('div');
  },
});

describe('useBackendClient', () => {
  beforeEach(() => {
    received = undefined;
  });

  it('returns the provided client', async () => {
    const client = { baseUrl: '/api' } as HomeBookClient;

    await mountWithPlugins(Probe, { global: { provide: { [backendClientKey as symbol]: client } } });

    expect(received).toBe(client);
  });

  it('fails loudly without a provided client', async () => {
    await expect(mountWithPlugins(Probe)).rejects.toThrow('No backend client provided');
  });
});
