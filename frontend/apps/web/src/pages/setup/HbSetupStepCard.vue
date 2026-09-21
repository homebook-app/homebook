<script setup lang="ts">
import { UiCountdownAlert } from '@homebook/ui';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { translateMessage, type Message as StepMessage } from '@/setup/messages';
import { setupTiming } from '@/setup/timing';

interface Props {
  title: string;
  busy?: boolean;
  error?: StepMessage;
  /** Shown as a countdown; `finished` fires when it runs out. */
  success?: StepMessage;
  /** Label of the button next to the error, no button without it. */
  retryLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  busy: false,
  error: undefined,
  success: undefined,
  retryLabel: undefined,
});

const emit = defineEmits<{
  finished: [];
  retry: [];
}>();

const { t } = useI18n();

const errorText = computed(() => (props.error === undefined ? undefined : translateMessage(t, props.error)));
const successText = computed(() => (props.success === undefined ? undefined : translateMessage(t, props.success)));
</script>

<template>
  <section class="hb-setup-step frosted-b3" :aria-busy="busy">
    <header class="hb-setup-step__header">
      <h2 class="hb-setup-step__title">{{ title }}</h2>
    </header>

    <div class="hb-setup-step__content">
      <ProgressBar v-if="busy" mode="indeterminate" class="hb-setup-step__progress" />

      <UiCountdownAlert
        v-if="successText !== undefined"
        severity="info"
        :duration="setupTiming.countdownMs"
        @finished="emit('finished')"
      >
        {{ successText }}
      </UiCountdownAlert>

      <slot />

      <div v-if="errorText !== undefined" class="hb-setup-step__error">
        <Message severity="error" :closable="false">{{ errorText }}</Message>
        <Button
          v-if="retryLabel !== undefined"
          class="hb-setup-step__retry"
          :label="retryLabel"
          :disabled="busy"
          @click="emit('retry')"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hb-setup-step {
  border-radius: var(--hb-border-radius-default);
  color: var(--hb-text-primary);
}

.hb-setup-step__header {
  padding: var(--hb-card-header-padding);
}

.hb-setup-step__title {
  margin: 0;
  font-size: var(--hb-font-size-value);
  font-weight: var(--hb-font-weight-value);
  line-height: var(--hb-line-height-value);
}

.hb-setup-step__content {
  display: flex;
  flex-direction: column;
  gap: var(--hb-space-4);
  padding: var(--hb-card-content-padding);
}

.hb-setup-step__progress {
  --p-progressbar-height: var(--hb-progress-size-sm);

  margin-block: var(--hb-space-7);
}

.hb-setup-step__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--hb-space-3);
}
</style>
