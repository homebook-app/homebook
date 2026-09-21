<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { translateMessage, type Message } from '@/setup/messages';

interface Props {
  /** Id of the input inside, the label points at it. */
  inputId: string;
  label: string;
  helperText?: string;
  /** Replaces the helper text while it is set. */
  error?: Message;
}

const props = withDefaults(defineProps<Props>(), { helperText: undefined, error: undefined });

const { t } = useI18n();

const errorText = computed(() => (props.error === undefined ? undefined : translateMessage(t, props.error)));
/** For `aria-describedby` on the input. */
const describedBy = computed(() => {
  if (errorText.value !== undefined) return `${props.inputId}-error`;
  return props.helperText === undefined ? undefined : `${props.inputId}-help`;
});
</script>

<template>
  <div class="hb-form-field" :class="{ 'hb-form-field--invalid': errorText !== undefined }">
    <label class="hb-form-field__label" :for="inputId">{{ label }}</label>
    <slot :described-by="describedBy" :invalid="errorText !== undefined" />
    <small v-if="errorText !== undefined" :id="`${inputId}-error`" class="hb-form-field__error">
      {{ errorText }}
    </small>
    <small v-else-if="helperText !== undefined" :id="`${inputId}-help`" class="hb-form-field__help">
      {{ helperText }}
    </small>
  </div>
</template>

<style scoped lang="scss">
.hb-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-1);
  min-width: 0;
}

.hb-form-field__help,
.hb-form-field__error {
  font-size: var(--hb-font-size-caption);
  line-height: var(--hb-line-height-caption);
}

.hb-form-field__help {
  color: var(--hb-text-secondary);
}

.hb-form-field__error {
  color: var(--p-form-field-invalid-placeholder-color);
}
</style>
