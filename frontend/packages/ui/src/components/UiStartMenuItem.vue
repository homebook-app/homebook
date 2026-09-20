<script setup lang="ts">
import Button from 'primevue/button';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import type { TintableIconSet } from '../icons/iconSets';
import UiColoredIcon from './UiColoredIcon.vue';
import UiIcon from './UiIcon.vue';

interface Props {
  /**
   * Display text, not a translation key. The Blazor original looked the title up in the catalog
   * itself, which tied a presentational component to the catalog layout; the module registry
   * resolves the key now.
   */
  title: string;
  caption?: string;
  /** Target route of the tile. */
  url: string;
  icon: string;
  iconSet?: TintableIconSet;
  /** Accent color, any CSS color. It draws the icon, the background icon and the open label. */
  color: string;
}

const props = withDefaults(defineProps<Props>(), { caption: undefined, iconSet: 'windows11-filled' });

const { t } = useI18n();

const style = computed(() => ({ '--startmenu-item-color': props.color }));
</script>

<template>
  <Button :as="RouterLink" :to="url" variant="text" class="ui-startmenu-item-link" :style="style">
    <span class="ui-startmenu-container frosted-b7">
      <UiIcon
        class="ui-startmenu-item-background-icon"
        :set="iconSet"
        :name="icon"
        :color="color"
        size="var(--hb-startmenu-background-icon-size)"
      />

      <span class="ui-startmenu-item-content">
        <UiColoredIcon :set="iconSet" :name="icon" :color="color" />

        <span class="ui-startmenu-item-title ui-text-title">{{ title }}</span>
        <span v-if="caption" class="ui-startmenu-item-caption ui-text-caption">{{ caption }}</span>

        <span class="ui-startmenu-item-nav">
          {{ t('ui.startMenuItem.open') }}
          <UiIcon :set="iconSet" name="ArrowRight" />
        </span>
      </span>
    </span>
  </Button>
</template>

<style scoped lang="scss">
.ui-startmenu-item-link {
  display: block;
  width: 100%;
  background: var(--hb-startmenu-container-background);

  // The tile brings its own padding and fills the button edge to edge, as `pa-0` did on MudButton
  --p-button-text-primary-color: inherit;
  --p-button-padding-x: 0;
  --p-button-padding-y: 0;
}

.ui-startmenu-container {
  display: block;
  width: 100%;
  height: 100%;
  padding: var(--hb-space-6) var(--hb-space-3) var(--hb-space-3);
  overflow: hidden;
}

// The original put this behind the container with `z-index: -1`. That worked because MudPaper
// had no stacking context; `frosted-base` sets `position: relative`, so a negative index would
// hide the icon behind the frosted background. The content is lifted instead.
.ui-startmenu-item-background-icon {
  position: absolute;
  top: var(--hb-startmenu-background-icon-offset);
  left: var(--hb-startmenu-background-icon-offset);
  opacity: var(--hb-startmenu-background-icon-opacity);
}

.ui-startmenu-item-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ui-startmenu-item-title {
  display: flex;
  justify-content: center;
  margin-block-start: var(--hb-space-5);
  text-align: center;
}

.ui-startmenu-item-caption {
  display: flex;
  justify-content: center;
  margin-block: var(--hb-space-1) var(--hb-space-5);
  text-align: center;
}

.ui-startmenu-item-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--hb-space-2);
  // Pins the row to the bottom of the tile whatever the caption does above it
  margin-block-start: auto;
  color: var(--startmenu-item-color);
}
</style>
