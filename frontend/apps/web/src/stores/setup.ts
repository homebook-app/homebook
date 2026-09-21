import type { StartSetupRequest } from '@homebook/api-client';
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';

import { stepsOf, type SetupBranch, type SetupStepKey } from '@/setup/steps';

export type DatabaseProvider = 'POSTGRESQL' | 'MYSQL' | 'SQLITE';

export const DATABASE_PROVIDERS: readonly DatabaseProvider[] = ['POSTGRESQL', 'MYSQL', 'SQLITE'];

/** The value of `POST /setup/database/check` as a provider, `undefined` for anything else. */
export function parseDatabaseProvider(value: unknown): DatabaseProvider | undefined {
  const upper = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return DATABASE_PROVIDERS.find((provider) => provider === upper);
}

export interface ServerDatabaseSettings {
  type: Exclude<DatabaseProvider, 'SQLITE'>;
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

export interface SqliteDatabaseSettings {
  type: 'SQLITE';
  file: string;
}

export type DatabaseSettings = ServerDatabaseSettings | SqliteDatabaseSettings;

export interface AdminSettings {
  username: string;
  password: string;
}

export interface ConfigurationSettings {
  instanceName: string;
  defaultLocale: string;
}

/** `done` and `skipped` are final, `error` clears as soon as the step tries again. */
export type SetupStepState = 'done' | 'skipped' | 'error';

function nonEmpty(value: string): string | undefined {
  return value.trim() === '' ? undefined : value;
}

/**
 * The state of the setup wizard: the branch, where it stands, and what the steps collected. Held
 * in memory only - a reload starts over, just like the Blazor wizard did. Steps that the
 * environment variables preconfigure collect nothing; the backend falls back to those variables
 * for every field the request leaves out.
 */
export const useSetupStore = defineStore('setup', () => {
  const branch = shallowRef<SetupBranch>('install');
  const currentIndex = shallowRef(0);
  const stepStates = ref<Partial<Record<SetupStepKey, SetupStepState>>>({});
  /** Set by the last step, the page plays the closing animation and leaves. */
  const finished = shallowRef(false);

  const licensesAccepted = shallowRef(false);
  const database = shallowRef<DatabaseSettings | null>(null);
  const admin = shallowRef<AdminSettings | null>(null);
  const configuration = shallowRef<ConfigurationSettings | null>(null);

  const steps = computed(() => stepsOf(branch.value));
  const currentStep = computed<SetupStepKey>(() => steps.value[currentIndex.value] ?? steps.value[0]!);

  /** Starts over, e.g. when the page is opened again. */
  function reset(next: SetupBranch = 'install'): void {
    branch.value = next;
    currentIndex.value = 0;
    stepStates.value = {};
    finished.value = false;
    licensesAccepted.value = false;
    database.value = null;
    admin.value = null;
    configuration.value = null;
  }

  /** Only the first step decides the branch, later steps would lose their place. */
  function setBranch(next: SetupBranch): void {
    if (currentIndex.value === 0) {
      branch.value = next;
    }
  }

  /** Marks the current step and moves on. A call for any other step is stale and ignored. */
  function completeStep(key: SetupStepKey, options: { skipped?: boolean } = {}): void {
    if (key !== currentStep.value) {
      return;
    }
    stepStates.value = { ...stepStates.value, [key]: options.skipped === true ? 'skipped' : 'done' };
    if (currentIndex.value < steps.value.length - 1) {
      currentIndex.value += 1;
    }
  }

  function failStep(key: SetupStepKey): void {
    stepStates.value = { ...stepStates.value, [key]: 'error' };
  }

  function clearError(key: SetupStepKey): void {
    if (stepStates.value[key] === 'error') {
      const next = { ...stepStates.value };
      delete next[key];
      stepStates.value = next;
    }
  }

  function finish(): void {
    finished.value = true;
  }

  /** The body of `POST /setup/start`. Empty values are left out, the backend uses its environment. */
  const startRequest = computed<StartSetupRequest>(() => {
    const request: StartSetupRequest = { licensesAccepted: licensesAccepted.value };
    const db = database.value;
    if (db?.type === 'SQLITE') {
      request.databaseType = db.type;
      request.databaseFile = nonEmpty(db.file);
    } else if (db !== null) {
      request.databaseType = db.type;
      request.databaseHost = nonEmpty(db.host);
      request.databasePort = db.port > 0 ? db.port : undefined;
      request.databaseName = nonEmpty(db.name);
      request.databaseUserName = nonEmpty(db.username);
      request.databaseUserPassword = nonEmpty(db.password);
    }
    if (admin.value !== null) {
      request.homebookUserName = nonEmpty(admin.value.username);
      request.homebookUserPassword = nonEmpty(admin.value.password);
    }
    if (configuration.value !== null) {
      request.homebookConfigurationName = nonEmpty(configuration.value.instanceName);
      request.homebookConfigurationDefaultLocale = nonEmpty(configuration.value.defaultLocale);
    }
    return Object.fromEntries(Object.entries(request).filter(([, value]) => value !== undefined)) as StartSetupRequest;
  });

  return {
    branch,
    currentIndex,
    stepStates,
    finished,
    licensesAccepted,
    database,
    admin,
    configuration,
    steps,
    currentStep,
    startRequest,
    reset,
    setBranch,
    completeStep,
    failStep,
    clearError,
    finish,
  };
});
