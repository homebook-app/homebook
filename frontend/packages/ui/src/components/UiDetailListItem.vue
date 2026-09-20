<script setup lang="ts">
import type { IconSize } from '../composables/useIconSprite';
import type { TintableIconSet } from '../icons/iconSets';
import UiIcon from './UiIcon.vue';

interface Props {
  /** Name of the icon, the file name inside the set. Without it the row starts at the title. */
  icon?: string;
  iconSet?: TintableIconSet;
  iconSize?: IconSize;
}

withDefaults(defineProps<Props>(), { icon: undefined, iconSet: 'windows11-filled', iconSize: 'medium' });
</script>

<template>
  <div class="ui-detail-list-item">
    <div v-if="icon" class="ui-detail-list-item-icon">
      <UiIcon :set="iconSet" :name="icon" :size="iconSize" />
    </div>

    <div class="ui-detail-list-item-content">
      <div class="ui-detail-list-item-title">
        <slot name="title" />
      </div>

      <div class="ui-detail-list-item-caption ui-text-caption">
        <slot name="caption" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// The Blazor partial was an empty skeleton, the look came from `mud-list-item`,
// `mud-list-item-gutters` and `gap-5`. Those values are now tokens.
.ui-detail-list-item {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: var(--hb-ui-detail-list-item-padding);
  text-align: start;
  gap: var(--hb-ui-detail-list-item-gap);
}

.ui-detail-list-item-content {
  min-width: 0;
}
</style>
