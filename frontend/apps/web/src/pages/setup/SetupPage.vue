<script setup lang="ts">
import { UiStripeBackground, usePageTitle } from '@homebook/ui';
import Step from 'primevue/step';
import StepList from 'primevue/steplist';
import Stepper from 'primevue/stepper';
import { defineAsyncComponent, nextTick, onUnmounted, shallowRef, useTemplateRef, watch, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useAppConfig } from '@/composables/useAppConfig';
import { RouteNames } from '@/router/routes';
import { stepTitleKey, type SetupStepKey } from '@/setup/steps';
import { delay, setupTiming } from '@/setup/timing';
import { useBootstrapStore } from '@/stores/bootstrap';
import { useSetupStore } from '@/stores/setup';

// Each step is its own component with the shared step interface, see useSetupStep
const stepComponents: Record<SetupStepKey, Component> = {
  backendConnection: defineAsyncComponent(() => import('./steps/HbSetupConnectionStep.vue')),
  licenseAgreement: defineAsyncComponent(() => import('./steps/HbSetupLicenseStep.vue')),
  databaseConfiguration: defineAsyncComponent(() => import('./steps/HbSetupDatabaseStep.vue')),
  adminUser: defineAsyncComponent(() => import('./steps/HbSetupAdminStep.vue')),
  configuration: defineAsyncComponent(() => import('./steps/HbSetupConfigurationStep.vue')),
  setupProcess: defineAsyncComponent(() => import('./steps/HbSetupProcessStep.vue')),
  updateProcess: defineAsyncComponent(() => import('./steps/HbSetupUpdateStep.vue')),
};

const { t } = useI18n();
const router = useRouter();
const bootstrap = useBootstrapStore();
const setup = useSetupStore();
const config = useAppConfig();

usePageTitle(() => t('setup.title'));

// The guard only lets the page open while a setup or an update is due; start the matching branch
setup.reset(bootstrap.status === 'updateRequired' ? 'update' : 'install');

/**
 * The closing animation of the Blazor wizard: the card fades (1), glowing tiles appear and fly
 * apart (2), the background fades (3), then the login opens.
 */
const finishStage = shallowRef(0);
const leaving = new AbortController();

async function leave(): Promise<void> {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (!reducedMotion) {
    for (const stage of [1, 2, 3]) {
      finishStage.value = stage;
      await delay(setupTiming.finishStageMs, leaving.signal);
    }
  }
  if (leaving.signal.aborted) {
    return;
  }
  // The backend is operational now, the guard must stop sending everything here
  await bootstrap.retry();
  await router.replace({ name: RouteNames.login });
}

watch(
  () => setup.finished,
  (finished) => {
    if (finished) {
      void leave();
    }
  },
);

onUnmounted(() => leaving.abort());

// On small screens the step list runs across and scrolls; keep the active step in sight
const stepList = useTemplateRef<HTMLElement>('stepList');
watch(
  () => setup.currentIndex,
  async () => {
    await nextTick();
    stepList.value?.querySelector('.p-step-active')?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  },
);

function stepClass(key: SetupStepKey): Record<string, boolean> {
  const state = setup.stepStates[key];
  return {
    'hb-setup__step--done': state === 'done' || state === 'skipped',
    'hb-setup__step--error': state === 'error',
  };
}
</script>

<template>
  <UiStripeBackground class="hb-setup__background" :class="{ 'is-finished': finishStage >= 3 }" scheme="release" />
  <div class="hb-setup__tiles" :class="{ 'is-visible': finishStage >= 1, 'is-finished': finishStage >= 2 }">
    <div class="hb-setup__tiles-grid" aria-hidden="true">
      <div v-for="tile in 4" :key="tile" class="hb-setup__tile" />
    </div>
  </div>

  <div class="hb-setup" :class="{ 'is-finished': finishStage >= 1 }">
    <section class="hb-setup__card frosted-b1">
      <header class="hb-setup__header">
        <h1 class="hb-setup__title">{{ t('setup.title') }}</h1>
      </header>

      <div class="hb-setup__body">
        <nav ref="stepList" class="hb-setup__steps frosted-b1" :aria-label="t('setup.title')">
          <Stepper :value="setup.currentIndex + 1" linear>
            <StepList>
              <Step
                v-for="(key, index) in setup.steps"
                :key="key"
                :value="index + 1"
                class="hb-setup__step"
                :class="stepClass(key)"
              >
                {{ t(stepTitleKey(key)) }}
              </Step>
            </StepList>
          </Stepper>
        </nav>

        <div class="hb-setup__content">
          <component :is="stepComponents[setup.currentStep]" :key="`${setup.branch}-${setup.currentStep}`" />
        </div>
      </div>

      <footer class="hb-setup__footer ui-text-caption">
        <span>{{ t('appTitle') }}</span>
        <span>{{ t('setup.cardActions.version') }}: {{ config.version }}</span>
        <span>{{ t('setup.cardActions.server') }}: {{ config.backendHost }}</span>
        <span>
          {{ t('authorMadeWithText') }}
          <a class="hb-setup__author" :href="t('authorLink')" target="_blank" rel="noopener">{{ t('authorName') }}</a>
        </span>
      </footer>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hb-setup__background {
  position: fixed;
  inset: 0;
  z-index: -100;
  transition: opacity 2s ease;

  &.is-finished {
    opacity: 0;
  }
}

