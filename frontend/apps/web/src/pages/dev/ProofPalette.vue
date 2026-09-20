<script setup lang="ts">
import { brandColorNames, paletteColorNames } from '@homebook/ui';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const groups = [
  { key: 'brand', titleKey: 'settings.developer.colors.brandTitle', names: brandColorNames, prefix: 'ui-color-bg-' },
  {
    key: 'palette',
    titleKey: 'settings.developer.colors.paletteTitle',
    names: paletteColorNames,
    prefix: 'ui-color-bg-',
  },
  {
    key: 'gradient',
    titleKey: 'settings.developer.colors.gradientTitle',
    names: paletteColorNames,
    prefix: 'ui-color-bg-gradient-',
  },
] as const;
</script>

<template>
  <section class="hb-proof-palette">
    <h2>{{ t('settings.developer.colors.title') }}</h2>

    <template v-for="group in groups" :key="group.key">
      <h3>{{ t(group.titleKey) }}</h3>
      <div class="hb-proof-palette__tiles">
        <!-- Color names are identifiers, not copy -->
        <div v-for="name in group.names" :key="name" class="hb-proof-palette__tile" :class="group.prefix + name">
          {{ name }}
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.hb-proof-palette__tiles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hb-chrome-gap);
}

.hb-proof-palette__tile {
  display: flex;
  align-items: flex-end;
  width: calc(var(--cell-size) + var(--cell-gap));
  height: calc(var(--cell-size) + var(--cell-gap));
  padding: var(--hb-chrome-gap);
  box-sizing: border-box;
  border-radius: var(--hb-chrome-border-radius);
  font-size: var(--hb-font-size-caption);
  overflow-wrap: anywhere;
}
</style>
