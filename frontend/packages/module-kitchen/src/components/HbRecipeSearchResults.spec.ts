import { backendClientKey } from '@homebook/module-sdk';
import { mountWithPlugins } from '@homebook/test-utils';

import HbRecipeSearchResults from './HbRecipeSearchResults.vue';

const WITH_IMAGE = '0f8fad5b-d9cb-469f-a165-70867728950e';
const WITHOUT_IMAGE = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const MEDIA_ID = '11111111-2222-4333-8444-555555555555';

function mockClient() {
  const imagesOf = (id: string) => ({
    get: vi.fn(async () => ({ imageMediaIds: id === WITH_IMAGE ? [MEDIA_ID] : [] })),
  });
  const byId = vi.fn((id: string) => ({ images: imagesOf(id) }));
  return {
    byId,
    client: {
      api: { modules: { homebook: { kitchen: { recipes: { byId } } } } },
      resolveMediaUrl: vi.fn(async (id: string) => `/api/storage/media/${id}`),
    },
  };
}

async function mountResults(items: { identifier: string; title: string }[]) {
  const { client, byId } = mockClient();
  const mounted = await mountWithPlugins(HbRecipeSearchResults, {
    props: { items },
    global: { provide: { [backendClientKey as symbol]: client } },
  });
  return { ...mounted, byId };
}

describe('HbRecipeSearchResults', () => {
  it('links every recipe to its view page', async () => {
    const { wrapper } = await mountResults([{ identifier: WITH_IMAGE, title: 'Pancakes' }]);

    const tile = wrapper.find('a.hb-recipe-search-results__tile');
    expect(tile.attributes('href')).toBe(`/Kitchen/Recipes/${WITH_IMAGE}/View`);
    expect(tile.text()).toBe('Pancakes');
  });

  it('shows the first recipe image, or the placeholder without one', async () => {
    const { wrapper } = await mountResults([
      { identifier: WITH_IMAGE, title: 'Pancakes' },
      { identifier: WITHOUT_IMAGE, title: 'Soup' },
    ]);

    await vi.waitFor(() => expect(wrapper.findAll('img')[0]?.attributes('src')).toBe(`/api/storage/media/${MEDIA_ID}`));
    expect(wrapper.findAll('img')[1]?.classes()).toContain('hb-recipe-search-results__image--placeholder');
  });

  it('skips hits without a valid recipe id', async () => {
    const { wrapper, byId } = await mountResults([{ identifier: 'not-a-guid', title: 'Broken' }]);

    expect(wrapper.find('a').exists()).toBe(false);
    expect(byId).not.toHaveBeenCalled();
  });
});
