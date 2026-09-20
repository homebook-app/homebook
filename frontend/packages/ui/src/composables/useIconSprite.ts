import { computed, inject, shallowRef, toValue, watch, type ComputedRef, type MaybeRefOrGetter } from 'vue';

import { getIconRegistry, iconRegistryKey } from '../icons/iconRegistry';
import { iconSymbolId } from '../icons/iconSets';

/** A named step, a number of pixels or any CSS length. */
export type IconSize = 'small' | 'medium' | 'large' | number | string;

export interface UseIconSpriteOptions {
  set: MaybeRefOrGetter<string>;
  name: MaybeRefOrGetter<string>;
  size?: MaybeRefOrGetter<IconSize | undefined>;
}

export interface UseIconSprite {
  /** `#id` of the symbol, `null` while the set loads or when the icon does not exist. */
  href: ComputedRef<string | null>;
  /** True once it is known that the icon cannot be rendered. */
  missing: ComputedRef<boolean>;
  /** CSS length for width and height. */
  length: ComputedRef<string>;
}

const NAMED_SIZES: Record<string, string> = {
  small: 'var(--hb-icon-size-sm)',
  medium: 'var(--hb-icon-size-md)',
  large: 'var(--hb-icon-size-lg)',
};

interface LoadedSet {
  set: string;
  /** `null` when the set could not be loaded. */
  names: ReadonlySet<string> | null;
}

/** Shared by `UiIcon` and `UiPictogram`: loads the sprite of a set on demand and resolves an icon in it. */
export function useIconSprite(options: UseIconSpriteOptions): UseIconSprite {
  const registry = inject(iconRegistryKey, () => getIconRegistry(), true);
  const loaded = shallowRef<LoadedSet | null>(null);

  watch(
    () => toValue(options.set),
    async (set, _previous, onCleanup) => {
      let outdated = false;
      onCleanup(() => {
        outdated = true;
      });

      let names: ReadonlySet<string> | null = null;
      try {
        names = await registry.load(set);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`[UiIcon] Icon set "${set}" could not be loaded.`, error);
        }
      }

      if (!outdated) {
        loaded.value = { set, names };
      }
    },
    { immediate: true },
  );

  const current = computed(() => (loaded.value?.set === toValue(options.set) ? loaded.value : null));

  const missing = computed(() => current.value !== null && current.value.names?.has(toValue(options.name)) !== true);

  const href = computed(() =>
    current.value === null || missing.value ? null : `#${iconSymbolId(current.value.set, toValue(options.name))}`,
  );

  // A set that failed to load has been reported above already
  const unknownIcon = computed(() =>
    missing.value && current.value?.names ? `"${toValue(options.name)}" in set "${current.value.set}"` : null,
  );

  watch(
    unknownIcon,
    (icon) => {
      if (icon !== null && import.meta.env.DEV) {
        console.warn(`[UiIcon] Unknown icon ${icon}.`);
      }
    },
    { immediate: true },
  );

  const length = computed(() => {
    const size = toValue(options.size) ?? 'medium';
    return typeof size === 'number' ? `${size}px` : (NAMED_SIZES[size] ?? size);
  });

  return { href, missing, length };
}
