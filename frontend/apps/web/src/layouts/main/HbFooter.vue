<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <footer class="hb-footer-appbar frosted-b6">
    <span class="ui-text-caption hb-footer__title">{{ t('appTitle') }}</span>
    <span class="ui-text-caption">{{ t('authorMadeWithText') }}</span>
    <a class="ui-text-caption hb-footer__link" :href="t('authorLink')" target="_blank" rel="noopener">
      {{ t('authorName') }}
    </a>
  </footer>
</template>

<style scoped lang="scss">
.hb-footer-appbar {
  gap: var(--hb-space-1);
}

.hb-footer__title {
  margin-right: var(--hb-space-5);
}

.hb-footer__link {
  color: var(--hb-color-primary);
}
</style>