.hb-setup__tiles {
  position: fixed;
  inset: 0;
  z-index: -90;
  overflow: hidden;
  opacity: 0;
  transition: opacity 4s ease;
  pointer-events: none;

  &.is-visible {
    opacity: 1;
  }
}

.hb-setup__tiles-grid {
  position: absolute;
  top: -25vh;
  left: -25vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 150vw;
  height: 150vh;
  transform: rotate(10deg);
}

.hb-setup__tile {
  background: radial-gradient(ellipse at center, var(--hb-setup-tile-glow) 0%, transparent 75%);
  transition: transform 6s ease;
}

.hb-setup__tiles.is-finished .hb-setup__tile {
  &:nth-child(1) {
    transform: translate(-200vw, -200px);
  }

  &:nth-child(2) {
    transform: translate(200px, -200vh);
  }

  &:nth-child(3) {
    transform: translate(-200px, 200vh);
  }

  &:nth-child(4) {
    transform: translate(200vw, 200px);
  }
}

.hb-setup {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: var(--hb-space-4);
  transition: opacity 3s ease;

  @include media-up(sm) {
    padding: var(--hb-content-only-offset) var(--hb-space-6);
  }

  &.is-finished {
    opacity: 0;
  }
}

.hb-setup__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: $breakpoint-lg;
  border-radius: var(--hb-border-radius-default);
  color: var(--hb-text-primary);
}

.hb-setup__header {
  padding: var(--hb-card-header-padding);
}

.hb-setup__title {
  margin: 0;
}

.hb-setup__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  flex: 1;
  gap: var(--hb-space-4);
  padding: var(--hb-card-content-padding);

  @include media-up(md) {
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    align-items: start;
  }
}

.hb-setup__steps {
  border-radius: var(--hb-border-radius-default);
  padding: var(--hb-space-3);
  overflow-x: auto;
}

.hb-setup__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hb-space-1) var(--hb-space-5);
  padding: var(--hb-space-2) var(--hb-space-5);
  border-radius: 0 0 var(--hb-border-radius-default) var(--hb-border-radius-default);
  background: var(--hb-color-primary);
  color: var(--hb-color-primary-contrast);
}

.hb-setup__author {
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .hb-setup,
  .hb-setup__background,
  .hb-setup__tiles,
  .hb-setup__tile {
    transition: none;
  }
}

// The step list stands on its own, nobody clicks through it; below md it runs across, above it
// runs down beside the step
@layer hb {
  .hb-setup__steps :deep(.p-stepper) {
    --p-stepper-step-header-padding: var(--hb-space-1);
  }

  .hb-setup__steps :deep(.p-step-header) {
    cursor: default;
  }

  .hb-setup__steps :deep(.hb-setup__step--done .p-step-number) {
    background: var(--hb-color-primary);
    color: var(--hb-color-primary-contrast);
  }

  // A finished step is not a pending one: PrimeVue dims every step but the active one
  .hb-setup__steps :deep(.hb-setup__step--done) {
    opacity: 1;
  }

  .hb-setup__steps :deep(.hb-setup__step--done .p-step-title) {
    color: var(--p-stepper-step-title-active-color);
  }

  .hb-setup__steps :deep(.hb-setup__step--error .p-step-number) {
    background: var(--p-form-field-invalid-placeholder-color);
    color: var(--hb-color-primary-contrast);
  }

  @include media-up(md) {
    .hb-setup__steps :deep(.p-steplist) {
      flex-direction: column;
      align-items: stretch;
    }

    .hb-setup__steps :deep(.p-step) {
      flex-direction: column;
      align-items: flex-start;
    }

    .hb-setup__steps :deep(.p-stepper-separator) {
      flex: none;
      width: var(--p-stepper-separator-size);
      min-height: var(--hb-space-4);
      margin-inline-start: var(--hb-space-5);
    }
  }
}
</style>
