<script setup lang="ts">
import { computed } from 'vue';

import type { Wallpaper } from '@/stores/wallpaper';

interface Props {
  wallpaper?: Wallpaper;
}

const props = withDefaults(defineProps<Props>(), { wallpaper: undefined });

const imageStyle = computed(() =>
  props.wallpaper === undefined || props.wallpaper.kind === 'dynamic'
    ? undefined
    : { backgroundImage: `url(${JSON.stringify(props.wallpaper.url)})` },
);
</script>

<template>
  <iframe
    v-if="wallpaper?.kind === 'dynamic'"
    class="ui-wallpaper hb-wallpaper--dynamic"
    :src="wallpaper.url"
    aria-hidden="true"
    tabindex="-1"
  />
  <div v-else-if="imageStyle" class="ui-wallpaper" :style="imageStyle" aria-hidden="true" />
</template>

<style scoped lang="scss">
.hb-wallpaper--dynamic {
  border: 0;
}
</style>
