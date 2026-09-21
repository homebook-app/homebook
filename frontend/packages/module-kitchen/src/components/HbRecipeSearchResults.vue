<script setup lang="ts">
import { isGuid, useBackendClient, type SearchResultComponentProps } from '@homebook/module-sdk';
import { shallowRef, watch } from 'vue';
import { RouterLink } from 'vue-router';

import placeholderImage from '../assets/cooking-placeholder.svg';

const props = defineProps<SearchResultComponentProps>();

const client = useBackendClient();

/** Hero image per recipe id, resolved after the results are shown. */
const heroImages = shallowRef<ReadonlyMap<string, string>>(new Map());

async function loadHeroImage(recipeId: string): Promise<string | undefined> {
  try {
    const images = await client.api.modules.homebook.kitchen.recipes.byId(recipeId).images.get();
    const first = images?.imageMediaIds?.[0];
    return first ? await client.resolveMediaUrl(first) : undefined;
  } catch {
    // The placeholder stays
    return undefined;
  }
}

watch(
  () => props.items,
  async (items, _, onCleanup) => {
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });
    const ids = items.map((item) => item.identifier).filter(isGuid);
    const resolved = await Promise.all(ids.map(async (id) => [id, await loadHeroImage(id)] as const));
    if (!cancelled) {
      heroImages.value = new Map(
        resolved.filter((entry): entry is readonly [string, string] => entry[1] !== undefined),
      );
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="hb-recipe-search-results">
    <template v-for="item in items" :key="item.identifier">
      <RouterLink
        v-if="isGuid(item.identifier)"
        :to="`/Kitchen/Recipes/${item.identifier}/View`"
        class="hb-recipe-search-results__tile frosted-b1"
      >
        <img
          v-if="heroImages.get(item.identifier)"
          class="hb-recipe-search-results__image"
          :src="heroImages.get(item.identifier)"
          alt=""
        />
        <img
          v-else
          class="hb-recipe-search-results__image hb-recipe-search-results__image--placeholder"
          :src="placeholderImage"
          alt=""
        />
        <span class="hb-recipe-search-results__title">{{ item.title }}</span>
      </RouterLink>
    </template>
  </div>
</template>

<style scoped lang="scss">
.hb-recipe-search-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--hb-space-3);
  padding: 0 var(--hb-space-4) var(--hb-space-4);

  @include media-up(sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include media-up(md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @include media-up(lg) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.hb-recipe-search-results__tile {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--hb-border-radius-default);
  color: inherit;
  text-decoration: none;
  transition: box-shadow 1s ease;

  &:hover,
  &:focus-visible {
    box-shadow: var(--p-overlay-popover-shadow);
  }
}

.hb-recipe-search-results__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;

  &--placeholder {
    padding: var(--hb-space-5) var(--hb-space-4) 0;
    object-fit: contain;
  }
}

.hb-recipe-search-results__title {
  display: -webkit-box;
  overflow: hidden;
  padding: var(--hb-space-3) var(--hb-space-4);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
</style>
