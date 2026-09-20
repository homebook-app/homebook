import { mountWithPlugins } from '@homebook/test-utils';
import InputNumber from 'primevue/inputnumber';

import UiNumericGroup from './UiNumericGroup.vue';

async function mountGroup(props: Record<string, unknown>) {
  const { wrapper } = await mountWithPlugins(UiNumericGroup, { props: { modelValue: 4, ...props } });
  return { wrapper, input: wrapper.findComponent(InputNumber) };
}

describe('UiNumericGroup', () => {
  it('passes the bounds and the step on to the input', async () => {
    const { input } = await mountGroup({ min: 1, max: 10, step: 2, disabled: true, inputId: 'servings' });

    expect(input.props()).toMatchObject({
      modelValue: 4,
      min: 1,
      max: 10,
      step: 2,
      disabled: true,
      inputId: 'servings',
      showButtons: true,
      buttonLayout: 'horizontal',
      allowEmpty: false,
    });
  });

  it('clamps a value that arrives from outside the bounds', async () => {
    const { wrapper, input } = await mountGroup({ min: 1, max: 10 });

    input.vm.$emit('update:modelValue', 99);
    input.vm.$emit('update:modelValue', 0);

    expect(wrapper.emitted('update:modelValue')).toEqual([[10], [1]]);
  });

  it('falls back to the lower bound when the field is cleared', async () => {
    const { wrapper, input } = await mountGroup({ min: 2, max: 10 });

    input.vm.$emit('update:modelValue', null);

    expect(wrapper.emitted('update:modelValue')).toEqual([[2]]);
  });

  it('stays silent when the value did not change', async () => {
    const { wrapper, input } = await mountGroup({ min: 1, max: 10 });

    input.vm.$emit('update:modelValue', 4);

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits a value inside the bounds unchanged', async () => {
    const { wrapper, input } = await mountGroup({ min: 1, max: 10 });

    input.vm.$emit('update:modelValue', 7);

    expect(wrapper.emitted('update:modelValue')).toEqual([[7]]);
  });
});
