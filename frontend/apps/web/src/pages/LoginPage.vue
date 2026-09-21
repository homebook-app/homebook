<script setup lang="ts">
import { usePageTitle } from '@homebook/ui';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { computed, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { SESSION_EXPIRED_REASON } from '@/router/guards';
import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useLocaleStore } from '@/stores/locale';

// Minimal sign-in form so the shell can be used against a real backend. Step 07 ports the full
// login page of the Blazor frontend.

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const bootstrap = useBootstrapStore();
const locale = useLocaleStore();

usePageTitle(() => t('account.login.title'));

const username = shallowRef('');
const password = shallowRef('');
const busy = shallowRef(false);
const error = shallowRef<'invalidCredentials' | 'error' | undefined>();

const sessionExpired = computed(() => route.query.reason === SESSION_EXPIRED_REASON && error.value === undefined);
const canSubmit = computed(() => username.value.trim() !== '' && password.value !== '' && !busy.value);

/** Only paths inside the app, never another origin. */
function returnTarget(): string {
  const target = route.query.returnUrl;
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

async function submit(): Promise<void> {
  if (!canSubmit.value) {
    return;
  }
  busy.value = true;
  error.value = undefined;
  try {
    if (!(await auth.login(username.value.trim(), password.value))) {
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
  <div class="hb-login">
    <form class="hb-login__card frosted-b8" novalidate @submit.prevent="submit">
      <h1 class="ui-text-title">{{ t('account.login.title') }}</h1>
      <span v-if="bootstrap.instanceName" class="ui-text-caption">{{ bootstrap.instanceName }}</span>

      <Message v-if="sessionExpired" severity="warn" class="hb-login__message">
        {{ t('account.login.sessionExpired') }}
      </Message>
      <Message v-if="error" severity="error" class="hb-login__message" role="alert">
        {{ t(`account.login.${error}`) }}
      </Message>

      <label class="hb-login__field">
        <span>{{ t('account.login.username.label') }}</span>
        <InputText v-model="username" name="username" autocomplete="username" autofocus fluid />
      </label>
      <label class="hb-login__field">
        <span>{{ t('account.login.password.label') }}</span>
        <Password
          v-model="password"
          name="password"
          :feedback="false"
          toggle-mask
          fluid
          :input-props="{ autocomplete: 'current-password' }"
        />
      </label>

      <Button
        type="submit"
        :label="busy ? t('account.login.signingInButton.text') : t('account.login.signInButton.text')"
        :loading="busy"
        :disabled="!canSubmit"
        fluid
      />
    </form>
  </div>
</template>

<style scoped lang="scss">
.hb-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--hb-space-4);
}

.hb-login__card {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-4);
  width: 100%;
  max-width: 24rem;
  padding: var(--hb-space-8) var(--hb-space-6);
  border-radius: var(--hb-border-radius-default);

  h1 {
    margin: 0;
  }
}

.hb-login__field {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-1);
}
</style>
