<script setup lang="ts">
import Card from 'primevue/card';
import { computed } from 'vue';

/** Footprint on the widget grid, columns by rows. */
export type UiWidgetSize = '2x1' | '2x2' | '4x2' | '4x4' | '8x4';

interface Props {
  size?: UiWidgetSize;
}

const props = withDefaults(defineProps<Props>(), { size: '2x2' });

// The classes are global, they come from styles/_widgets.scss with the rest of the grid
const SIZE_CLASSES: Readonly<Record<UiWidgetSize, string>> = Object.freeze({
  '2x1': 'w-2 h-1',
  '2x2': 'w-2 h-2',
  '4x2': 'w-4 h-2',
  '4x4': 'w-4 h-4',
  '8x4': 'w-8 h-4',
});

const sizeClass = computed(() => SIZE_CLASSES[props.size]);
</script>

<template>
  <!-- The original mapped the size in a property setter, which only ran on a change - a widget
       left at the default size ended up with no size class at all. A computed has no such gap. -->
  <Card class="ui-widget" :class="sizeClass">
    <template #content>
      <slot />
    </template>
  </Card>
</template>
