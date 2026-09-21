import { mountWithPlugins } from '@homebook/test-utils';
import { h } from 'vue';

import HbFormField from './HbFormField.vue';

function mountField(props: Record<string, unknown>) {
  return mountWithPlugins(HbFormField, {
    props: { inputId: 'name', label: 'Name', ...props },
    slots: {
      default: (scope: { describedBy?: string; invalid: boolean }) =>
        h('input', { id: 'name', 'aria-describedby': scope.describedBy, 'data-invalid': String(scope.invalid) }),
    },
  });
}

describe('HbFormField', () => {
  it('labels the input and shows the helper text', async () => {
    const { wrapper } = await mountField({ helperText: 'Your name' });

    expect(wrapper.find('label').attributes('for')).toBe('name');
    expect(wrapper.find('.hb-form-field__help').text()).toBe('Your name');
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('name-help');
    expect(wrapper.find('input').attributes('data-invalid')).toBe('false');
  });

  it('replaces the helper text with the translated error', async () => {
    const { wrapper } = await mountField({
      helperText: 'Your name',
      error: { key: 'validation.minLength', params: { min: 5 } },
    });

    expect(wrapper.find('.hb-form-field__help').exists()).toBe(false);
    expect(wrapper.find('.hb-form-field__error').text()).toBe('validation.minLength');
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('name-error');
    expect(wrapper.find('input').attributes('data-invalid')).toBe('true');
  });

  it('describes nothing without helper text and error', async () => {
    const { wrapper } = await mountField({});

    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined();
    expect(wrapper.find('small').exists()).toBe(false);
  });
});
