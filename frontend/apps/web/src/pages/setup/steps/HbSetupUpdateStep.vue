<script setup lang="ts">
import { UiCountdownAlert } from '@homebook/ui';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackend } from '@/api/backend';
import { useRestartingProcess } from '@/composables/useRestartingProcess';
import { useSetupStep } from '@/composables/useSetupStep';
import { setupTiming } from '@/setup/timing';
import { useSetupStore } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

const { t } = useI18n();
const setup = useSetupStore();
const { error, fail, complete } = useSetupStep('updateProcess');

/** The countdown before the update runs, as in the Blazor wizard. */
const preparing = shallowRef(true);

const { phase, run } = useRestartingProcess({
  // Migrates, then the backend stops itself; with nothing to migrate it answers 200 and stays up
  start: () => useBackend().api.update.start.post(),
  accept: [204],
  errorKey: (status) =>
    status === 409
      ? 'update.process.processingSetupMissingError.message'
      : 'update.process.processingUnknownError.message',
  restartErrorKey: 'update.process.processingServerRestartError.message',
  onFailed: (key) => fail(key),
  onFinished: () => complete(),
});

const title = computed(() => t(phase.value === 'finished' ? 'update.processFinished.title' : 'update.process.title'));

function start(): void {
  preparing.value = false;
  void run();
}
</script>

<template>
  <HbSetupStepCard
    :title="title"
    :busy="phase === 'running'"
    :error="phase === 'failed' ? error : undefined"
    :retry-label="t('update.process.retry.button.text')"
    @retry="start"
  >
    <UiCountdownAlert v-if="preparing" severity="info" :duration="setupTiming.countdownMs" @finished="start">
      {{ t('update.process.updateIsPrepared.message') }}
    </UiCountdownAlert>

    <Message v-if="phase === 'running'" severity="secondary" :closable="false">
      {{ t('update.process.restartHint.message') }}
    </Message>

    <div v-if="phase === 'finished'" class="hb-setup-update__finished">
      <p class="hb-setup-update__text">{{ t('update.process.finished.success.message') }}</p>
      <UiCountdownAlert severity="success" :duration="setupTiming.countdownMs * 2" @finished="setup.finish()">
        {{ t('update.process.finished.redirect.message') }}
      </UiCountdownAlert>
      <Button
        size="large"
        :label="t('update.process.finished.startHomeBook.message')"
        :disabled="setup.finished"
        @click="setup.finish()"
      />
    </div>
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-update__finished {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--hb-space-4);

  > :deep(.ui-countdown-alert) {
    align-self: stretch;
  }
}

.hb-setup-update__text {
  margin: 0;
}
</style>
