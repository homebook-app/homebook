<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="hb-boot-screen" role="status" aria-live="polite">
    <ProgressSpinner class="hb-boot-screen__spinner" stroke-width="4" />
    <span class="ui-text-caption">{{ t('boot.loading') }}</span>
  </div>
</template>

<style scoped lang="scss">
.hb-boot-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--hb-space-4);
  min-height: 100vh;
  color: var(--hb-text-secondary);
}

.hb-boot-screen__spinner {
  width: var(--hb-icon-size-lg);
  height: var(--hb-icon-size-lg);
}
</style>
