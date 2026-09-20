<script setup lang="ts">
import { UiStartMenuItem } from '@homebook/ui';

// Fixtures. The real tiles come from the module registry in step 10; their titles and captions
// are resolved there, the component only displays what it is given.
const tiles = [
  { title: 'Kitchen', caption: 'Recipes and the weekly plan', url: '/Kitchen', icon: 'CookBook', color: 'emerald' },
  { title: 'Finances', caption: 'Savings goals and budget', url: '/Finances', icon: 'ChartCircle', color: 'cerulean' },
  { title: 'Settings', caption: 'Instance, users and modules', url: '/Settings', icon: 'Gear2', color: 'lavender' },
] as const;
</script>

<template>
  <section class="hb-proof-startmenu">
    <UiStartMenuItem
      v-for="tile in tiles"
      :key="tile.url"
      class="hb-proof-startmenu__tile"
      :title="tile.title"
      :caption="tile.caption"
      :url="tile.url"
      :icon="tile.icon"
      :color="`var(--hb-color-${tile.color})`"
    />
  </section>
</template>

<style scoped lang="scss">
.hb-proof-startmenu {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cell-gap);
}

.hb-proof-startmenu__tile {
  width: calc(var(--cell-size) * 3);
}
</style>
