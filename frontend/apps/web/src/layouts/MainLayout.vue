<script setup lang="ts">
import { useMenuStore } from '@homebook/module-sdk';
import { useBreakpointUp } from '@homebook/ui';
import { useToast } from 'primevue/usetoast';
import { computed, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import UiSearchComponent from '@/components/search/UiSearchComponent.vue';
import { RouteNames } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useWallpaperStore } from '@/stores/wallpaper';

import HbAppBar from './main/HbAppBar.vue';
import HbDrawer from './main/HbDrawer.vue';
import HbFooter from './main/HbFooter.vue';
import HbWallpaper from './main/HbWallpaper.vue';
import OverlayHosts from './OverlayHosts.vue';

const { t } = useI18n();
const toast = useToast();
const router = useRouter();

const auth = useAuthStore();
const bootstrap = useBootstrapStore();
const menu = useMenuStore();
const wallpaperStore = useWallpaperStore();

const isWide = useBreakpointUp('md');
const compact = computed(() => !isWide.value);
const drawerOpen = shallowRef(false);

// The wallpaper is a user preference: load it with the session, drop it without
watch(
  () => auth.hasSession,
  (signedIn) => (signedIn ? wallpaperStore.load() : wallpaperStore.clear()),
  { immediate: true },
);

async function logout(): Promise<void> {
  await auth.logout();
  toast.add({ severity: 'success', summary: t('logout.successMessage'), life: 10000 });
  await router.push({ name: RouteNames.login });
}
</script>

<template>
  <div class="hb-main-layout" :class="{ 'hb-main-layout--compact': compact }">
    <HbWallpaper :wallpaper="wallpaperStore.wallpaper" />
    <HbDrawer
      v-model:open="drawerOpen"
      :instance-name="bootstrap.instanceName"
      :items="menu.items"
      :compact="compact"
    />
    <HbAppBar
      :instance-name="bootstrap.instanceName"
      :user-name="auth.userName"
      :signed-in="auth.hasSession"
      :compact="compact"
      @toggle-drawer="drawerOpen = !drawerOpen"
      @logout="logout"
    >
      <template #search>
        <UiSearchComponent />
      </template>
    </HbAppBar>
    <main class="hb-main-content">
      <slot />
    </main>
    <HbFooter />
    <OverlayHosts />
  </div>
</template>

<style scoped lang="scss">
// Without the pinned drawer the bars keep the chrome gap on the left as well
.hb-main-layout--compact {
  --hb-drawer-width: var(--hb-chrome-gap);
}
</style>
