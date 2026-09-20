<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';

import UiIcon from './UiIcon.vue';

interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** `id` of the input, so a label outside can point at it. */
  inputId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  min: undefined,
  max: undefined,
  step: 1,
  disabled: false,
  inputId: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

/**
 * InputNumber keeps its own interactions inside the bounds but not a value pushed in from
 * outside, and it reports `null` once the field is cleared. Both are clamped here so the model
 * stays a number within the bounds - the Blazor original was generic over `T` and only ever
 * instantiated with `int`.
 */
function onUpdate(value: number | null): void {
  const raw = value ?? props.min ?? 0;
  const clamped = Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, raw));

  if (clamped !== props.modelValue) {
    emit('update:modelValue', clamped);
  }
}
</script>

<template>
  <div class="ui-numeric-group">
    <InputNumber
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :input-id="inputId"
      :allow-empty="false"
      show-buttons
      button-layout="horizontal"
      @update:model-value="onUpdate"
    >
      <template #decrementicon>
        <UiIcon set="windows11-filled" name="Minus" size="small" />
      </template>
      <template #incrementicon>
        <UiIcon set="windows11-filled" name="Plus" size="small" />
      </template>
    </InputNumber>
  </div>
</template>

<style scoped lang="scss">
// The original bolted two outlined secondary icon buttons onto a field with hidden spinners,
// because the MudBlazor spinners stack vertically. PrimeVue lays them out beside the field, so
// only their look has to be brought over.
.ui-numeric-group {
  display: inline-flex;

  --p-inputnumber-button-background: transparent;
  --p-inputnumber-button-color: var(--hb-color-secondary);
  --p-inputnumber-button-border-color: var(--hb-color-secondary);
  --p-inputnumber-button-hover-color: var(--hb-color-secondary-contrast);
  --p-inputnumber-button-hover-background: var(--hb-color-secondary);
  --p-inputnumber-button-active-color: var(--hb-color-secondary-contrast);
  --p-inputnumber-button-active-background: var(--hb-color-secondary);
}
</style>
