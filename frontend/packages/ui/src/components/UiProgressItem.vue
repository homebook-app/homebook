<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
import { computed } from 'vue';

/** The former MudBlazor `Size` of `MudProgressLinear`. */
export type UiProgressSize = 'small' | 'medium' | 'large';

interface Props {
  headerTextStart?: string;
  headerTextEnd?: string;
  footerTextStart?: string;
  footerTextEnd?: string;
  /** Percentage, values outside 0 to 100 are clamped. */
  progressValue?: number;
  progressSize?: UiProgressSize;
  /** Color of the filled part, any CSS color. */
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  headerTextStart: undefined,
  headerTextEnd: undefined,
  footerTextStart: undefined,
  footerTextEnd: undefined,
  progressValue: 0,
  progressSize: 'medium',
  color: 'var(--hb-color-primary)',
});

const clamped = computed(() => Math.min(100, Math.max(0, props.progressValue)));

const style = computed(() => ({ '--ui-element-accent-color': props.color }));
</script>

<template>
  <div class="ui-progress-item" :class="`ui-progress-item--${progressSize}`" :style="style">
    <div class="ui-progress-item-header">
      <div class="ui-progress-item-header-start">
        <slot name="headerStart">
          <span class="ui-text-caption">{{ headerTextStart }}</span>
        </slot>
      </div>
      <div class="ui-progress-item-header-end">
        <slot name="headerEnd">
          <span class="ui-text-caption">{{ headerTextEnd }}</span>
        </slot>
      </div>
    </div>

    <div class="ui-progress-item-progress">
      <ProgressBar :value="clamped" :show-value="false" />
    </div>

    <div class="ui-progress-item-footer">
      <div class="ui-progress-item-footer-start">
        <slot name="footerStart">
          <span class="ui-text-caption">{{ footerTextStart }}</span>
        </slot>
      </div>
      <div class="ui-progress-item-footer-end">
        <slot name="footerEnd">
          <span class="ui-text-caption">{{ footerTextEnd }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-progress-item {
  display: flex;
  flex-direction: column;
  width: 100%;

  // A custom property declared here beats the `:root` declaration of the theme, so the accent
  // reaches the filled part without fighting PrimeVue over specificity.
  --p-progressbar-value-background: var(--ui-element-accent-color);
  // The original passed `Rounded="true"`
  --p-progressbar-border-radius: var(--hb-border-radius-default);
  --p-progressbar-height: var(--hb-progress-size-md);

  &--small {
    --p-progressbar-height: var(--hb-progress-size-sm);
  }

  &--large {
    --p-progressbar-height: var(--hb-progress-size-lg);
  }
}

.ui-progress-item-header,
.ui-progress-item-progress,
.ui-progress-item-footer {
  display: flex;
  width: 100%;
}

.ui-progress-item-header,
.ui-progress-item-footer {
  align-items: center;
}

.ui-progress-item-header-start,
.ui-progress-item-footer-start {
  flex: 1 1 auto;
  min-width: 0;
}

.ui-progress-item-header-end,
.ui-progress-item-footer-end {
  flex: 0 0 auto;
}
</style>
