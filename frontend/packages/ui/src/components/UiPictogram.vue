<script setup lang="ts">
import { computed } from 'vue';

import { useIconSprite, type IconSize } from '../composables/useIconSprite';
import type { MulticolorIconSet } from '../icons/iconSets';

interface Props {
  /** Sets with own colors and gradients. They are never recolored, hence no `color` prop. */
  set: MulticolorIconSet;
  /** Name of the icon, the file name inside the set. */
  name: string;
  size?: IconSize;
}

const props = withDefaults(defineProps<Props>(), { size: 'medium' });

const { href, missing, length } = useIconSprite({
  set: () => props.set,
  name: () => props.name,
  size: () => props.size,
});

const style = computed(() => ({ width: length.value, height: length.value }));
</script>

<template>
  <!-- Decorative by default. A caller that needs a label passes `role="img"` and `aria-label`. -->
  <svg v-if="!missing" class="ui-pictogram" :style="style" aria-hidden="true" focusable="false">
    <use v-if="href" :href="href" />
  </svg>
</template>

<style scoped lang="scss">
.ui-pictogram {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
