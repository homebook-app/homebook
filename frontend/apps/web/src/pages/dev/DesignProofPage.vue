<script setup lang="ts">
import { iconSets, UiPageTitle } from '@homebook/ui';
import { useI18n } from 'vue-i18n';

import ProofCards from './ProofCards.vue';
import ProofControls from './ProofControls.vue';
import ProofFeedback from './ProofFeedback.vue';
import ProofFrosted from './ProofFrosted.vue';
import ProofIconSet from './ProofIconSet.vue';
import ProofPalette from './ProofPalette.vue';
import ProofStartMenu from './ProofStartMenu.vue';
import ProofWidgets from './ProofWidgets.vue';

// Development only. The visual check against /Settings/Developer/Colors and
// /Settings/Developer/Icons of the Blazor frontend, step 08 turns the sections into those pages.
const { t } = useI18n();

const wallpaper = { backgroundImage: "url('/img/bg/wp12118355.webp')" };
</script>

<template>
  <main class="hb-design-proof">
    <UiPageTitle :title="t('settings.developer.components.title')" />

    <div class="ui-wallpaper" :style="wallpaper"></div>

    <div class="hb-design-proof__sheet frosted-b8">
      <ProofPalette />
    </div>

    <ProofFrosted class="hb-design-proof__bare" />

    <section class="hb-design-proof__sheet frosted-b8">
      <h2>{{ t('settings.developer.icons.title') }}</h2>
      <ProofIconSet v-for="set in iconSets" :key="set" :set="set" />
    </section>

    <section class="hb-design-proof__sheet frosted-b8">
      <h2>{{ t('settings.developer.components.title') }}</h2>
      <ProofCards />
      <ProofControls />
      <ProofFeedback />
      <ProofWidgets />
    </section>

    <!-- On the bare wallpaper, the frosted tiles need something to blur -->
    <ProofStartMenu class="hb-design-proof__bare" />
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
