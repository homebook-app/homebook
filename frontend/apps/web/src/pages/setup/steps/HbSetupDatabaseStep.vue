<script setup lang="ts">
import { isBackendApiError, isNotFound, isServiceUnavailable } from '@homebook/api-client';
import { Form, type FormInstance, type FormSubmitEvent } from '@primevue/forms';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Select from 'primevue/select';
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackend } from '@/api/backend';
import HbFormField from '@/components/forms/HbFormField.vue';
import { useSetupStep } from '@/composables/useSetupStep';
import { setupTiming } from '@/setup/timing';
import { createResolver, databaseRules, fieldError } from '@/setup/validation';
import { useBootstrapStore } from '@/stores/bootstrap';
import { parseDatabaseProvider, useSetupStore, type DatabaseProvider } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

interface DatabaseFormValues {
  provider: DatabaseProvider;
  host: string;
  port: number | null;
  databaseName: string;
  username: string;
  password: string;
  databaseFile: string;
}

const DEFAULT_PORTS: Record<Exclude<DatabaseProvider, 'SQLITE'>, number> = { POSTGRESQL: 5432, MYSQL: 3306 };

const { t } = useI18n();
const bootstrap = useBootstrapStore();
const setup = useSetupStore();
const { busy, error, success, run, fail, succeed, finish } = useSetupStep('databaseConfiguration');

const form = useTemplateRef<FormInstance>('form');
const resolver = createResolver(databaseRules);

const loaded = shallowRef(false);
/** The preset of the environment variables could not be read, the form starts empty. */
const presetFailed = shallowRef(false);
const initialValues = shallowRef<DatabaseFormValues>({
  provider: 'POSTGRESQL',
  host: '',
  port: DEFAULT_PORTS.POSTGRESQL,
  databaseName: '',
  username: '',
  password: '',
  databaseFile: '',
});

// SQLite is meant for tests, never for a real installation
const providers = computed(() =>
  (['POSTGRESQL', 'MYSQL', ...(bootstrap.devMode ? ['SQLITE' as const] : [])] as const).map((value) => ({
    value,
    label: t(`setup.database.form.provider.options.${value.toLowerCase()}`),
  })),
);

function providerLabel(provider: DatabaseProvider): string {
  return t(`setup.database.form.provider.options.${provider.toLowerCase()}`);
}

async function loadPreset(): Promise<void> {
  try {
    const preset = await useBackend().api.setup.database.configuration.get();
    if (preset) {
      const port = Number.parseInt(preset.databasePort ?? '', 10);
      initialValues.value = {
        ...initialValues.value,
        host: preset.databaseHost ?? '',
        port: Number.isInteger(port) ? port : initialValues.value.port,
        databaseName: preset.databaseName ?? '',
        username: preset.databaseUserName ?? '',
        password: preset.databaseUserPassword ?? '',
      };
    }
  } catch (failure) {
    // 404: nothing preset, which is the normal case
    presetFailed.value = !isNotFound(failure);
  } finally {
    loaded.value = true;
  }
}

/** Follows the default port of the provider as long as nobody typed another one. */
function onProviderChange(provider: DatabaseProvider): void {
  const port = form.value?.getFieldState('port')?.value as unknown;
  const isDefault = port === null || port === undefined || Object.values(DEFAULT_PORTS).includes(port as number);
  if (provider !== 'SQLITE' && isDefault) {
    form.value?.setFieldValue('port', DEFAULT_PORTS[provider]);
  }
}

async function submit(event: FormSubmitEvent): Promise<void> {
  if (!event.valid || busy.value || success.value !== undefined) {
    return;
  }
  const values = event.values as DatabaseFormValues;

  if (values.provider === 'SQLITE') {
    // POST /setup/database/check knows no SQLite; the file is created by the setup itself
    setup.database = { type: 'SQLITE', file: values.databaseFile.trim() };
    succeed('setup.database.sqliteSaved.text');
    return;
  }

  const settings = {
    host: values.host.trim(),
    port: values.port ?? DEFAULT_PORTS[values.provider],
    name: values.databaseName.trim(),
    username: values.username.trim(),
    password: values.password,
  };
  try {
    const detected = await run(
      () =>
        useBackend().api.setup.database.check.post({
          databaseHost: settings.host,
          databasePort: settings.port,
          databaseName: settings.name,
          databaseUserName: settings.username,
          databaseUserPassword: settings.password,
        }),
      setupTiming.minCheckDurationMs,
    );
    const provider = parseDatabaseProvider(detected);
    if (provider === undefined || provider === 'SQLITE') {
      fail('setup.database.check.notAvailableOrSupportedError.message');
      return;
    }
    // The backend tries every provider and reports the one that answered
    setup.database = { type: provider, ...settings };
    succeed('setup.database.provider.messageTemplate', [providerLabel(provider)]);
  } catch (failure) {
    if (isServiceUnavailable(failure)) {
      fail('setup.database.check.notAvailableError.message');
    } else if (!isBackendApiError(failure)) {
      fail('setup.backendConnectionFailed.message');
    } else {
      fail('setup.database.check.unknownError.message');
    }
  }
}

