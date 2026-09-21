<script setup lang="ts">
import type { MenuItem } from '@homebook/module-sdk';
import Drawer from 'primevue/drawer';
import { useI18n } from 'vue-i18n';

import HbNavMenu from './HbNavMenu.vue';

interface Props {
  instanceName: string;
  items?: readonly MenuItem[];
  /** Below the `md` breakpoint the drawer is an overlay instead of a pinned panel. */
  compact?: boolean;
}

withDefaults(defineProps<Props>(), { items: () => [], compact: false });

/** Only used while compact: whether the overlay is shown. */
const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();

function close(): void {
  open.value = false;
}
</script>

<template>
  <Drawer v-if="compact" v-model:visible="open" class="hb-drawer frosted-bg-b5" :block-scroll="true">
    <template #header>
      <div class="hb-drawer__header">
        <span class="ui-text-title">{{ t('appTitle') }}</span>
        <span class="ui-text-caption">{{ instanceName }}</span>
      </div>
    </template>
    <HbNavMenu :items="items" @navigate="close" />
  </Drawer>

  <aside v-else class="hb-drawer hb-drawer--pinned frosted-bg-b5">
    <div class="hb-drawer__header">
      <span class="ui-text-title">{{ t('appTitle') }}</span>
      <span class="ui-text-caption">{{ instanceName }}</span>
    </div>
    <HbNavMenu :items="items" />
  </aside>
</template>

<style scoped lang="scss">
.hb-drawer--pinned {
  position: fixed;
  left: 0;
  z-index: var(--hb-chrome-z-index);
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-4);
  padding: var(--hb-space-4) var(--hb-space-2);
  overflow-y: auto;
}

.hb-drawer__header {
  display: flex;
  flex-direction: column;
  padding: 0 var(--hb-space-2);
}
</style>
