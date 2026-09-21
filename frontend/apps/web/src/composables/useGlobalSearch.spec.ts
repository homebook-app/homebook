import type { SearchResponse } from '@homebook/api-client';
import { effectScope } from 'vue';

import { mockBackend } from '@/test/backend';

import { formatSearchHandlerName, groupSearchResults, SEARCH_DEBOUNCE_MS, useGlobalSearch } from './useGlobalSearch';

const RECIPES = 'HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler';

function response(title: string): SearchResponse {
  return {
    searchModuleResponses: [
      { moduleKey: RECIPES, totalCount: 1, items: [{ identifier: '1', title, description: null }] },
    ],
  };
}

function withSearch(search: (query: string) => Promise<SearchResponse | undefined>) {
  const spy = vi.fn(search);
  mockBackend({ search: spy });
  const scope = effectScope();
  const state = scope.run(() => useGlobalSearch())!;
  return { spy, state, scope };
}

describe('groupSearchResults', () => {
  it('drops hits without title and groups without hits', () => {
    const groups = groupSearchResults({
      searchModuleResponses: [
        {
          moduleKey: RECIPES,
          totalCount: 1,
          items: [
            { identifier: 'a', title: 'Pancakes', description: 'Sweet' },
            { identifier: 'b', title: '  ' },
          ],
        },
        { moduleKey: 'Empty.Handler', totalCount: 3, items: [{ identifier: 'c', title: '' }] },
      ],
    });

    expect(groups).toEqual([
      {
        moduleKey: RECIPES,
        totalCount: 1,
        items: [{ identifier: 'a', title: 'Pancakes', description: 'Sweet' }],
      },
    ]);
  });

  it('never counts fewer hits than it shows', () => {
    const [group] = groupSearchResults({
      searchModuleResponses: [
        {
          moduleKey: RECIPES,
          totalCount: 0,
          items: [
            { identifier: 'a', title: 'A' },
            { identifier: 'b', title: 'B' },
          ],
        },
      ],
    });

    expect(group?.totalCount).toBe(2);
  });

  it('handles an empty answer', () => {
    expect(groupSearchResults(undefined)).toEqual([]);
  });
});

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('searches once the user stopped typing', async () => {
    const { spy, state } = withSearch(async (query) => response(query));

    state.setQuery('pan');
    state.setQuery('panc');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS - 1);
    expect(spy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    expect(spy).toHaveBeenCalledExactlyOnceWith('panc');
    expect(state.groups.value[0]?.items[0]?.title).toBe('panc');
    expect(state.searching.value).toBe(false);
  });

  it('trims the query and ignores blank input', async () => {
    const { spy, state } = withSearch(async (query) => response(query));

    state.setQuery('   ');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(spy).not.toHaveBeenCalled();

    state.setQuery('  tea ');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(spy).toHaveBeenCalledWith('tea');
  });

  it('shows only the answer to the latest query', async () => {
    let answerFirst: (value: SearchResponse) => void = () => undefined;
    const { state } = withSearch((query) =>
      query === 'first'
        ? new Promise<SearchResponse>((resolve) => {
            answerFirst = resolve;
          })
        : Promise.resolve(response(query)),
    );

    state.setQuery('first');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(state.searching.value).toBe(true);

    state.setQuery('second');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    answerFirst(response('first'));
    await vi.advanceTimersByTimeAsync(0);

    expect(state.groups.value[0]?.items[0]?.title).toBe('second');
  });

  it('shows no results when the search fails', async () => {
    const { state } = withSearch(() => Promise.reject(new Error('offline')));

    state.setQuery('tea');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);

    expect(state.groups.value).toEqual([]);
    expect(state.searching.value).toBe(false);
  });

  it('drops results and pending searches on reset and with its scope', async () => {
    const { spy, state, scope } = withSearch(async (query) => response(query));

    state.setQuery('tea');
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    state.reset();
    expect(state.groups.value).toEqual([]);

    state.setQuery('coffee');
    scope.stop();
    await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('formatSearchHandlerName', () => {
  it.each([
    ['HomeBook.Backend.Module.Finances.Module.SavingGoalSearchHandler', 'Saving Goal'],
    ['Some.RecipeHandler', 'Recipe'],
    ['HTMLParserSearchHandler', 'HTML Parser'],
    ['', ''],
  ])('%s -> %s', (key, expected) => {
    expect(formatSearchHandlerName(key)).toBe(expected);
  });
});
