<script setup lang="ts">
import { UiPageTitle } from '@homebook/ui';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <section class="hb-not-found">
    <UiPageTitle :title="t('notFound.title')" />
    <p role="alert">{{ t('notFound.text') }}</p>
    <Button as="router-link" to="/" :label="t('notFound.backHome')" />
  </section>
</template>

<style scoped lang="scss">
.hb-not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--hb-space-4);
  padding: var(--hb-space-4);
}
</style>
