import { createPinia, setActivePinia } from 'pinia';

import { parseDatabaseProvider, useSetupStore } from './setup';

describe('setup store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts at the first step of the installation', () => {
    const setup = useSetupStore();

    expect(setup.branch).toBe('install');
    expect(setup.currentStep).toBe('backendConnection');
    expect(setup.steps).toHaveLength(6);
  });

  it('walks through the steps and stays on the last one', () => {
    const setup = useSetupStore();

    for (const key of setup.steps) {
      setup.completeStep(key);
    }

    expect(setup.currentStep).toBe('setupProcess');
    expect(setup.stepStates.setupProcess).toBe('done');
  });

  it('ignores a completion for a step that is not current', () => {
    const setup = useSetupStore();

    setup.completeStep('adminUser');

    expect(setup.currentStep).toBe('backendConnection');
    expect(setup.stepStates).toEqual({});
  });

  it('remembers skipped steps', () => {
    const setup = useSetupStore();

    setup.completeStep('backendConnection');
    setup.completeStep('licenseAgreement', { skipped: true });

    expect(setup.stepStates).toEqual({ backendConnection: 'done', licenseAgreement: 'skipped' });
  });

  it('switches to the update branch on the first step only', () => {
    const setup = useSetupStore();

    setup.setBranch('update');
    expect(setup.steps).toEqual(['backendConnection', 'updateProcess']);

    setup.completeStep('backendConnection');
    setup.setBranch('install');
    expect(setup.branch).toBe('update');
    expect(setup.currentStep).toBe('updateProcess');
  });

  it('marks and clears errors', () => {
    const setup = useSetupStore();

    setup.failStep('backendConnection');
    expect(setup.stepStates.backendConnection).toBe('error');

    setup.clearError('backendConnection');
    expect(setup.stepStates.backendConnection).toBeUndefined();
  });

  it('keeps a final state when clearing errors', () => {
    const setup = useSetupStore();

    setup.completeStep('backendConnection');
    setup.clearError('backendConnection');

    expect(setup.stepStates.backendConnection).toBe('done');
  });

  it('starts over on reset', () => {
    const setup = useSetupStore();
    setup.completeStep('backendConnection');
    setup.licensesAccepted = true;
    setup.finish();

    setup.reset('update');

    expect(setup.branch).toBe('update');
    expect(setup.currentIndex).toBe(0);
    expect(setup.stepStates).toEqual({});
    expect(setup.licensesAccepted).toBe(false);
    expect(setup.finished).toBe(false);
  });

  describe('startRequest', () => {
    it('only carries the license consent while everything else is preconfigured', () => {
      const setup = useSetupStore();
      setup.licensesAccepted = true;

      expect(setup.startRequest).toEqual({ licensesAccepted: true });
    });

    it('carries everything the steps collected', () => {
      const setup = useSetupStore();
      setup.licensesAccepted = true;
      setup.database = {
        type: 'POSTGRESQL',
        host: 'db',
        port: 5432,
        name: 'homebook',
        username: 'homebook',
        password: 'secret',
      };
      setup.admin = { username: 'admin', password: 'S3cure!pw' };
      setup.configuration = { instanceName: 'Home', defaultLocale: 'de-DE' };

      expect(setup.startRequest).toEqual({
        licensesAccepted: true,
        databaseType: 'POSTGRESQL',
        databaseHost: 'db',
        databasePort: 5432,
        databaseName: 'homebook',
        databaseUserName: 'homebook',
        databaseUserPassword: 'secret',
        homebookUserName: 'admin',
        homebookUserPassword: 'S3cure!pw',
        homebookConfigurationName: 'Home',
        homebookConfigurationDefaultLocale: 'de-DE',
      });
    });

    it('sends only type and file for SQLite', () => {
      const setup = useSetupStore();
      setup.database = { type: 'SQLITE', file: '/var/lib/homebook/homebook.db' };

      expect(setup.startRequest).toEqual({
        licensesAccepted: false,
        databaseType: 'SQLITE',
        databaseFile: '/var/lib/homebook/homebook.db',
      });
    });

    it('leaves out empty values so the backend falls back to its environment', () => {
      const setup = useSetupStore();
      setup.database = { type: 'MYSQL', host: ' ', port: 0, name: '', username: '', password: '' };

      expect(setup.startRequest).toEqual({ licensesAccepted: false, databaseType: 'MYSQL' });
    });
  });
});

describe('parseDatabaseProvider', () => {
  it('accepts the provider names in any case', () => {
    expect(parseDatabaseProvider('POSTGRESQL')).toBe('POSTGRESQL');
    expect(parseDatabaseProvider(' mysql ')).toBe('MYSQL');
    expect(parseDatabaseProvider('MARIADB')).toBeUndefined();
    expect(parseDatabaseProvider(undefined)).toBeUndefined();
  });
});
