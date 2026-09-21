<script setup lang="ts">
import { useContextMenu } from '@homebook/module-sdk';
import { useI18n } from 'vue-i18n';

// Empty shell until step 09 ports the recipe overview
const { t } = useI18n();

useContextMenu(() => [
  {
    title: t('kitchen.startMenuItem.mealPlan.title'),
    url: '/Kitchen/MealPlan',
    icon: { set: 'windows11-outline', name: 'RestaurantMenu' },
  },
]);
</script>

<template>
  <main class="hb-placeholder-page" />
</template>
