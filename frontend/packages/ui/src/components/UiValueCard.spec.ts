import { mountWithPlugins } from '@homebook/test-utils';

import UiDetailCard from './UiDetailCard.vue';
import UiValueCard from './UiValueCard.vue';

const props = {
  title: 'Balance',
  valueDisplay: '1,240.00 €',
  color: 'var(--hb-color-emerald)',
  icon: 'ChartCircle',
};

describe('UiValueCard', () => {
  it('shows title and value and hands the accent to the detail card', async () => {
    const { wrapper } = await mountWithPlugins(UiValueCard, { props });

    expect(wrapper.find('.ui-value-card-title-text').text()).toBe('Balance');
    expect(wrapper.find('.ui-value-display-text').text()).toBe('1,240.00 €');
    expect(wrapper.findComponent(UiDetailCard).props()).toMatchObject({
      color: 'var(--hb-color-emerald)',
      icon: 'ChartCircle',
      iconSet: 'windows11-filled',
    });
  });

  it('exposes the accent as a custom property, the caption color is a token', async () => {
    const { wrapper } = await mountWithPlugins(UiValueCard, { props });

    expect(wrapper.find('.ui-value-card').attributes('style')).toContain(
      '--ui-value-card-accent-color: var(--hb-color-emerald)',
    );
  });

  it('renders each footer line only when its text is there', async () => {
    const empty = await mountWithPlugins(UiValueCard, { props });
    expect(empty.wrapper.find('.ui-value-footer-text').exists()).toBe(false);

    const highlighted = await mountWithPlugins(UiValueCard, { props: { ...props, footerHighlightedText: '+12 %' } });
    expect(highlighted.wrapper.find('.ui-value-footer-highlighted-text').text()).toBe('+12 %');
    expect(highlighted.wrapper.find('.ui-value-footer-notice-text').exists()).toBe(false);

    const both = await mountWithPlugins(UiValueCard, {
      props: { ...props, footerHighlightedText: '+12 %', footerNotice: 'since March' },
    });
    expect(both.wrapper.find('.ui-value-footer-notice-text').text()).toBe('since March');
  });
});
