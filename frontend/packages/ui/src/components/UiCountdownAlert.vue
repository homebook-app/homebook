<script setup lang="ts">
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import { computed } from 'vue';

import { useCountdown, type UiCountdownEasing } from '../composables/useCountdown';

/** The former MudBlazor `Severity`. `secondary` is what `Severity.Normal` looked like. */
export type UiCountdownSeverity = 'secondary' | 'info' | 'success' | 'warn' | 'error';

interface Props {
  severity?: UiCountdownSeverity;
  /** Running time in milliseconds. */
  duration?: number;
  /** Color of the countdown bar, any CSS color. */
  color?: string;
  easing?: UiCountdownEasing;
  /** Takes precedence over `easing`. Gets and returns a value between 0 and 1. */
  easingFn?: (t: number) => number;
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'secondary',
  duration: 5000,
  color: 'var(--hb-color-primary)',
  easing: 'easeOutSine',
  easingFn: undefined,
});

const emit = defineEmits<{
  finished: [];
}>();

// Read once: a running countdown that changes its duration has no meaning. Remount with a new
// `key` to run it again.
const { progress } = useCountdown({
  duration: props.duration,
  easing: props.easing,
  easingFn: props.easingFn,
  onFinished: () => emit('finished'),
});

const style = computed(() => ({ '--ui-element-accent-color': props.color }));
</script>

<template>
  <div class="ui-countdown-alert" :style="style">
    <Message :severity="severity" :closable="false">
      <slot />
    </Message>

    <ProgressBar :value="progress" :show-value="false" />
  </div>
</template>

<style scoped lang="scss">
.ui-countdown-alert {
  position: relative;
  overflow: hidden;
  border-radius: var(--hb-border-radius-default);

  // Inherited, so it reaches the filled part of the bar without a specificity fight
  --p-progressbar-value-background: var(--ui-element-accent-color);
  --p-progressbar-height: var(--hb-progress-size-sm);
  --p-progressbar-border-radius: 0;
}

.ui-countdown-alert :deep(.p-progressbar) {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

// PrimeVue eases the width over a second. A countdown must not lag behind itself, and the
// easing is already applied to the value. A scoped block is unlayered and wins over
// `@layer primevue` on its own, so no `!important` is needed.
.ui-countdown-alert :deep(.p-progressbar-value) {
  transition: none;
}
</style>
