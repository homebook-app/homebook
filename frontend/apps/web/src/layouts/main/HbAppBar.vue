<script setup lang="ts">
import { UiIcon } from '@homebook/ui';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { MenuItem as PrimeMenuItem } from 'primevue/menuitem';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

interface Props {
  instanceName: string;
  /** Shown in the profile menu. */
  userName: string;
  signedIn: boolean;
  /** Below the `md` breakpoint: menu button and overflow menu instead of the pinned drawer. */
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), { compact: false });

const emit = defineEmits<{
  toggleDrawer: [];
  logout: [];
}>();

const { t } = useI18n();
const router = useRouter();

const profileMenu = useTemplateRef<InstanceType<typeof Menu>>('profileMenu');
const overflowMenu = useTemplateRef<InstanceType<typeof Menu>>('overflowMenu');

const profileItems = computed<PrimeMenuItem[]>(() => [
  { key: 'user', label: props.userName, icon: 'User', disabled: true },
  { separator: true },
  { key: 'logout', label: t('accountMenu.logout'), icon: 'LogoutRounded', command: () => emit('logout') },
]);

const overflowItems = computed<PrimeMenuItem[]>(() => [
  { key: 'settings', label: t('accountMenu.settings'), icon: 'Gear', command: () => router.push('/Settings') },
]);

const title = computed(() => [props.instanceName, t('appTitle')].filter((part) => part !== '').join(' - '));
</script>

<template>
  <header class="hb-header-appbar frosted-b6">
    <template v-if="compact">
      <Button text rounded :aria-label="t('mainLayout.menuButton.label')" @click="emit('toggleDrawer')">
        <UiIcon set="windows11-outline" name="Menu" />
      </Button>
      <span class="hb-app-bar__title ui-text-title">{{ title }}</span>
    </template>

    <Button as="router-link" to="/" text rounded :aria-label="t('mainLayout.homeButton.label')">
      <UiIcon set="windows11-outline" name="Home" />
    </Button>

    <div class="hb-app-bar__search">
      <slot name="search" />
    </div>

    <template v-if="signedIn">
      <Button
        text
        rounded
        aria-haspopup="true"
        :aria-label="t('mainLayout.profileMenu.label')"
        @click="profileMenu?.toggle($event)"
      >
        <UiIcon set="windows11-outline" name="Profile" />
      </Button>
      <Menu ref="profileMenu" :model="profileItems" popup class="hb-app-bar__menu">
        <template #itemicon="{ item }">
          <UiIcon set="windows11-filled" :name="String(item.icon)" size="small" />
        </template>
      </Menu>

      <template v-if="compact">
        <Button
          text
          rounded
          aria-haspopup="true"
          :aria-label="t('mainLayout.moreMenu.label')"
          @click="overflowMenu?.toggle($event)"
        >
          <UiIcon set="windows11-outline" name="More" />
        </Button>
        <Menu ref="overflowMenu" :model="overflowItems" popup class="hb-app-bar__menu">
          <template #itemicon="{ item }">
            <UiIcon set="windows11-filled" :name="String(item.icon)" size="small" />
          </template>
        </Menu>
      </template>
    </template>

    <Button
      v-else
      as="router-link"
      to="/Login"
      text
      rounded
      class="hb-app-bar__login"
      :aria-label="t('mainLayout.loginButton.label')"
    >
      <UiIcon set="windows11-filled" name="LoginRounded" />
    </Button>
  </header>
</template>

<style scoped lang="scss">
.hb-app-bar__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hb-app-bar__search {
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 0;
}
</style>
