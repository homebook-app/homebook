import { mountWithPlugins } from '@homebook/test-utils';

import UiIcon from './UiIcon.vue';
import UiSettingsItem from './UiSettingsItem.vue';

describe('UiSettingsItem', () => {
  it('renders the icon only when one is named, and tints it', async () => {
    const without = await mountWithPlugins(UiSettingsItem, { props: { title: 'Instance name' } });
    expect(without.wrapper.find('.ui-settings-item-icon').exists()).toBe(false);

    const { wrapper } = await mountWithPlugins(UiSettingsItem, {
      props: { title: 'Instance name', icon: 'Tag', iconColor: 'var(--hb-settings-color-instance-name)' },
    });

    expect(wrapper.findComponent(UiIcon).props()).toMatchObject({
      set: 'windows11-filled',
      name: 'Tag',
      color: 'var(--hb-settings-color-instance-name)',
    });
  });

  it('renders the caption only when there is one', async () => {
    const without = await mountWithPlugins(UiSettingsItem, { props: { title: 'Instance name' } });
    expect(without.wrapper.find('.ui-settings-item-caption').exists()).toBe(false);

    const { wrapper } = await mountWithPlugins(UiSettingsItem, {
      props: { title: 'Instance name', caption: 'The name shown in the browser tab' },
    });
    expect(wrapper.find('.ui-settings-item-caption').text()).toBe('The name shown in the browser tab');
    expect(wrapper.find('.ui-settings-item-title').text()).toBe('Instance name');
  });

  it('renders the control side only when the slot is filled', async () => {
    const without = await mountWithPlugins(UiSettingsItem, { props: { title: 'Instance name' } });
    expect(without.wrapper.find('.ui-settings-item-control').exists()).toBe(false);

    const { wrapper } = await mountWithPlugins(UiSettingsItem, {
      props: { title: 'Instance name' },
      slots: { default: '<input id="name" />' },
    });
    expect(wrapper.find('.ui-settings-item-content input').exists()).toBe(true);
  });
});
