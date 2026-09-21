import { mountWithPlugins } from '@homebook/test-utils';
import { UiCountdownAlert } from '@homebook/ui';

import HbSetupStepCard from './HbSetupStepCard.vue';

describe('HbSetupStepCard', () => {
  it('shows the title and the content', async () => {
    const { wrapper } = await mountWithPlugins(HbSetupStepCard, {
      props: { title: 'Database' },
      slots: { default: '<p class="content">Form</p>' },
    });

    expect(wrapper.find('h2').text()).toBe('Database');
    expect(wrapper.find('.content').exists()).toBe(true);
    expect(wrapper.find('.p-progressbar').exists()).toBe(false);
    expect(wrapper.find('.hb-setup-step__error').exists()).toBe(false);
  });

  it('shows a progress bar while busy', async () => {
    const { wrapper } = await mountWithPlugins(HbSetupStepCard, { props: { title: 'Database', busy: true } });

    expect(wrapper.find('.p-progressbar').exists()).toBe(true);
    expect(wrapper.find('section').attributes('aria-busy')).toBe('true');
  });

  it('shows the error with a retry button that reports the click', async () => {
    const { wrapper } = await mountWithPlugins(HbSetupStepCard, {
      props: { title: 'Database', error: { key: 'setup.error', params: ['x'] }, retryLabel: 'Retry' },
    });

    expect(wrapper.find('.hb-setup-step__error').text()).toContain('setup.error');
    await wrapper.find('.hb-setup-step__retry').trigger('click');

    expect(wrapper.emitted('retry')).toHaveLength(1);
  });

  it('leaves out the retry button without a label', async () => {
    const { wrapper } = await mountWithPlugins(HbSetupStepCard, {
      props: { title: 'Database', error: { key: 'setup.error' } },
    });

    expect(wrapper.find('.hb-setup-step__retry').exists()).toBe(false);
  });

  it('shows the success as a countdown and reports its end', async () => {
    const { wrapper } = await mountWithPlugins(HbSetupStepCard, {
      props: { title: 'Database', success: { key: 'setup.saved' } },
    });

    const countdown = wrapper.findComponent(UiCountdownAlert);
    expect(countdown.text()).toBe('setup.saved');
    countdown.vm.$emit('finished');

    expect(wrapper.emitted('finished')).toHaveLength(1);
  });
});
