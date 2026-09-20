import { mountWithPlugins } from '@homebook/test-utils';

import UiWidgetContainer, { type UiWidgetSize } from './UiWidgetContainer.vue';

const sizes: Array<[UiWidgetSize, string[]]> = [
  ['2x1', ['w-2', 'h-1']],
  ['2x2', ['w-2', 'h-2']],
  ['4x2', ['w-4', 'h-2']],
  ['4x4', ['w-4', 'h-4']],
  ['8x4', ['w-8', 'h-4']],
];

describe('UiWidgetContainer', () => {
  it.each(sizes)('turns the size %s into grid classes', async (size, expected) => {
    const { wrapper } = await mountWithPlugins(UiWidgetContainer, { props: { size } });

    expect(wrapper.find('.ui-widget').classes()).toEqual(expect.arrayContaining(expected));
  });

  it('sizes a container that was given no size, unlike the Blazor original', async () => {
    const { wrapper } = await mountWithPlugins(UiWidgetContainer);

    expect(wrapper.find('.ui-widget').classes()).toEqual(expect.arrayContaining(['w-2', 'h-2']));
  });

  it('renders the widget in its content area', async () => {
    const { wrapper } = await mountWithPlugins(UiWidgetContainer, { slots: { default: '<p>Budget</p>' } });

    expect(wrapper.find('.ui-widget p').text()).toBe('Budget');
  });
});
