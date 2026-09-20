import { useToast } from 'primevue/usetoast';
import { defineComponent, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { mountWithPlugins } from './mountWithPlugins';

const Probe = defineComponent({
  name: 'TestProbe',
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const toast = useToast();

    return () =>
      h('div', [
        h('span', { class: 'probe-text' }, t('probe.label')),
        h('span', { class: 'probe-path' }, route.fullPath),
        h('span', { class: 'probe-toast' }, typeof toast.add),
      ]);
  },
});

describe('mountWithPlugins', () => {
  it('renders the translation key when no catalog is given', async () => {
    const { wrapper } = await mountWithPlugins(Probe);

    expect(wrapper.find('.probe-text').text()).toBe('probe.label');
  });

  it('uses the messages and the locale passed in', async () => {
    const { wrapper } = await mountWithPlugins(Probe, {
      locale: 'de-DE',
      messages: { 'de-DE': { probe: { label: 'Beschriftung' } } },
    });

    expect(wrapper.find('.probe-text').text()).toBe('Beschriftung');
  });

  it('navigates to the initial route before mounting', async () => {
    const { wrapper, router } = await mountWithPlugins(Probe, { initialRoute: '/Kitchen/Recipes?s=soup' });

    expect(wrapper.find('.probe-path').text()).toBe('/Kitchen/Recipes?s=soup');
    expect(router.currentRoute.value.query.s).toBe('soup');
  });

  it('installs the PrimeVue services', async () => {
    const { wrapper } = await mountWithPlugins(Probe);

    expect(wrapper.find('.probe-toast').text()).toBe('function');
  });

  it('creates a fresh Pinia for every mount', async () => {
    const first = await mountWithPlugins(Probe);
    const second = await mountWithPlugins(Probe);

    expect(first.pinia).not.toBe(second.pinia);
  });

  it('keeps plugins passed by the caller', async () => {
    const install = vi.fn();

    await mountWithPlugins(Probe, { global: { plugins: [{ install }] } });

    expect(install).toHaveBeenCalledOnce();
  });
});
