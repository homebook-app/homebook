<script setup lang="ts">
import { isGuid, type SearchResultComponentProps, type SearchResultItem } from '@homebook/module-sdk';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

defineProps<SearchResultComponentProps>();

const router = useRouter();

function open(item: SearchResultItem): void {
  if (isGuid(item.identifier)) {
    void router.push(`/Finances/Savings/${item.identifier}`);
  }
}
</script>

<template>
  <div class="hb-saving-goal-search-results">
    <Button
      v-for="item in items"
      :key="item.identifier"
      text
      class="hb-saving-goal-search-results__row frosted-b3"
      :disabled="!isGuid(item.identifier)"
      @click="open(item)"
    >
      <span class="hb-saving-goal-search-results__title">{{ item.title }}</span>
      <span v-if="item.description?.trim()" class="ui-text-caption">{{ item.description }}</span>
    </Button>
  </div>
</template>

<style scoped lang="scss">
.hb-saving-goal-search-results {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-2);
  padding: 0 var(--hb-space-4) var(--hb-space-4);
}

.hb-saving-goal-search-results__row {
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  border-radius: var(--hb-border-radius-default);
  color: inherit;
  text-align: left;
}

.hb-saving-goal-search-results__title {
  font-weight: var(--hb-font-weight-title);
}
</style>
