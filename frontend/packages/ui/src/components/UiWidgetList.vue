<script setup lang="ts">
// No props. The `CanvasCssClass` parameter of the Blazor original was never rendered anywhere,
// so it is not ported. The class is global, it comes from styles/_widgets.scss.
</script>

<template>
  <div class="ui-widget-list">
    <slot />
  </div>
</template>
