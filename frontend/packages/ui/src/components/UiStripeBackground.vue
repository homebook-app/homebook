<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue';

import { stripeSchemes, type StripeScheme } from '../backgrounds/stripeGradient/colors';
import { createStripeGradient, type StripeGradient } from '../backgrounds/stripeGradient/gradient';

interface Props {
  /** The build mode of the instance picks the colors: Noctara, Nerion or Frosted. */
  scheme?: StripeScheme;
}

const props = withDefaults(defineProps<Props>(), { scheme: 'release' });

const container = useTemplateRef<HTMLDivElement>('container');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');

// What shows through until the first frame, and all there is without WebGL
const fallback = computed(() => ({
  background: `linear-gradient(160deg, ${stripeSchemes[props.scheme].join(', ')})`,
}));

let gradient: StripeGradient | null = null;
let observer: ResizeObserver | undefined;

onMounted(() => {
  if (container.value === null || canvas.value === null) return;

  const { width, height } = container.value.getBoundingClientRect();
  gradient = createStripeGradient(canvas.value, {
    // The colors are fixed for the lifetime of the component, the build mode does not change
    colors: stripeSchemes[props.scheme],
    width: width || window.innerWidth,
    height: height || window.innerHeight,
    still: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  });
  if (gradient === null) return;

  observer = new ResizeObserver(([entry]) => {
    if (entry !== undefined && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
      gradient?.resize(entry.contentRect.width, entry.contentRect.height);
    }
  });
  observer.observe(container.value);
});

onUnmounted(() => {
  observer?.disconnect();
  gradient?.dispose();
  gradient = null;
});
</script>

<template>
  <div
    ref="container"
    class="ui-stripe-background-container"
    :class="`build-mode-${scheme}`"
    :style="fallback"
    aria-hidden="true"
  >
    <canvas ref="canvas" class="ui-stripe-background-canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.ui-stripe-background-container {
  width: 100vw;
  height: 100vh;
}

.ui-stripe-background-canvas {
  display: block;
  width: inherit;
  height: inherit;
}
</style>
