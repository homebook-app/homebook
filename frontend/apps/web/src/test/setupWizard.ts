// Test helpers for the setup wizard, only imported by specs
import type { HomeBookClient } from '@homebook/api-client';
import { mountWithPlugins } from '@homebook/test-utils';
import { UiCountdownAlert } from '@homebook/ui';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, type Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { SetupBranch, SetupStepKey } from '@/setup/steps';
import { DEFAULT_SETUP_TIMING, setupTiming } from '@/setup/timing';
import { useSetupStore } from '@/stores/setup';

import { mockBackend } from './backend';

const Target = defineComponent({ render: () => h('div') });

export const wizardRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Target },
  { path: '/Login', name: 'login', component: Target },
  { path: '/Setup', name: 'setup', component: Target },
];

/** No minimum check time and no waiting for a restart; the countdowns are ended by hand. */
export function useFastSetupTiming(): void {
  beforeEach(() => {
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING, {
      minCheckDurationMs: 0,
      restartInitialDelayMs: 0,
      restartIntervalMs: 10,
      restartTimeoutMs: 200,
      finishStageMs: 0,
    });
  });
  afterEach(() => {
    Object.assign(setupTiming, DEFAULT_SETUP_TIMING);
  });
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : DeepPartial<T[K]> };

export interface MountStepOptions {
  backend: DeepPartial<HomeBookClient>;
  branch?: SetupBranch;
  /** The step the wizard stands on, the steps before it count as done. */
  step: SetupStepKey;
  /** Runs against the fresh stores before mounting. */
  prepare?: () => void;
}

/** Mounts a step of the wizard with the wizard standing on it. */
export async function mountStep(component: Component, options: MountStepOptions) {
  const pinia = createPinia();
  setActivePinia(pinia);
  mockBackend(options.backend);

  const setup = useSetupStore();
  setup.reset(options.branch ?? 'install');
  while (setup.currentStep !== options.step) {
    setup.completeStep(setup.currentStep);
  }
  options.prepare?.();

  const mounted = await mountWithPlugins(component, { pinia, routes: wizardRoutes, initialRoute: '/Setup' });
  await flushPromises();
  return { ...mounted, setup };
}

/** Ends the countdown that is shown right now. */
export async function finishCountdown(wrapper: VueWrapper): Promise<void> {
  const countdowns = wrapper.findAllComponents(UiCountdownAlert);
  const countdown = countdowns.at(-1);
  if (countdown === undefined) {
    throw new Error('No countdown is shown');
  }
  countdown.vm.$emit('finished');
  await flushPromises();
}

/** Text of the error message of the step card, if any. */
export function stepError(wrapper: VueWrapper): string | undefined {
  const error = wrapper.find('.hb-setup-step__error .p-message');
  return error.exists() ? error.text() : undefined;
}

/** Text of the countdown of the step card, if any. */
export function stepSuccess(wrapper: VueWrapper): string | undefined {
  const countdown = wrapper.find('.ui-countdown-alert');
  return countdown.exists() ? countdown.text() : undefined;
}
