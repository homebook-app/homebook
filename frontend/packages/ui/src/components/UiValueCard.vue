<script setup lang="ts">
import { computed } from 'vue';

import type { TintableIconSet } from '../icons/iconSets';
import UiDetailCard from './UiDetailCard.vue';

interface Props {
  title: string;
  /** The figure, already formatted. The card does no number formatting of its own. */
  valueDisplay: string;
  /** Accent color, any CSS color. It tints the icon and the highlighted footer line. */
  color: string;
  icon: string;
  iconSet?: TintableIconSet;
  footerHighlightedText?: string;
  footerNotice?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconSet: 'windows11-filled',
  footerHighlightedText: undefined,
  footerNotice: undefined,
});

// The caption color of the original was `Colors.Gray.Darken2`, written into the inline style as a
// literal. Only the accent varies per instance, so only the accent stays inline.
const style = computed(() => ({ '--ui-value-card-accent-color': props.color }));
</script>

<template>
  <div class="ui-value-card" :style="style">
    <UiDetailCard :color="color" :icon="icon" :icon-set="iconSet">
      <template #header>
        <div class="ui-value-header">
          <div class="ui-value-card-title-text ui-text-caption">{{ title }}</div>
          <div class="ui-value-display-text ui-text-value">{{ valueDisplay }}</div>
        </div>
      </template>

      <template v-if="footerHighlightedText || footerNotice" #footer>
        <div class="ui-value-footer-text">
          <span v-if="footerHighlightedText" class="ui-value-footer-highlighted-text ui-text-caption">
            {{ footerHighlightedText }}
          </span>
          <span v-if="footerNotice" class="ui-value-footer-notice-text ui-text-caption">{{ footerNotice }}</span>
        </div>
      </template>
    </UiDetailCard>
  </div>
</template>

<style scoped lang="scss">
.ui-value-header,
.ui-value-footer-text {
  color: inherit;
}

.ui-value-card-title-text,
.ui-value-footer-notice-text {
  color: var(--hb-ui-value-card-caption-color);
}

.ui-value-footer-highlighted-text {
  color: var(--ui-value-card-accent-color);
}

.ui-value-footer-text {
  display: flex;
  gap: var(--hb-space-1);
}
</style>
