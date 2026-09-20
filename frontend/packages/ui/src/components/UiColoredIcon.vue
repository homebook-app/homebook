<script setup lang="ts">
import { computed } from 'vue';

import type { TintableIconSet } from '../icons/iconSets';
import UiIcon from './UiIcon.vue';

interface Props {
  set: TintableIconSet;
  name: string;
  /** Any CSS color. It draws the icon and, mostly transparent, tints the frame around it. */
  color: string;
}

const props = defineProps<Props>();

const style = computed(() => ({ '--ui-colored-icon-color': props.color }));
</script>

<template>
  <div class="ui-colored-icon-container" :style="style">
    <div class="ui-colored-icon-frame">
      <UiIcon class="ui-colored-icon" :set="set" :name="name" size="var(--hb-ui-colored-icon-size)" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-colored-icon-container {
  display: inline-block;
}

.ui-colored-icon-frame {
  display: flex;
  justify-content: center;
  padding: var(--hb-ui-colored-icon-padding);
  // The token is the share of transparency, 75 percent leave a quarter of the color
  background-color: color-mix(
    in srgb,
    var(--ui-colored-icon-color),
    transparent var(--hb-ui-colored-icon-background-opacity)
  );
  border-radius: var(--hb-ui-colored-icon-borderradius);
}

.ui-colored-icon {
  color: var(--ui-colored-icon-color);
}
</style>
