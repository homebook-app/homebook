<script setup lang="ts">
import { isBackendApiError, statusCodeOf } from '@homebook/api-client';
import { UiIcon, UiLicenseDialog, type UiLicense } from '@homebook/ui';
import Button from 'primevue/button';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackend } from '@/api/backend';
import { useSetupStep } from '@/composables/useSetupStep';
import { toUiLicenses } from '@/setup/steps';
import { useSetupStore } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

const { t } = useI18n();
const setup = useSetupStore();
const { busy, error, success, run, fail, succeed, finish, complete } = useSetupStep('licenseAgreement');

const licenses = shallowRef<UiLicense[]>([]);
/** The licenses are loaded and wait for the consent. */
const pending = shallowRef(false);
const dialogVisible = shallowRef(false);

async function load(): Promise<void> {
  pending.value = false;
  try {
    const response = await run(() => useBackend().api.setup.licenses.get());
    licenses.value = toUiLicenses(response?.licenses);
    if (response?.licensesAccepted === true) {
      // Accepted through HOMEBOOK_CONFIGURATION_ACCEPT_LICENSES
      setup.licensesAccepted = true;
      succeed('setup.licenses.alreadyAccepted.text', undefined, { skipped: true });
    } else {
      pending.value = true;
    }
  } catch (failure) {
    if (isBackendApiError(failure)) {
      fail('setup.licenses.loadingError.messageTemplate', [`HTTP ${statusCodeOf(failure)}`]);
    } else {
      fail('setup.backendConnectionFailed.message');
    }
  }
}

function accept(): void {
  if (!pending.value) {
    return;
  }
  pending.value = false;
  setup.licensesAccepted = true;
  complete();
}

onMounted(load);
</script>

<template>
  <HbSetupStepCard
    :title="t('setup.licenses.title')"
    :busy="busy"
    :error="error"
    :success="success"
    :retry-label="t('setup.licenses.retry.button.text')"
    @finished="finish"
    @retry="load"
  >
    <div v-if="pending" class="hb-setup-licenses__actions">
      <Button
        severity="secondary"
        :label="t('setup.licenses.showLicenses.button.text')"
        class="hb-setup-licenses__show"
        @click="dialogVisible = true"
      />
      <Button :label="t('setup.licenses.acceptContinue.button.text')" class="hb-setup-licenses__accept" @click="accept">
        <template #icon>
          <UiIcon set="windows11-filled" name="Check" size="small" />
        </template>
      </Button>
    </div>

    <UiLicenseDialog v-model:visible="dialogVisible" :licenses="licenses" @accepted="accept" />
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-licenses__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hb-space-3);
}
</style>
