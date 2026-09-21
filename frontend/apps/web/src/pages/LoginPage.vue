<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { UiIcon, UiStripeBackground, usePageTitle } from '@homebook/ui';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import HbFormField from '@/components/forms/HbFormField.vue';
import { SESSION_EXPIRED_REASON } from '@/router/guards';
import { createResolver, fieldError, loginRules } from '@/setup/validation';
import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useLocaleStore } from '@/stores/locale';

interface LoginFormValues {
  username: string;
  password: string;
}

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const bootstrap = useBootstrapStore();
const locale = useLocaleStore();

usePageTitle(() => t('account.login.title'));

const resolver = createResolver(loginRules);
const initialValues: LoginFormValues = { username: '', password: '' };

const busy = shallowRef(false);
const error = shallowRef<'invalidCredentials' | 'error' | undefined>();

const sessionExpired = computed(() => route.query.reason === SESSION_EXPIRED_REASON && error.value === undefined);

/** Only paths inside the app, never another origin. */
function returnTarget(): string {
  const target = route.query.returnUrl;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

async function submit(event: FormSubmitEvent): Promise<void> {
  // A second Enter while the first request runs must not send it again
  if (!event.valid || busy.value) {
    return;
  }
  const values = event.values as LoginFormValues;
  busy.value = true;
  error.value = undefined;
  try {
    // 400 and 401 come back as false; the body is never shown, it is neither translated nor stable
    if (!(await auth.login(values.username.trim(), values.password))) {
      error.value = 'invalidCredentials';
      return;
    }
    await locale.loadUserPreference();
    toast.add({ severity: 'success', summary: t('account.login.successMessage'), life: 10000 });
    await router.replace(returnTarget());
  } catch (failure) {
    console.error(failure);
    error.value = 'error';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <UiStripeBackground class="hb-login__background" scheme="release" />

  <div class="hb-login">
    <Form
      v-slot="$form"
      class="hb-login__card frosted-b5"
      :initial-values="initialValues"
      :resolver="resolver"
      :validate-on-value-update="false"
      validate-on-blur
      novalidate
      @submit="submit"
    >
      <header class="hb-login__header">
        <h1 class="hb-login__title">{{ t('account.login.title') }}</h1>
        <span v-if="bootstrap.instanceName" class="hb-login__instance ui-text-title">{{ bootstrap.instanceName }}</span>
      </header>

      <div class="hb-login__content">
        <Message v-if="sessionExpired" severity="warn" :closable="false">
          {{ t('account.login.sessionExpired') }}
        </Message>
        <Message v-if="error" severity="error" :closable="false" role="alert">
          {{ t(`account.login.${error}`) }}
        </Message>

        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="login-username"
          :label="t('account.login.username.label')"
          :error="fieldError($form.username)"
        >
          <InputText
            id="login-username"
            name="username"
            autocomplete="username"
            autofocus
            :aria-describedby="describedBy"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
        <HbFormField
          v-slot="{ describedBy, invalid }"
          input-id="login-password"
          :label="t('account.login.password.label')"
          :error="fieldError($form.password)"
        >
          <Password
            input-id="login-password"
            name="password"
            :feedback="false"
            toggle-mask
            :input-props="{ autocomplete: 'current-password', 'aria-describedby': describedBy }"
            :invalid="invalid"
            :disabled="busy"
            fluid
          />
        </HbFormField>
      </div>

      <div class="hb-login__actions frosted-b1 no-backdrop-blur">
        <Button
          type="submit"
          size="large"
          :label="busy ? t('account.login.signingInButton.text') : t('account.login.signInButton.text')"
          :loading="busy"
          :disabled="busy"
          fluid
        >
          <template v-if="!busy" #icon>
            <UiIcon set="windows11-filled" name="Login" size="small" />
          </template>
        </Button>
      </div>
    </Form>
  </div>
</template>

<style scoped lang="scss">
.hb-login__background {
  position: fixed;
  inset: 0;
  z-index: -100;
}

.hb-login {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  padding: var(--hb-space-4);

  @include media-up(sm) {
    padding: var(--hb-content-only-offset) var(--hb-space-6);
  }
}

// xs=12 sm=8 md=6 lg=4 of the Blazor grid
.hb-login__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  border-radius: var(--hb-border-radius-default);
  color: var(--hb-color-primary);

  @include media-up(sm) {
    width: calc(100% * 8 / 12);
  }

  @include media-up(md) {
    width: 50%;
  }

  @include media-up(lg) {
    width: calc(100% * 4 / 12);
  }
}

.hb-login__header {
  display: flex;
  flex-direction: column;
  padding: var(--hb-card-header-padding);
  padding-bottom: 0;
}

.hb-login__title {
  margin: 0;
}

.hb-login__content {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-4);
  padding: var(--hb-card-content-padding);
}

.hb-login__actions {
  padding: var(--hb-card-footer-padding);
}
</style>
