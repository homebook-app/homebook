<script setup lang="ts">
import { UiCountdownAlert, UiLicenseDialog, type UiLicense } from '@homebook/ui';
import Button from 'primevue/button';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const licensesVisible = ref(false);
// The countdown reads its options once, so restarting it means mounting it again
const countdownRun = ref(0);
const countdownFinished = ref(0);

// Fixtures. `__` stands for a space in the real license file names.
const licenses: UiLicense[] = [
  { name: 'System__Text__Json', htmlContent: '<pre>MIT License\n\nCopyright (c) .NET Foundation</pre>' },
  { name: 'Vue', htmlContent: '<pre>MIT License\n\nCopyright (c) 2013-present, Yuxi (Evan) You</pre>' },
];
</script>

<template>
  <section class="hb-proof-feedback">
    <div class="hb-proof-feedback__countdown">
      <UiCountdownAlert
        :key="countdownRun"
        severity="info"
        :duration="8000"
        color="var(--hb-color-amber)"
        @finished="countdownFinished += 1"
      >
        {{ t('settings.developer.components.countdownBody') }}
      </UiCountdownAlert>

      <Button
        severity="secondary"
        :label="t('settings.developer.components.restartCountdown')"
        :badge="countdownFinished > 0 ? String(countdownFinished) : undefined"
        @click="countdownRun += 1"
      />
    </div>

    <Button :label="t('settings.developer.components.showLicenses')" @click="licensesVisible = true" />

    <UiLicenseDialog v-model:visible="licensesVisible" :licenses="licenses" />
  </section>
</template>

<style scoped lang="scss">
.hb-proof-feedback__countdown {
  display: flex;
  align-items: center;
  gap: var(--cell-gap);
  max-width: calc(var(--cell-size) * 8);
  margin-bottom: var(--cell-gap);
}

.hb-proof-feedback__countdown > :first-child {
  flex: 1 1 auto;
}
</style>
