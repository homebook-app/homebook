import type { CheckDatabaseRequest, GetDatabaseCheckResponse } from '@homebook/api-client';
import { Form, type FormInstance } from '@primevue/forms';
import type { VueWrapper } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import Select from 'primevue/select';

import { useBootstrapStore } from '@/stores/bootstrap';
import { apiError } from '@/test/backend';
import { finishCountdown, mountStep, stepError, stepSuccess, useFastSetupTiming } from '@/test/setupWizard';

import HbSetupDatabaseStep from './HbSetupDatabaseStep.vue';

interface Backend {
  preset?: () => Promise<GetDatabaseCheckResponse | undefined>;
  check?: (body: CheckDatabaseRequest) => Promise<string | undefined>;
  devMode?: boolean;
}

function mountDatabase({
  preset = () => Promise.reject(apiError(404)),
  check = async () => 'POSTGRESQL',
  devMode = false,
}: Backend = {}) {
  const checkSpy = vi.fn(check);
  const mounted = mountStep(HbSetupDatabaseStep, {
    step: 'databaseConfiguration',
    backend: {
      api: { setup: { database: { configuration: { get: vi.fn(preset) }, check: { post: checkSpy } } } } as never,
    },
    prepare: () => {
      useBootstrapStore().devMode = devMode;
    },
  });
  return mounted.then((result) => ({ ...result, checkSpy }));
}

async function fillServer(wrapper: VueWrapper) {
  await wrapper.find('#setup-database-host').setValue('db.local');
  await wrapper.find('#setup-database-name').setValue('homebook');
  await wrapper.find('#setup-database-username').setValue('homebook');
  await wrapper.find('#setup-database-password').setValue('secret');
}

async function submit(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

function providerValues(wrapper: VueWrapper): string[] {
  return (wrapper.findComponent(Select).props('options') as { value: string }[]).map((option) => option.value);
}

describe('HbSetupDatabaseStep', () => {
  useFastSetupTiming();

  it('starts with an empty form and the PostgreSQL port when nothing is preset', async () => {
    const { wrapper } = await mountDatabase();

    expect((wrapper.find('#setup-database-host').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('#setup-database-port').element as HTMLInputElement).value).toBe('5432');
    expect(wrapper.find('.p-message-warn').exists()).toBe(false);
  });

  it('fills the form from the preset of the environment, the port arrives as text', async () => {
    const { wrapper } = await mountDatabase({
      preset: async () => ({
        databaseHost: 'postgres',
        databasePort: '5433',
        databaseName: 'hb',
        databaseUserName: 'hbuser',
        databaseUserPassword: 'pw',
      }),
    });

    expect((wrapper.find('#setup-database-host').element as HTMLInputElement).value).toBe('postgres');
    expect((wrapper.find('#setup-database-port').element as HTMLInputElement).value).toBe('5433');
    expect((wrapper.find('#setup-database-name').element as HTMLInputElement).value).toBe('hb');
  });

  it('warns when the preset cannot be read but keeps the form usable', async () => {
    const { wrapper } = await mountDatabase({ preset: () => Promise.reject(apiError(400)) });

    expect(wrapper.find('.p-message-warn').text()).toBe('setup.database.presetError.message');
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('checks the connection and moves on with the provider the backend found', async () => {
    const { wrapper, setup, checkSpy } = await mountDatabase({ check: async () => 'MYSQL' });

    await fillServer(wrapper);
    await submit(wrapper);

    expect(checkSpy).toHaveBeenCalledWith({
      databaseHost: 'db.local',
      databasePort: 5432,
      databaseName: 'homebook',
      databaseUserName: 'homebook',
      databaseUserPassword: 'secret',
    });
    expect(stepSuccess(wrapper)).toBe('setup.database.provider.messageTemplate');
    expect(wrapper.find('form').exists()).toBe(false);
    expect(setup.currentStep).toBe('databaseConfiguration');

    await finishCountdown(wrapper);

    expect(setup.database).toEqual({
      type: 'MYSQL',
      host: 'db.local',
      port: 5432,
      name: 'homebook',
      username: 'homebook',
      password: 'secret',
    });
    expect(setup.currentStep).toBe('adminUser');
  });

  it('does not check an incomplete form', async () => {
    const { wrapper, checkSpy } = await mountDatabase();

    await submit(wrapper);

    expect(checkSpy).not.toHaveBeenCalled();
    expect(wrapper.findAll('.hb-form-field__error').length).toBeGreaterThan(0);
  });

  it.each([
    [
      'an unreachable database (503)',
      () => Promise.reject(apiError(503)),
      'setup.database.check.notAvailableError.message',
    ],
    ['a server error', () => Promise.reject(apiError(500)), 'setup.database.check.unknownError.message'],
    [
      'an unreachable backend',
      () => Promise.reject(new TypeError('Failed to fetch')),
      'setup.backendConnectionFailed.message',
    ],
    ['an unknown provider', async () => 'ORACLE', 'setup.database.check.notAvailableOrSupportedError.message'],
  ])('reports %s and keeps the form for another try', async (_label, check, message) => {
    const { wrapper, setup } = await mountDatabase({ check: check as () => Promise<string> });

    await fillServer(wrapper);
    await submit(wrapper);

    expect(stepError(wrapper)).toBe(message);
    expect(wrapper.find('form').exists()).toBe(true);
    expect(setup.database).toBeNull();
    expect(setup.stepStates.databaseConfiguration).toBe('error');
  });

  it('follows the default port of the chosen provider', async () => {
    const { wrapper } = await mountDatabase();

    wrapper.findComponent(Select).vm.$emit('change', { value: 'MYSQL' });
    await flushPromises();

    expect((wrapper.find('#setup-database-port').element as HTMLInputElement).value).toBe('3306');
  });

  it('takes a SQLite file without a check, the setup creates it', async () => {
    const { wrapper, setup, checkSpy } = await mountDatabase({ devMode: true });

    (wrapper.findComponent(Form).vm as unknown as FormInstance).setFieldValue('provider', 'SQLITE');
    await flushPromises();
    expect(wrapper.find('#setup-database-host').exists()).toBe(false);
    expect(wrapper.find('.p-message-info').text()).toBe('setup.database.sqliteHint.message');

    await wrapper.find('#setup-database-file').setValue('/var/lib/homebook/homebook.db');
    await submit(wrapper);

    expect(checkSpy).not.toHaveBeenCalled();
    expect(stepSuccess(wrapper)).toBe('setup.database.sqliteSaved.text');
    expect(setup.database).toEqual({ type: 'SQLITE', file: '/var/lib/homebook/homebook.db' });
  });

  it('offers SQLite in developer mode only', async () => {
    expect(providerValues((await mountDatabase()).wrapper)).toEqual(['POSTGRESQL', 'MYSQL']);
    expect(providerValues((await mountDatabase({ devMode: true })).wrapper)).toEqual(['POSTGRESQL', 'MYSQL', 'SQLITE']);
  });
});
