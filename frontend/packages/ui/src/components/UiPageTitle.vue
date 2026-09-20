<script setup lang="ts">
import { APP_TITLE, usePageTitle } from '../composables/usePageTitle';

interface Props {
  /**
   * The page part of the document title. The Blazor original took a `RenderFragment`; reading
   * text back out of a Vue slot is unreliable, so this is a prop.
   */
  title?: string;
  appTitle?: string;
}

const props = withDefaults(defineProps<Props>(), { title: undefined, appTitle: APP_TITLE });

usePageTitle(
  () => props.title,
  () => props.appTitle,
);
</script>

<!-- This component is a side effect, not markup: it owns `document.title` for as long as it is
     mounted and renders nothing at all, which the rule below insists on. -->
<!-- eslint-disable vue/valid-template-root -->
<template>
  <!-- intentionally empty -->
</template>
