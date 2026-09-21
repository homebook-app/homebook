<script setup lang="ts">
import { UiIcon } from '@homebook/ui';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { computed, useId } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatSearchHandlerName, SEARCH_DEBOUNCE_MS, useGlobalSearch } from '@/composables/useGlobalSearch';
import { useModuleRegistry } from '@/modules';

import SearchResultGroup from './SearchResultGroup.vue';

interface Props {
  /** Delay between the last keystroke and the request. */
  debounceMs?: number;
}

const props = withDefaults(defineProps<Props>(), { debounceMs: SEARCH_DEBOUNCE_MS });

const { t } = useI18n();
const registry = useModuleRegistry();
const { query, groups, searching, setQuery, reset } = useGlobalSearch(props.debounceMs);

const panelId = useId();

// A panel instead of a modal dialog: the input keeps the focus, so typing goes on while results
// come in, as it did with the input lifted above the Blazor dialog
const open = computed(() => searching.value || groups.value.length > 0);

const sections = computed(() =>
  groups.value.map((group) => {
    const module = registry.findSearchModule(group.moduleKey);
    const title = module ? t(module.nameKey) : formatSearchHandlerName(group.moduleKey);
    return {
      group,
      title: title === '' ? t('search.fallbackModuleName') : title,
      component: registry.resolveSearchComponent(group.moduleKey),
    };
  }),
);

function onInput(event: Event): void {
  setQuery((event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="ui-search-component" :class="{ 'is-open': open }" @keydown.esc="reset">
    <IconField class="ui-search-component__input">
      <InputIcon>
        <UiIcon set="windows11-outline" name="Search" size="small" />
      </InputIcon>
      <InputText
        :model-value="query"
        type="search"
        role="combobox"
        aria-autocomplete="none"
        :aria-expanded="open"
        :aria-controls="panelId"
        :aria-label="t('mainLayout.searchTextField.placeholder')"
        :placeholder="t('mainLayout.searchTextField.placeholder')"
        fluid
        @input="onInput"
      />
    </IconField>

    <Teleport to="body">
      <div v-if="open" class="ui-search-component__mask" @click="reset" />
    </Teleport>

    <div
      v-if="open"
      :id="panelId"
      class="ui-search-component__panel frosted-b3"
      role="region"
      :aria-label="t('search.resultsLabel')"
      :aria-busy="searching"
    >
      <div v-if="searching" class="ui-search-component__state" role="status">
        <ProgressSpinner class="ui-search-component__spinner" stroke-width="4" />
        <span class="hb-visually-hidden">{{ t('search.searching') }}</span>
      </div>
      <SearchResultGroup
        v-for="section in sections"
        :key="section.group.moduleKey"
        :group="section.group"
        :title="section.title"
        :component="section.component"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-search-component {
  position: relative;
  flex: 1 1 22rem;
  width: 100%;
  min-width: 0;
  max-width: min(18rem, calc(100vw - 7rem));

  @include media-up(sm) {
    max-width: min(22rem, calc(100vw - 8rem));
  }

  @include media-up(md) {
    max-width: min(40rem, calc(100vw - 12rem));
  }
}

.ui-search-component__input {
  width: 100%;
}

.ui-search-component__mask {
  position: fixed;
  inset: 0;
  z-index: calc(var(--hb-chrome-z-index) - 1);
  background: var(--p-mask-background);
}

.ui-search-component__panel {
  position: absolute;
  top: calc(100% + var(--hb-space-3));
  left: 50%;
  width: min(48rem, calc(100vw - var(--hb-space-4)));
  max-height: min(36rem, 75vh);
  overflow-y: auto;
  border-radius: var(--hb-border-radius-default);
  color: var(--hb-text-primary);
  transform: translateX(-50%);
}

.ui-search-component__state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--hb-space-4);
}

.ui-search-component__spinner {
  width: var(--hb-icon-size-lg);
  height: var(--hb-icon-size-lg);
}
</style>
