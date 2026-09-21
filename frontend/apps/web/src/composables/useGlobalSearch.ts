import type { SearchResponse } from '@homebook/api-client';
import type { SearchResultItem } from '@homebook/module-sdk';
import { onScopeDispose, readonly, shallowRef, type Ref } from 'vue';

import { useBackend } from '@/api/backend';

/** Delay between the last keystroke and the request, as in the Blazor frontend. */
export const SEARCH_DEBOUNCE_MS = 1000;

/** The hits of one backend search handler. */
export interface SearchGroup {
  /** Full name of the backend search handler, e.g. `HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler`. */
  moduleKey: string;
  totalCount: number;
  items: readonly SearchResultItem[];
}

/**
 * Turns the backend response into groups: hits without a title are dropped, groups without hits
 * too, and the count never falls below the number of hits shown.
 */
export function groupSearchResults(response: SearchResponse | undefined): SearchGroup[] {
  return (response?.searchModuleResponses ?? []).flatMap((module) => {
    const items = (module.items ?? [])
      .filter((item) => (item.title ?? '').trim() !== '')
      .map((item) => ({ identifier: item.identifier ?? '', title: item.title ?? '', description: item.description }));
    if (items.length === 0) {
      return [];
    }
    return [{ moduleKey: module.moduleKey ?? '', totalCount: Math.max(module.totalCount ?? 0, items.length), items }];
  });
}

export interface UseGlobalSearch {
  query: Readonly<Ref<string>>;
  groups: Readonly<Ref<readonly SearchGroup[]>>;
  searching: Readonly<Ref<boolean>>;
  /** Takes a new query and searches once the user stopped typing. */
  setQuery(value: string): void;
  /** Drops the results and any pending or running search. */
  reset(): void;
}

/**
 * The global search: debounced, and only the answer to the latest query is shown. A failing
 * search shows no results rather than an error, as in the Blazor frontend.
 */
export function useGlobalSearch(delay: number = SEARCH_DEBOUNCE_MS): UseGlobalSearch {
  const query = shallowRef('');
  const groups = shallowRef<readonly SearchGroup[]>([]);
  const searching = shallowRef(false);

  let sequence = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function reset(): void {
    sequence += 1;
    clearTimeout(timer);
    groups.value = [];
    searching.value = false;
  }

  async function run(current: number, text: string): Promise<void> {
    searching.value = true;
    try {
      const response = await useBackend().search(text);
      if (current === sequence) {
        groups.value = groupSearchResults(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (current === sequence) {
        searching.value = false;
      }
    }
  }

  function setQuery(value: string): void {
    query.value = value;
    reset();
    const text = value.trim();
    if (text === '') {
      return;
    }
    const current = sequence;
    timer = setTimeout(() => void run(current, text), delay);
  }

  onScopeDispose(reset);

  return { query: readonly(query), groups: readonly(groups), searching: readonly(searching), setQuery, reset };
}

/**
 * A readable name for a search handler the registry does not know:
 * `...Module.SavingGoalSearchHandler` becomes `Saving Goal`.
 */
export function formatSearchHandlerName(moduleKey: string): string {
  const last = moduleKey.split('.').filter(Boolean).at(-1) ?? '';
  const name = last.replace(/(Search)?Handler$/, '');
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
