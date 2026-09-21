<script setup lang="ts">
import { UiIcon } from '@homebook/ui';
import Button from 'primevue/button';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  /** Why the app cannot start. */
  reason: 'unreachable' | 'setupRunning';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  retry: [];
}>();

const { t } = useI18n();

const title = computed(() => t(`boot.${props.reason}.title`));
const text = computed(() => t(`boot.${props.reason}.text`));
</script>

<template>
  <main class="hb-boot-error">
    <section class="hb-boot-error__card frosted-b8" role="alert">
      <UiIcon set="windows11-outline" name="Unavailable" size="large" class="hb-boot-error__icon" />
      <h1 class="ui-text-title">{{ title }}</h1>
      <p>{{ text }}</p>
      <Button :label="t('boot.retry')" @click="emit('retry')" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.hb-boot-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--hb-space-4);
}

.hb-boot-error__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--hb-space-3);
  max-width: 28rem;
  padding: var(--hb-space-8) var(--hb-space-6);
  border-radius: var(--hb-border-radius-default);
  text-align: center;

  h1,
  p {
    margin: 0;
  }
}

.hb-boot-error__icon {
  color: var(--hb-color-primary);
}
</style>
