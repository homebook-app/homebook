import { INSTALL_STEPS, stepsOf, stepTitleKey, toUiLicenses, UPDATE_STEPS } from './steps';

describe('setup steps', () => {
  it('keeps the order of the Blazor SetupService', () => {
    expect(stepsOf('install')).toEqual([
      'backendConnection',
      'licenseAgreement',
      'databaseConfiguration',
      'adminUser',
      'configuration',
      'setupProcess',
    ]);
    expect(stepsOf('update')).toEqual(['backendConnection', 'updateProcess']);
    expect(stepsOf('install')).toBe(INSTALL_STEPS);
    expect(stepsOf('update')).toBe(UPDATE_STEPS);
  });

  it('takes the titles from the migrated step list keys', () => {
    expect(stepTitleKey('adminUser')).toBe('uiSetupStepper.adminUserSetupStep.title');
    expect(stepTitleKey('updateProcess')).toBe('uiSetupStepper.updateProcessSetupStep.title');
  });
});

describe('toUiLicenses', () => {
  it('maps the content to HTML, drops nameless entries and sorts by name', () => {
    expect(
      toUiLicenses([
        { name: 'vue', content: '<p>MIT</p>' },
        { name: '', content: 'x' },
        { name: 'Microsoft__Extensions', content: null },
      ]),
    ).toEqual([
      { name: 'Microsoft__Extensions', htmlContent: '' },
      { name: 'vue', htmlContent: '<p>MIT</p>' },
    ]);
  });

  it('copes with a missing list', () => {
    expect(toUiLicenses(undefined)).toEqual([]);
  });
});
