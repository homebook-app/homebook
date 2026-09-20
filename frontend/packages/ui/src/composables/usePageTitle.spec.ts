import { mountWithPlugins } from '@homebook/test-utils';
import { defineComponent, ref, type Ref } from 'vue';

import { APP_TITLE, usePageTitle } from './usePageTitle';

function mountWith(title: Ref<string | undefined>, appTitle?: string) {
  return mountWithPlugins(
    defineComponent({
      setup() {
        usePageTitle(title, appTitle);
        return () => null;
      },
    }),
  );
}

describe('usePageTitle', () => {
  it('appends the app title to the page title', async () => {
    await mountWith(ref('Recipes'));

    expect(document.title).toBe(`Recipes - ${APP_TITLE}`);
  });

  it('follows a change of the title', async () => {
    const title = ref('Recipes');
    await mountWith(title);

    title.value = 'Settings';
    await vi.waitFor(() => expect(document.title).toBe(`Settings - ${APP_TITLE}`));
  });

  it('leaves the app title alone when there is no page title', async () => {
    await mountWith(ref(undefined));
    expect(document.title).toBe(APP_TITLE);

    // A title of spaces only is as good as none
    await mountWith(ref('   '));
    expect(document.title).toBe(APP_TITLE);
  });

  it('accepts an app title of its own', async () => {
    await mountWith(ref('Recipes'), 'Setup');

    expect(document.title).toBe('Recipes - Setup');
  });
});
