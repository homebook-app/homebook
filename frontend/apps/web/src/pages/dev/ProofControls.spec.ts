import { mountWithPlugins } from '@homebook/test-utils';
import { UiNumericGroup, UiProgressItem } from '@homebook/ui';

import ProofControls from './ProofControls.vue';

describe('ProofControls', () => {
  it('shows a progress item in each of the three sizes', async () => {
    const { wrapper } = await mountWithPlugins(ProofControls);

    expect(wrapper.findAllComponents(UiProgressItem).map((item) => item.props('progressSize'))).toEqual([
      'small',
      'medium',
      'large',
    ]);
  });

  it('completes the v-model round trip of the numeric group', async () => {
    const { wrapper } = await mountWithPlugins(ProofControls);
    const group = wrapper.findComponent(UiNumericGroup);

    expect(group.props('modelValue')).toBe(4);
    expect(wrapper.find('.hb-proof-controls__echo').text()).toContain('4');

    group.vm.$emit('update:modelValue', 9);
    await wrapper.vm.$nextTick();

    expect(group.props('modelValue')).toBe(9);
    expect(wrapper.find('.hb-proof-controls__echo').text()).toContain('9');
  });
});
