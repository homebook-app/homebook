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
const { error, fail, complete } = useSetupStep('setupProcess');

/** The countdown before the start runs, as in the Blazor wizard. */
const preparing = shallowRef(true);

const { phase, run } = useRestartingProcess({
  start: () => useBackend().api.setup.start.post(setup.startRequest),
  // The instance is set up (204) or, with an older version on disk, wants an update (201)
  accept: [201, 204],
  errorKey: (status) => {
    switch (status) {
      case 400:
        return 'setup.process.processingValidationError.message';
      case 422:
        return 'setup.process.processingLicenseError.message';
      default:
        return 'setup.process.processingUnknownError.message';
    }
  },
  restartErrorKey: 'setup.process.processingServerRestartError.message',
  onFailed: (key) => fail(key),
  onFinished: () => complete(),
});

const title = computed(() => t(phase.value === 'finished' ? 'setup.processFinished.title' : 'setup.process.title'));

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
    :retry-label="t('setup.process.retry.button.text')"
    @retry="start"
  >
    <UiCountdownAlert v-if="preparing" severity="info" :duration="setupTiming.countdownMs" @finished="start">
      {{ t('setup.process.setupIsPrepared.message') }}
    </UiCountdownAlert>

    <Message v-if="phase === 'running'" severity="secondary" :closable="false">
      {{ t('setup.process.restartHint.message') }}
    </Message>

    <div v-if="phase === 'finished'" class="hb-setup-process__finished">
      <p class="hb-setup-process__text">{{ t('setup.process.finished.success.message') }}</p>
      <p class="hb-setup-process__text">{{ t('setup.process.finished.removeEnvironmentVariables.message') }}</p>
      <UiCountdownAlert severity="success" :duration="setupTiming.countdownMs * 2" @finished="setup.finish()">
        {{ t('setup.process.finished.redirect.message') }}
      </UiCountdownAlert>
      <Button
        size="large"
        :label="t('setup.process.finished.startHomeBook.message')"
        :disabled="setup.finished"
        @click="setup.finish()"
      />
    </div>
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-process__finished {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--hb-space-4);

  > :deep(.ui-countdown-alert) {
    align-self: stretch;
  }
}

.hb-setup-process__text {
  margin: 0;
}
</style>
