<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import BootErrorView from '@/components/boot/BootErrorView.vue';
import BootScreen from '@/components/boot/BootScreen.vue';
import ContentOnlyLayout from '@/layouts/ContentOnlyLayout.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useBootstrapStore } from '@/stores/bootstrap';

const route = useRoute();
const router = useRouter();
const bootstrap = useBootstrapStore();

// The first navigation waits for the startup sequence in the router guard
const routerReady = shallowRef(false);
router
  .isReady()
  .catch(() => undefined)
  .finally(() => {
    routerReady.value = true;
  });

const view = computed<'loading' | 'error' | 'page'>(() => {
  const { status } = bootstrap;
  if (status === 'idle' || status === 'loading' || !routerReady.value) {
    return 'loading';
  }
  return status === 'unreachable' || status === 'setupRunning' ? 'error' : 'page';
});

const errorReason = computed(() => (bootstrap.status === 'setupRunning' ? 'setupRunning' : 'unreachable'));

const layout = computed(() => (route.meta.layout === 'contentOnly' ? ContentOnlyLayout : MainLayout));

async function retry(): Promise<void> {
  await bootstrap.retry();
  // The guards let the first navigation through while the backend was away; run them again
  await router.replace({ path: route.path, query: route.query, hash: route.hash, force: true });
}
</script>

<template>
  <BootScreen v-if="view === 'loading'" />
  <BootErrorView v-else-if="view === 'error'" :reason="errorReason" @retry="retry" />
  <component :is="layout" v-else>
    <RouterView />
  </component>
</template>
