import type { TintableIconSet } from '@homebook/ui';
import { defineStore } from 'pinia';
import { onScopeDispose, readonly, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue';

/** An entry in the context section of the drawer. */
export interface MenuItem {
  /** Display text, already translated. */
  title: string;
  /** Target route. */
  url: string;
  icon?: { set: TintableIconSet; name: string };
}

/**
 * The context entries of the current page. The app clears them on every navigation, and the
 * page that is shown registers its own again.
 */
export const useMenuStore = defineStore('menu', () => {
  const items = shallowRef<readonly MenuItem[]>([]);

  /** Replaces the entries and returns the stored list, which identifies this registration. */
  function setItems(next: readonly MenuItem[]): readonly MenuItem[] {
    const stored = Object.freeze([...next]);
    items.value = stored;
    return stored;
  }

  /** Clears the entries, or only a specific registration when one is given. */
  function clear(registration?: readonly MenuItem[]): void {
    if (registration === undefined || items.value === registration) {
      items.value = [];
    }
  }

  return { items: readonly(items), setItems, clear };
});

/**
 * Registers context entries for the calling page. Reactive sources are tracked, so translated
 * titles follow a locale switch. The entries are removed when the page is left, unless the
 * next page has already registered its own.
 */
export function useContextMenu(items: MaybeRefOrGetter<readonly MenuItem[]>): void {
  const store = useMenuStore();
  let registration: readonly MenuItem[] | undefined;
  watch(
    () => toValue(items),
    (next) => {
      registration = store.setItems(next);
    },
    { immediate: true },
  );
  onScopeDispose(() => {
    if (registration) {
      store.clear(registration);
    }
  });
}
