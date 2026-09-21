<script setup lang="ts">
import { useContextMenu } from '@homebook/module-sdk';
import { useI18n } from 'vue-i18n';

// Empty shell until step 09 ports the meal plan
const { t } = useI18n();

useContextMenu(() => [
  {
    title: t('kitchen.startMenuItem.recipes.title'),
    url: '/Kitchen/Recipes',
    icon: { set: 'windows11-outline', name: 'CookBook' },
  },
]);
</script>

<template>
  <main class="hb-placeholder-page" />
</template>
