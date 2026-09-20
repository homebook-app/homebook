<script setup lang="ts">
import { useSlots } from 'vue';

import type { TintableIconSet } from '../icons/iconSets';
import UiIcon from './UiIcon.vue';

interface Props {
  title: string;
  caption?: string;
  /** Name of the icon, the file name inside the set. Without it the row starts at the title. */
  icon?: string;
  iconSet?: TintableIconSet;
  /**
   * Any CSS color. The original had a MudBlazor color enum beside a hex string; every call site
   * passed the hex one, and always as a token such as `var(--hb-settings-color-instance-name)`.
   */
  iconColor?: string;
}

withDefaults(defineProps<Props>(), {
  caption: undefined,
  icon: undefined,
  iconSet: 'windows11-filled',
  iconColor: undefined,
});

const slots = useSlots();
</script>

<template>
  <div class="ui-settings-item">
    <div class="ui-settings-item-header">
      <div v-if="icon" class="ui-settings-item-icon">
        <UiIcon :set="iconSet" :name="icon" :color="iconColor" />
      </div>

      <div class="ui-settings-item-text">
        <div class="ui-settings-item-title ui-text-title">{{ title }}</div>
        <div v-if="caption" class="ui-settings-item-caption ui-text-caption">{{ caption }}</div>
      </div>
    </div>

    <div v-if="slots.default" class="ui-settings-item-control">
      <div class="ui-settings-item-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Stacked on a phone, icon and text on the left with the control on the right from md up.
.ui-settings-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: var(--hb-space-3);

  @include media-up(md) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.ui-settings-item-header {
  display: flex;
  align-items: flex-start;
  width: 100%;

  @include media-up(md) {
    flex: 1 1 auto;
  }
}

.ui-settings-item-icon {
  display: flex;
  justify-content: center;
  margin-inline-end: var(--hb-space-4);
  padding-block-start: var(--hb-space-1);
}

.ui-settings-item-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
  min-width: 0;
}

.ui-settings-item-control {
  display: flex;
  width: 100%;
  margin-block-start: var(--hb-space-3);

  @include media-up(md) {
    flex: 0 0 auto;
    width: auto;
    justify-content: flex-end;
    margin-block-start: 0;
  }
}

.ui-settings-item-content {
  display: flex;
  justify-content: flex-end;
  width: 100%;

  @include media-up(md) {
    width: var(--hb-ui-settings-item-content-width);
  }
}
</style>
