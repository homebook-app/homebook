<script setup lang="ts">
import { usePageTitle } from '@homebook/ui';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

usePageTitle(() => t('home.pageTitle'));
</script>

<template>
  <section class="hb-start-page" />
</template>
