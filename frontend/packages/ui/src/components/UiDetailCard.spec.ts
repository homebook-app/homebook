import { mountWithPlugins } from '@homebook/test-utils';

import UiColoredIcon from './UiColoredIcon.vue';
import UiDetailCard from './UiDetailCard.vue';

const props = { color: 'var(--hb-color-cerulean)', icon: 'Home' };

describe('UiDetailCard', () => {
  it('passes color and icon on to UiColoredIcon', async () => {
    const { wrapper } = await mountWithPlugins(UiDetailCard, { props });

    expect(wrapper.findComponent(UiColoredIcon).props()).toMatchObject({
      set: 'windows11-filled',
      name: 'Home',
      color: 'var(--hb-color-cerulean)',
    });
  });

  it('takes an icon set of its own', async () => {
    const { wrapper } = await mountWithPlugins(UiDetailCard, { props: { ...props, iconSet: 'windows11-outline' } });

    expect(wrapper.findComponent(UiColoredIcon).props('set')).toBe('windows11-outline');
  });

  it('renders the footer only when the slot is filled', async () => {
    const without = await mountWithPlugins(UiDetailCard, { props, slots: { header: 'Balance' } });
    expect(without.wrapper.find('.ui-detail-card-footer').exists()).toBe(false);
    expect(without.wrapper.find('.ui-detail-card-header').text()).toBe('Balance');

    const withFooter = await mountWithPlugins(UiDetailCard, { props, slots: { footer: 'since March' } });
    expect(withFooter.wrapper.find('.ui-detail-card-footer').text()).toBe('since March');
  });

  it('drops the card separators, the accent is the icon alone', async () => {
    const { wrapper } = await mountWithPlugins(UiDetailCard, { props });

    expect(wrapper.find('.ui-detail-card').classes()).toContain('no-divider');
  });
});
