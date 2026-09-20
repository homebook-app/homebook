import { mountWithPlugins } from '@homebook/test-utils';

import { APP_TITLE } from '../composables/usePageTitle';
import UiPageTitle from './UiPageTitle.vue';

describe('UiPageTitle', () => {
  it('sets the document title and renders nothing', async () => {
    const { wrapper } = await mountWithPlugins(UiPageTitle, { props: { title: 'Recipes' } });

    expect(document.title).toBe(`Recipes - ${APP_TITLE}`);
    // The template is a comment node, the component contributes no element to the page
    expect(wrapper.element.nodeType).toBe(Node.COMMENT_NODE);
  });

  it('follows a change of the title prop', async () => {
    const { wrapper } = await mountWithPlugins(UiPageTitle, { props: { title: 'Recipes' } });

    await wrapper.setProps({ title: 'Settings' });

    expect(document.title).toBe(`Settings - ${APP_TITLE}`);
  });

  it('takes an app title of its own', async () => {
    await mountWithPlugins(UiPageTitle, { props: { title: 'Welcome', appTitle: 'Setup' } });

    expect(document.title).toBe('Welcome - Setup');
  });
});
