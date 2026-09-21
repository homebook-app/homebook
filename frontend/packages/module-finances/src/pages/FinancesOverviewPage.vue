<script setup lang="ts">
import { useContextMenu } from '@homebook/module-sdk';
import { useI18n } from 'vue-i18n';

// Empty shell until step 10 ports the finances overview
const { t } = useI18n();

useContextMenu(() => [
  {
    title: t('finances.savings.title'),
    url: '/Finances/Savings/Overview',
    icon: { set: 'windows11-outline', name: 'MoneyBox' },
  },
]);
</script>

<template>
  <main class="hb-placeholder-page" />
</template>
