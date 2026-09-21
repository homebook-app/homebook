<script setup lang="ts">
import { isBackendApiError, isConflict } from '@homebook/api-client';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useBackend } from '@/api/backend';
import { useSetupStep } from '@/composables/useSetupStep';
import { RouteNames } from '@/router/routes';
import { setupTiming } from '@/setup/timing';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useSetupStore } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

const { t } = useI18n();
const router = useRouter();
const bootstrap = useBootstrapStore();
const setup = useSetupStore();
const { busy, error, success, run, fail, succeed, finish } = useSetupStep('backendConnection');

const SETUP_IN_PROGRESS = 'setup.backendConnection.check.setupInProgressError.message';

class NoVersionError extends Error {}

async function check(): Promise<void> {
  try {
    const availability = await run(async () => {
      const version = await useBackend().api.version.get();
      if (!version) {
        throw new NoVersionError();
      }
      return useBackend().getSetupAvailability();
    }, setupTiming.minCheckDurationMs);

    switch (availability) {
      case 200:
        setup.setBranch('install');
        succeed('setup.backendConnection.serverFound.text');
        break;
      case 201:
        setup.setBranch('update');
        succeed('setup.backendConnection.serverFound.text');
        break;
      case 204:
        // Already set up, the start page is the place to be
        await bootstrap.retry();
        await router.replace({ name: RouteNames.home });
        break;
      case 409:
        fail(SETUP_IN_PROGRESS);
        break;
    }
  } catch (failure) {
    if (failure instanceof NoVersionError) {
      fail('setup.backendConnection.check.versionError.message');
    } else if (!isBackendApiError(failure)) {
      fail('setup.backendConnectionFailed.message');
    } else if (isConflict(failure)) {
      fail(SETUP_IN_PROGRESS);
    } else {
      fail('setup.backendConnection.check.unknownError.message');
    }
  }
}

onMounted(check);
</script>

<template>
  <HbSetupStepCard
    :title="t('setup.backendConnection.title')"
    :busy="busy"
    :error="error"
    :success="success"
    :retry-label="t('setup.backendConnection.retry.button.text')"
    @finished="finish"
    @retry="check"
  />
</template>
