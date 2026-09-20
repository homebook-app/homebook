<script setup lang="ts">
type WaveBackgroundVariant = 'gradient' | 'image' | 'image-light';

interface Props {
  /** What lies behind the waves: the animated gradient or one of the two images of the app's `public/img/bg`. */
  variant?: WaveBackgroundVariant;
}

// The Blazor component was fixed to the dark image
withDefaults(defineProps<Props>(), { variant: 'image' });
</script>

<template>
  <div class="ui-wavebackground-container" :class="`ui-wavebackground-container--${variant}`" aria-hidden="true">
    <div class="ui-wavebackground-wave"></div>
    <div class="ui-wavebackground-wave"></div>
    <div class="ui-wavebackground-wave"></div>
  </div>
</template>

<style scoped lang="scss">
// Ported one to one from `_ui-wave-background.scss`, the values are part of the look
$gradient-background: linear-gradient(
  315deg,
  rgba(24, 19, 89, 1) 2%,
  rgba(1, 55, 125, 1) 25%,
  rgba(50, 150, 200, 1) 45%,
  rgba(164, 236, 248, 1) 70%,
  rgba(66, 111, 160, 1) 98%
);
$gradient-duration: 150s;
$wave-height: 30em;
$wave-width: 400%;
$wave1-duration: 30s;
$wave2-duration: 54s;
$wave3-duration: 60s;

.ui-wavebackground-container {
  width: 100vw;
  height: 100vh;

  &--gradient {
    background: $gradient-background;
    animation: gradient $gradient-duration ease infinite;
    background-size: 400% 400%;
    background-attachment: fixed;
  }

  &--image {
    background: url('/img/bg/wp12118355.webp') no-repeat center center fixed;
    background-size: cover;
  }

  &--image-light {
    background: url('/img/bg/wp12118355-light.webp') no-repeat center center fixed;
    background-size: cover;
  }
}

.ui-wavebackground-wave {
  background: rgb(255 255 255 / 25%);
  border-radius: 1000% 1000% 0 0;
  position: fixed;
  width: $wave-width;
  height: $wave-height;
  animation: wave $wave1-duration -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
  z-index: -100;

  &:nth-of-type(2) {
    bottom: -1.25em;
    animation: wave $wave2-duration linear reverse infinite;
    opacity: 0.8;
  }

  &:nth-of-type(3) {
    bottom: -2.5em;
    animation: wave $wave3-duration -1s reverse infinite;
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-wavebackground-container--gradient,
  .ui-wavebackground-wave {
    animation: none;
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

// The original wrote `translateX(1)` at 2% and 100%. Without a unit that is invalid and was
// dropped, so the animation started and ended at the untransformed wave: the `0` spelled out here.
@keyframes wave {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-25%);
  }

  50% {
    transform: translateX(-50%);
  }

  75% {
    transform: translateX(-25%);
  }
}
</style>
