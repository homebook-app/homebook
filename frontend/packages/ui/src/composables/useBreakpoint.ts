import { onScopeDispose, readonly, shallowRef, type Ref } from 'vue';

import { breakpoints, type BreakpointName } from '../theme/breakpoints';

/**
 * Whether the viewport is at least as wide as the breakpoint, the script counterpart of the
 * `media-up()` mixin. Follows the viewport while the calling scope lives.
 */
export function useBreakpointUp(name: BreakpointName): Readonly<Ref<boolean>> {
  const query = typeof window === 'undefined' ? undefined : window.matchMedia(`(min-width: ${breakpoints[name]}px)`);
  const matches = shallowRef(query?.matches ?? true);

  if (query !== undefined) {
    const update = (event: MediaQueryListEvent) => {
      matches.value = event.matches;
    };
    query.addEventListener('change', update);
    onScopeDispose(() => query.removeEventListener('change', update));
  }

  return readonly(matches);
}
