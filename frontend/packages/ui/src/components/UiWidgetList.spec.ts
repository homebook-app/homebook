import { mountWithPlugins } from '@homebook/test-utils';

import UiWidgetList from './UiWidgetList.vue';

describe('UiWidgetList', () => {
  it('stacks its widgets under the global list class', async () => {
    const { wrapper } = await mountWithPlugins(UiWidgetList, { slots: { default: '<p>Budget</p><p>Storage</p>' } });

    expect(wrapper.classes()).toContain('ui-widget-list');
    expect(wrapper.findAll('p')).toHaveLength(2);
  });
});
