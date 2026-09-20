<script setup lang="ts">
import { computed } from 'vue';

import { useIconSprite, type IconSize } from '../composables/useIconSprite';
import type { TintableIconSet } from '../icons/iconSets';

interface Props {
  /** Single-color sets only, icons with own colors are rendered by `UiPictogram`. */
  set: TintableIconSet;
  /** Name of the icon, the file name inside the set. */
  name: string;
  size?: IconSize;
  /** Any CSS color. Without it the icon takes the text color of its surroundings. */
  color?: string;
}

const props = withDefaults(defineProps<Props>(), { size: 'medium', color: undefined });

const { href, missing, length } = useIconSprite({
  set: () => props.set,
  name: () => props.name,
  size: () => props.size,
});

const style = computed(() => ({ width: length.value, height: length.value, color: props.color }));
</script>

<template>
  <!-- Decorative by default. A caller that needs a label passes `role="img"` and `aria-label`. -->
  <svg v-if="!missing" class="ui-icon" :style="style" aria-hidden="true" focusable="false">
    <use v-if="href" :href="href" />
  </svg>
</template>

<style scoped lang="scss">
.ui-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
