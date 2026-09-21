<script setup lang="ts">
import type { Component } from 'vue';

import type { SearchGroup } from '@/composables/useGlobalSearch';

interface Props {
  group: SearchGroup;
  /** Display name of the module or handler. */
  title: string;
  /** Result component of the module; without one the hits are listed as text. */
  component?: Component;
}

withDefaults(defineProps<Props>(), { component: undefined });
</script>

<template>
  <section class="ui-search-component__module">
    <header class="ui-search-component__module-header">
      <h2 class="ui-search-component__module-title ui-text-caption">{{ title }}</h2>
      <span class="ui-search-component__module-count ui-text-caption">{{ group.totalCount }}</span>
    </header>

    <component :is="component" v-if="component" :items="group.items" />
    <ul v-else class="ui-search-component__items">
      <li v-for="item in group.items" :key="item.identifier" class="ui-search-component__item">
        <span class="ui-search-component__item-title">{{ item.title }}</span>
        <span v-if="item.description" class="ui-search-component__item-description ui-text-caption">
          {{ item.description }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.ui-search-component__module {
  padding-top: var(--hb-space-3);

  & + & {
    border-top: 1px solid color-mix(in srgb, var(--hb-text-primary) 12%, transparent);
  }
}

.ui-search-component__module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--hb-space-3);
  padding: 0 var(--hb-space-4) var(--hb-space-2);
}

.ui-search-component__module-title {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ui-search-component__module-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--hb-space-7);
  min-height: var(--hb-space-7);
  padding: var(--hb-space-1) var(--hb-space-2);
  border-radius: 999px;
  background: color-mix(in srgb, var(--hb-text-primary) 8%, transparent);
}

.ui-search-component__items {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-search-component__item {
  padding: var(--hb-space-3) var(--hb-space-4);

  & + & {
    border-top: 1px solid color-mix(in srgb, var(--hb-text-primary) 7%, transparent);
  }
}

.ui-search-component__item-title {
  font-weight: var(--hb-font-weight-title);
}

.ui-search-component__item-description {
  display: block;
  margin-top: var(--hb-space-1);
  color: var(--hb-text-secondary);
}
</style>
