<script setup lang="ts">
import { UiWidgetContainer, UiWidgetList, type UiWidgetSize } from '@homebook/ui';

const sizes: UiWidgetSize[] = ['2x1', '2x2', '4x2', '4x4', '8x4'];
</script>

<template>
  <UiWidgetList>
    <!-- Size names are identifiers, not copy -->
    <UiWidgetContainer v-for="size in sizes" :key="size" :size="size">
      <div class="hb-proof-widgets__body">{{ size }}</div>
    </UiWidgetContainer>
  </UiWidgetList>
</template>

<style scoped lang="scss">
.hb-proof-widgets__body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
