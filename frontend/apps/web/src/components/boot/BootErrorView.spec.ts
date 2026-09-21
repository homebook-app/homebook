import { mountWithPlugins } from '@homebook/test-utils';

import BootErrorView from './BootErrorView.vue';

describe('BootErrorView', () => {
  it.each(['unreachable', 'setupRunning'] as const)('explains the %s state', async (reason) => {
    const { wrapper } = await mountWithPlugins(BootErrorView, { props: { reason } });

    expect(wrapper.find('h1').text()).toBe(`boot.${reason}.title`);
    expect(wrapper.find('p').text()).toBe(`boot.${reason}.text`);
  });

  it('asks for a retry', async () => {
    const { wrapper } = await mountWithPlugins(BootErrorView, { props: { reason: 'unreachable' } });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
