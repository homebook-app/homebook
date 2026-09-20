import { mountWithPlugins } from '@homebook/test-utils';

import UiDetailListItem from './UiDetailListItem.vue';
import UiIcon from './UiIcon.vue';

describe('UiDetailListItem', () => {
  it('renders the icon only when one is named', async () => {
    const without = await mountWithPlugins(UiDetailListItem);
    expect(without.wrapper.find('.ui-detail-list-item-icon').exists()).toBe(false);

    const { wrapper } = await mountWithPlugins(UiDetailListItem, { props: { icon: 'Home' } });
    expect(wrapper.findComponent(UiIcon).props()).toMatchObject({
      set: 'windows11-filled',
      name: 'Home',
      size: 'medium',
    });
  });

  it('passes the icon size through', async () => {
    const { wrapper } = await mountWithPlugins(UiDetailListItem, { props: { icon: 'Home', iconSize: 'large' } });

    expect(wrapper.findComponent(UiIcon).props('size')).toBe('large');
  });

  it('renders title and caption into their own rows', async () => {
    const { wrapper } = await mountWithPlugins(UiDetailListItem, {
      slots: { title: 'Storage', caption: '12 of 64 GB' },
    });

    expect(wrapper.find('.ui-detail-list-item-title').text()).toBe('Storage');
    expect(wrapper.find('.ui-detail-list-item-caption').text()).toBe('12 of 64 GB');
    expect(wrapper.find('.ui-detail-list-item-caption').classes()).toContain('ui-text-caption');
  });
});
