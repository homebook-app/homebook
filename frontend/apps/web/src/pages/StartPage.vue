<script setup lang="ts">
import { UiStartMenuItem, usePageTitle } from '@homebook/ui';
import { useI18n } from 'vue-i18n';

import { useModuleRegistry } from '@/modules';

// The tiles of the registered modules. Step 08 completes the start page, step 10 adds widgets.
const { t } = useI18n();
const registry = useModuleRegistry();

usePageTitle(() => t('home.pageTitle'));
</script>

<template>
  <section class="hb-start-page">
    <UiStartMenuItem
      v-for="item in registry.startMenuItems"
      :key="item.url"
      :title="t(item.titleKey)"
      :caption="t(item.captionKey)"
      :url="item.url"
      :icon="item.icon"
      :icon-set="item.iconSet"
      :color="item.color"
    />
  </section>
</template>

<style scoped lang="scss">
.hb-start-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--hb-space-4);
  padding: var(--hb-space-4);

  @include media-up(sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include media-up(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include media-up(lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
