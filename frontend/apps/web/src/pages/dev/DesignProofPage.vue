<script setup lang="ts">
import { iconSets } from '@homebook/ui';
import { useI18n } from 'vue-i18n';

import ProofFrosted from './ProofFrosted.vue';
import ProofIconSet from './ProofIconSet.vue';
import ProofPalette from './ProofPalette.vue';

// Development only. The visual check against /Settings/Developer/Colors and
// /Settings/Developer/Icons of the Blazor frontend, step 08 turns the sections into those pages.
const { t } = useI18n();

const wallpaper = { backgroundImage: "url('/img/bg/wp12118355.webp')" };
</script>

<template>
  <main class="hb-design-proof">
    <div class="ui-wallpaper" :style="wallpaper"></div>

    <div class="hb-design-proof__sheet frosted-b8">
      <ProofPalette />
    </div>

    <ProofFrosted class="hb-design-proof__bare" />

    <section class="hb-design-proof__sheet frosted-b8">
      <h2>{{ t('settings.developer.icons.title') }}</h2>
      <ProofIconSet v-for="set in iconSets" :key="set" :set="set" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.hb-design-proof {
  display: flex;
  flex-direction: column;
  gap: var(--cell-gap);
  padding: var(--cell-gap);
}

.hb-design-proof__sheet {
  padding: var(--cell-gap);
  border-radius: var(--hb-border-radius-default);
}

// Directly on the wallpaper, the frosted steps need something to blur
.hb-design-proof__bare {
  color: var(--hb-color-primary-contrast);
}
</style>