onMounted(loadPreset);
</script>

<template>
  <HbSetupStepCard
    :title="t('setup.database.title')"
    :busy="busy || !loaded"
    :error="error"
    :success="success"
    @finished="finish"
  >
    <Message v-if="presetFailed" severity="warn" :closable="false">
      {{ t('setup.database.presetError.message') }}
    </Message>

    <Form
      v-if="loaded && success === undefined"
      ref="form"
      v-slot="$form"
      class="hb-setup-database"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      validate-on-blur
      novalidate
      @submit="submit"
    >
      <HbFormField
        input-id="setup-database-provider"
        class="hb-setup-database__provider"
        :label="t('setup.database.form.provider.label')"
        :helper-text="t('setup.database.form.provider.helperText')"
        :error="fieldError($form.provider)"
      >
        <Select
          input-id="setup-database-provider"
          name="provider"
          :options="providers"
          option-label="label"
          option-value="value"
          :disabled="busy"
          fluid
          @change="onProviderChange($event.value)"
        />
      </HbFormField>

      <template v-if="$form.provider?.value === 'SQLITE'">
        <Message severity="info" :closable="false" class="hb-setup-database__wide">
          {{ t('setup.database.sqliteHint.message') }}
        </Message>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-file"
          class="hb-setup-database__wide"
          :label="t('setup.database.form.databaseFile.label')"
          :helper-text="t('setup.database.form.databaseFile.helperText')"
          :error="fieldError($form.databaseFile)"
        >
          <InputText
            id="setup-database-file"
            name="databaseFile"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
      </template>

      <template v-else>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-host"
          class="hb-setup-database__host"
          :label="t('setup.database.form.host.label')"
          :helper-text="t('setup.database.form.host.helperText')"
          :error="fieldError($form.host)"
        >
          <InputText
            id="setup-database-host"
            name="host"
            autocomplete="off"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-port"
          class="hb-setup-database__port"
          :label="t('setup.database.form.port.label')"
          :error="fieldError($form.port)"
        >
          <InputNumber
            input-id="setup-database-port"
            name="port"
            :use-grouping="false"
            :min="1"
            :max="65535"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-name"
          class="hb-setup-database__wide"
          :label="t('setup.database.form.databaseName.label')"
          :helper-text="t('setup.database.form.databaseName.helperText')"
          :error="fieldError($form.databaseName)"
        >
          <InputText
            id="setup-database-name"
            name="databaseName"
            autocomplete="off"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-username"
          class="hb-setup-database__half"
          :label="t('setup.database.form.databaseUsername.label')"
          :helper-text="t('setup.database.form.databaseUsername.helperText')"
          :error="fieldError($form.username)"
        >
          <InputText
            id="setup-database-username"
            name="username"
            autocomplete="off"
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="setup-database-password"
          class="hb-setup-database__half"
          :label="t('setup.database.form.databasePassword.label')"
          :helper-text="t('setup.database.form.databasePassword.helperText')"
          :error="fieldError($form.password)"
        >
          <Password
            input-id="setup-database-password"
            name="password"
            :feedback="false"
            toggle-mask
            :input-props="{ autocomplete: 'off', 'aria-describedby': describedBy }"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
      </template>

      <div class="hb-setup-database__wide hb-setup-database__actions">
        <Button type="submit" :label="t('setup.database.testConnection.button')" :loading="busy" :disabled="busy" />
      </div>
    </Form>
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-database {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--hb-space-4);

  @include media-up(md) {
    grid-template-columns: repeat(12, minmax(0, 1fr));

    > * {
      grid-column: span 12;
    }

    .hb-setup-database__host {
      grid-column: span 10;
    }

    .hb-setup-database__port {
      grid-column: span 2;
    }

    .hb-setup-database__half,
    .hb-setup-database__provider {
      grid-column: span 6;
    }
  }
}

.hb-setup-database__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
