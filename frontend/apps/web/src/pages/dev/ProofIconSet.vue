<script setup lang="ts">
import {
  getIconRegistry,
  iconRegistryKey,
  isTintableIconSet,
  UiIcon,
  UiPictogram,
  type IconSetName,
} from '@homebook/ui';
import { computed, inject, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  set: IconSetName;
}

const props = defineProps<Props>();

const { t } = useI18n();
const registry = inject(iconRegistryKey, () => getIconRegistry(), true);

const names = shallowRef<string[]>([]);
const requested = shallowRef(false);

// Same size as on the Blazor developer page
const ICON_SIZE = 60;

const tintableSet = computed(() => (isTintableIconSet(props.set) ? props.set : null));
const multicolorSet = computed(() => (isTintableIconSet(props.set) ? null : props.set));

// The set is loaded when its section is opened for the first time. That keeps the on-demand
// loading of the sprites visible in the network tab.
async function onToggle(event: Event): Promise<void> {
  if (requested.value || !(event.target instanceof HTMLDetailsElement) || !event.target.open) return;
  requested.value = true;

  try {
    names.value = [...(await registry.load(props.set))].sort((a, b) => a.localeCompare(b));
  } catch {
    // UiIcon reports the failed set, the section simply stays empty
    requested.value = false;
  }
}

function copyName(name: string): void {
  void navigator.clipboard?.writeText(name);
}
</script>

<template>
  <details class="hb-proof-icon-set" @toggle="onToggle">
    <!-- Set and icon names are identifiers, not copy -->
    <summary class="hb-proof-icon-set__summary">{{ set }}</summary>

    <div class="hb-proof-icon-set__grid">
      <button
        v-for="name in names"
        :key="name"
        class="hb-proof-icon-set__item"
        type="button"
        :title="name"
        :aria-label="t('settings.developer.icons.copyName', { name })"
        @click="copyName(name)"
      >
        <UiIcon v-if="tintableSet" :set="tintableSet" :name="name" :size="ICON_SIZE" />
        <UiPictogram v-else-if="multicolorSet" :set="multicolorSet" :name="name" :size="ICON_SIZE" />
      </button>
    </div>
  </details>
</template>

<style scoped lang="scss">
.hb-proof-icon-set {
  margin-bottom: var(--hb-chrome-gap);
}

.hb-proof-icon-set__summary {
  cursor: pointer;
  padding: var(--hb-chrome-gap) 0;
}

.hb-proof-icon-set__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hb-chrome-gap);
}

.hb-proof-icon-set__item {
  padding: var(--hb-chrome-gap);
  border: none;
  border-radius: var(--hb-chrome-border-radius);
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--p-content-hover-background);
  }
}
</style>
