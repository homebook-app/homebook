<script setup lang="ts">
import { isBackendApiError, isNotFound } from '@homebook/api-client';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackend } from '@/api/backend';
import HbFormField from '@/components/forms/HbFormField.vue';
import { useSetupStep } from '@/composables/useSetupStep';
import { resolveLocale } from '@/locales';
import { configurationRules, createResolver, fieldError } from '@/setup/validation';
import { useSetupStore } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

interface ConfigurationFormValues {
  instanceName: string;
  defaultLocale: string | null;
}

interface LocaleOption {
  code: string;
  name: string;
}

const { t, locale } = useI18n();
const setup = useSetupStore();
const { busy, error, success, run, fail, succeed, finish } = useSetupStep('configuration');

const resolver = createResolver(configurationRules);
const showForm = shallowRef(false);
const locales = shallowRef<LocaleOption[]>([]);
const initialValues = shallowRef<ConfigurationFormValues>({ instanceName: '', defaultLocale: null });

/** `false` when the environment variables preconfigure the instance, 200 of `GET /setup/configuration`. */
async function needsConfiguration(): Promise<boolean> {
  try {
    await useBackend().api.setup.configuration.get();
    return false;
  } catch (failure) {
    if (isNotFound(failure)) {
      return true;
    }
    throw failure;
  }
}

async function loadLocales(): Promise<LocaleOption[]> {
  const response = await useBackend().api.platform.locales.get();
  return (response?.locales ?? [])
    .filter((entry) => entry.code)
    .map((entry) => ({ code: entry.code!, name: entry.name || entry.code! }));
}

async function load(): Promise<void> {
  showForm.value = false;
  try {
    const [needed, options] = await run(() => Promise.all([needsConfiguration(), loadLocales()]));
    if (!needed) {
      setup.configuration = null;
      succeed('setup.configuration.configurationFound.title', undefined, { skipped: true });
      return;
    }
    locales.value = options;
    // Preselect the language the wizard is shown in
    const current = options.find((option) => resolveLocale(option.code) === locale.value);
    initialValues.value = {
      instanceName: t('setup.configuration.form.instanceName.defaultValue'),
      defaultLocale: current?.code ?? null,
    };
    showForm.value = true;
  } catch (failure) {
    fail(
      isBackendApiError(failure) ? 'setup.configuration.loadingError.message' : 'setup.backendConnectionFailed.message',
    );
  }
}

function submit(event: FormSubmitEvent): void {
  if (!event.valid || success.value !== undefined) {
    return;
  }
  const values = event.values as ConfigurationFormValues;
  setup.configuration = { instanceName: values.instanceName.trim(), defaultLocale: values.defaultLocale ?? '' };
  showForm.value = false;
  succeed('setup.configuration.configurationSaved.title');
}

onMounted(load);
</script>

<template>
  <HbSetupStepCard
    :title="t('setup.configuration.title')"
    :busy="busy"
    :error="error"
    :success="success"
    :retry-label="t('setup.backendConnection.retry.button.text')"
    @finished="finish"
    @retry="load"
  >
    <Form
      v-if="showForm"
      v-slot="$form"
      class="hb-setup-configuration"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      validate-on-blur
      novalidate
      @submit="submit"
    >
      <HbFormField
        v-slot="{ describedBy, invalid }"
        input-id="setup-configuration-name"
        :label="t('setup.configuration.form.instanceName.label')"
        :helper-text="t('setup.configuration.form.instanceName.helperText')"
        :error="fieldError($form.instanceName)"
      >
        <InputText
          id="setup-configuration-name"
          name="instanceName"
          autocomplete="off"
          :aria-describedby="describedBy"
          :invalid="invalid"
          fluid
        />
      </HbFormField>
      <HbFormField
        v-slot="{ invalid }"
        input-id="setup-configuration-locale"
        :label="t('setup.configuration.form.instanceDefaultLocale.label')"
        :helper-text="t('setup.configuration.form.instanceDefaultLocale.helperText')"
        :error="fieldError($form.defaultLocale)"
      >
        <Select
          input-id="setup-configuration-locale"
          name="defaultLocale"
          :options="locales"
          option-label="name"
          option-value="code"
          :invalid="invalid"
          fluid
        />
      </HbFormField>

      <div class="hb-setup-configuration__actions">
        <Button type="submit" :label="t('setup.configuration.save.button.text')" />
      </div>
    </Form>
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-configuration {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-4);
}

.hb-setup-configuration__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
