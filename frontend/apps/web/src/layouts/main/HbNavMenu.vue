<script setup lang="ts">
import type { MenuItem } from '@homebook/module-sdk';
import { UiIcon } from '@homebook/ui';
import Divider from 'primevue/divider';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

interface Props {
  /** Context entries of the current page, shown between the start page and the settings. */
  items?: readonly MenuItem[];
}

const props = withDefaults(defineProps<Props>(), { items: () => [] });

const emit = defineEmits<{
  /** An entry was chosen, the compact drawer closes. */
  navigate: [];
}>();

const { t } = useI18n();

const hasContextItems = computed(() => props.items.length > 0);
</script>

<template>
  <nav class="hb-nav" :aria-label="t('mainLayout.drawer.label')">
    <ul class="hb-nav-menu">
      <li>
        <RouterLink to="/" class="hb-nav-link" @click="emit('navigate')">
          <UiIcon set="windows11-outline" name="Home" size="var(--hb-nav-link-icon-size)" />
          <span>{{ t('home.pageTitle') }}</span>
        </RouterLink>
      </li>
    </ul>

    <template v-if="hasContextItems">
      <Divider class="hb-nav__divider" />
      <ul class="hb-nav-menu hb-nav__context">
        <li v-for="item in items" :key="item.url">
          <RouterLink :to="item.url" class="hb-nav-link" @click="emit('navigate')">
            <UiIcon v-if="item.icon" :set="item.icon.set" :name="item.icon.name" size="var(--hb-nav-link-icon-size)" />
            <span>{{ item.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>

    <ul class="hb-nav-menu hb-nav__bottom">
      <li>
        <RouterLink to="/Settings" class="hb-nav-link" @click="emit('navigate')">
          <UiIcon set="windows11-outline" name="Gear" size="var(--hb-nav-link-icon-size)" />
          <span>{{ t('accountMenu.settings') }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.hb-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.hb-nav__divider {
  margin: var(--hb-space-5) 0;
}

.hb-nav__bottom {
  margin-top: auto;
}
</style>
