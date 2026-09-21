<script setup lang="ts">
import OverlayHosts from './OverlayHosts.vue';
</script>

<template>
  <main class="hb-content-only">
    <slot />
  </main>
  <OverlayHosts />
</template>
