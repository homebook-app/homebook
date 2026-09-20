import { mountWithPlugins } from '@homebook/test-utils';

import App from '@/App.vue';
import { routes } from '@/router';

describe('App', () => {
  it('renders the page of the current route', async () => {
    const { wrapper } = await mountWithPlugins(App, { routes });

    expect(wrapper.find('.hb-placeholder-page').exists()).toBe(true);
  });
});
