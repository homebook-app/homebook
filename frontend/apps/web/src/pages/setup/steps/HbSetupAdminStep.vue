<script setup lang="ts">
import { isBackendApiError, isNotFound } from '@homebook/api-client';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { onMounted, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackend } from '@/api/backend';
import HbFormField from '@/components/forms/HbFormField.vue';
import { useSetupStep } from '@/composables/useSetupStep';
import { adminRules, createResolver, fieldError } from '@/setup/validation';
import { useSetupStore } from '@/stores/setup';

import HbSetupStepCard from '../HbSetupStepCard.vue';

interface AdminFormValues {
  username: string;
  password: string;
  passwordConfirm: string;
}

const { t } = useI18n();
const setup = useSetupStore();
const { busy, error, success, run, fail, succeed, finish } = useSetupStep('adminUser');

const resolver = createResolver(adminRules);
const initialValues: AdminFormValues = { username: '', password: '', passwordConfirm: '' };
const showForm = shallowRef(false);

async function load(): Promise<void> {
  showForm.value = false;
  try {
    // 200 only when HOMEBOOK_USER_NAME and HOMEBOOK_USER_PASSWORD are set
    await run(() => useBackend().api.setup.user.get());
    setup.admin = null;
    succeed('setup.adminUser.configurationFound.text', undefined, { skipped: true });
  } catch (failure) {
    if (isNotFound(failure)) {
      showForm.value = true;
    } else if (isBackendApiError(failure)) {
      fail('setup.adminUser.presetError.message');
    } else {
      fail('setup.backendConnectionFailed.message');
    }
  }
}

function submit(event: FormSubmitEvent): void {
  if (!event.valid || success.value !== undefined) {
    return;
  }
  const values = event.values as AdminFormValues;
  setup.admin = { username: values.username.trim(), password: values.password };
  showForm.value = false;
  succeed('setup.adminUser.configurationSaved.text');
}

onMounted(load);
</script>

<template>
  <HbSetupStepCard
    :title="t('setup.adminUser.title')"
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
      class="hb-setup-admin"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      validate-on-blur
      novalidate
      @submit="submit"
    >
      <HbFormField
        v-slot="{ describedBy, invalid }"
        input-id="setup-admin-username"
        class="hb-setup-admin__wide"
        :label="t('setup.adminUser.form.username.label')"
        :helper-text="t('setup.adminUser.form.username.helperText')"
        :error="fieldError($form.username)"
      >
        <InputText
          id="setup-admin-username"
          name="username"
          autocomplete="username"
          :aria-describedby="describedBy"
          :invalid="invalid"
          fluid
        />
      </HbFormField>
      <HbFormField
        v-slot="{ describedBy, invalid }"
        input-id="setup-admin-password"
        :label="t('setup.adminUser.form.password.label')"
        :helper-text="t('setup.adminUser.form.password.helperText')"
        :error="fieldError($form.password)"
      >
        <Password
          input-id="setup-admin-password"
          name="password"
          :feedback="false"
          toggle-mask
          :input-props="{ autocomplete: 'new-password', 'aria-describedby': describedBy }"
          :invalid="invalid"
          fluid
        />
      </HbFormField>
      <HbFormField
        v-slot="{ describedBy, invalid }"
        input-id="setup-admin-password-confirm"
        :label="t('setup.adminUser.form.passwordConfirm.label')"
        :helper-text="t('setup.adminUser.form.passwordConfirm.helperText')"
        :error="fieldError($form.passwordConfirm)"
      >
        <Password
          input-id="setup-admin-password-confirm"
          name="passwordConfirm"
          :feedback="false"
          toggle-mask
          :input-props="{ autocomplete: 'new-password', 'aria-describedby': describedBy }"
          :invalid="invalid"
          fluid
        />
      </HbFormField>

      <div class="hb-setup-admin__wide hb-setup-admin__actions">
        <Button type="submit" :label="t('setup.adminUser.save.button.text')" />
      </div>
    </Form>
  </HbSetupStepCard>
</template>

<style scoped lang="scss">
.hb-setup-admin {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--hb-space-4);

  @include media-up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    .hb-setup-admin__wide {
      grid-column: 1 / -1;
    }
  }
}

.hb-setup-admin__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
