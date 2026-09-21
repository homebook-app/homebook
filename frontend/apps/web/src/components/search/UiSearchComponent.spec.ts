import { defineModule } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';
import { h } from 'vue';

import { createModuleRegistry, moduleRegistryKey } from '@/modules';
import { mockBackend } from '@/test/backend';

import SearchResultGroup from './SearchResultGroup.vue';
import UiSearchComponent from './UiSearchComponent.vue';

const RECIPES = 'HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler';
const UNKNOWN = 'HomeBook.Backend.Module.Other.Module.NoteSearchHandler';

const RecipeResults = { props: ['items'], render: () => h('div', { class: 'probe-recipes' }) };

const registry = createModuleRegistry([
  defineModule({
    key: 'homebook.kitchen',
    nameKey: 'kitchen.moduleName',
    descriptionKey: 'kitchen.moduleDescription',
    icon: { set: 'glass-morphism', name: 'Tableware' },
    routes: [],
    startMenuItems: [],
    widgets: [],
    searchResultComponents: { [RECIPES]: RecipeResults },
    messages: {},
  }),
]);

async function mountSearch() {
  const search = vi.fn(async () => ({
    searchModuleResponses: [
      { moduleKey: RECIPES, totalCount: 5, items: [{ identifier: '1', title: 'Pancakes' }] },
      { moduleKey: UNKNOWN, totalCount: 1, items: [{ identifier: '2', title: 'Shopping', description: 'Milk' }] },
    ],
  }));
  mockBackend({ search });
  const mounted = await mountWithPlugins(UiSearchComponent, {
    props: { debounceMs: 10 },
    attachTo: document.body,
    global: { provide: { [moduleRegistryKey as symbol]: registry } },
  });
  return { ...mounted, search };
}

describe('UiSearchComponent', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('stays closed until there is something to show', async () => {
    const { wrapper } = await mountSearch();

    expect(wrapper.find('.ui-search-component__panel').exists()).toBe(false);
    expect(wrapper.find('input').attributes('aria-expanded')).toBe('false');
  });

  it('searches after typing and renders the hits per module', async () => {
    const { wrapper, search } = await mountSearch();

    await wrapper.find('input').setValue('pan');
    await vi.waitFor(() => expect(wrapper.findAllComponents(SearchResultGroup)).toHaveLength(2));

    expect(search).toHaveBeenCalledWith('pan');
    const [recipes, unknown] = wrapper.findAllComponents(SearchResultGroup);
    expect(recipes?.props('title')).toBe('kitchen.moduleName');
    expect(recipes?.find('.probe-recipes').exists()).toBe(true);
    expect(recipes?.find('.ui-search-component__module-count').text()).toBe('5');
    expect(unknown?.props('title')).toBe('Note');
    expect(unknown?.text()).toContain('Shopping');
    expect(unknown?.text()).toContain('Milk');
    expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
  });

  it('closes on Escape and on the backdrop', async () => {
    const { wrapper } = await mountSearch();

    await wrapper.find('input').setValue('pan');
    await vi.waitFor(() => expect(wrapper.find('.ui-search-component__panel').exists()).toBe(true));
    await wrapper.find('input').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('.ui-search-component__panel').exists()).toBe(false);

    await wrapper.find('input').setValue('pancakes');
    await vi.waitFor(() => expect(document.querySelector('.ui-search-component__mask')).not.toBeNull());
    document.querySelector<HTMLElement>('.ui-search-component__mask')?.click();
    await vi.waitFor(() => expect(wrapper.find('.ui-search-component__panel').exists()).toBe(false));
  });
});
