import { mountWithPlugins } from '@homebook/test-utils';
import { APP_TITLE, UiStartMenuItem, UiValueCard, UiWidgetContainer } from '@homebook/ui';

import DesignProofPage from './DesignProofPage.vue';

describe('DesignProofPage', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  it('mounts every section of the gallery', async () => {
    const { wrapper } = await mountWithPlugins(DesignProofPage, {
      routes: [
        { path: '/Kitchen', component: { template: '<div />' } },
        { path: '/Finances', component: { template: '<div />' } },
        { path: '/Settings', component: { template: '<div />' } },
      ],
    });

    expect(wrapper.findAllComponents(UiValueCard).length).toBeGreaterThan(0);
    expect(wrapper.findAllComponents(UiStartMenuItem)).toHaveLength(3);
    expect(wrapper.findAllComponents(UiWidgetContainer)).toHaveLength(5);
  });

  it('names itself in the document title', async () => {
    await mountWithPlugins(DesignProofPage);

    expect(document.title).toBe(`settings.developer.components.title - ${APP_TITLE}`);
  });
});
