<script setup lang="ts">
import { UiNumericGroup, UiProgressItem, UiSettingsItem, type UiProgressSize } from '@homebook/ui';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import { ref } from 'vue';

const servings = ref(4);
const instanceName = ref('HomeBook');
const analytics = ref(false);

const progressSizes: Array<{ size: UiProgressSize; value: number }> = [
  { size: 'small', value: 0 },
  { size: 'medium', value: 45 },
  { size: 'large', value: 100 },
];
</script>

<template>
  <!-- Labels and figures below are fixtures, not copy -->
  <section class="hb-proof-controls">
    <div class="hb-proof-controls__progress">
      <UiProgressItem
        v-for="{ size, value } in progressSizes"
        :key="size"
        :progress-size="size"
        :progress-value="value"
        color="var(--hb-color-petrol)"
        header-text-start="Storage"
        :header-text-end="`${value} %`"
        footer-text-start="of 64 GB"
        :footer-text-end="size"
      />
    </div>

    <div class="hb-proof-controls__numeric">
      <UiNumericGroup v-model="servings" :min="1" :max="20" :step="1" input-id="proof-servings" />
      <span class="hb-proof-controls__echo">v-model: {{ servings }}</span>
    </div>

    <div class="hb-proof-controls__settings">
      <UiSettingsItem
        icon="Tag"
        icon-color="var(--hb-settings-color-instance-name)"
        title="Instance name"
        caption="Shown in the browser tab and on the start page"
      >
        <InputText v-model="instanceName" fluid />
      </UiSettingsItem>

      <UiSettingsItem
        icon="Translation"
        icon-color="var(--hb-settings-color-default-language)"
        title="Usage statistics"
        caption="A settings item whose control is a switch"
      >
        <ToggleSwitch v-model="analytics" />
      </UiSettingsItem>

      <UiSettingsItem title="No icon and no caption" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.hb-proof-controls__progress {
  display: flex;
  flex-direction: column;
  gap: var(--cell-gap);
  max-width: calc(var(--cell-size) * 6);
  margin-bottom: var(--cell-gap);
}

.hb-proof-controls__numeric {
  display: flex;
  align-items: center;
  gap: var(--cell-gap);
  margin-bottom: var(--cell-gap);
}

.hb-proof-controls__echo {
  font-size: var(--hb-font-size-caption);
}
</style>
