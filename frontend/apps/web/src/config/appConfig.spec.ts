import { AppConfigError, parseAppConfig } from './appConfig';

function validInput(): Record<string, unknown> {
  return {
    Version: '1.0.42',
    Backend: { Host: '/api' },
    FeatureManagement: { WidgetMenu: false },
    Upload: { MaxFileSizeBytes: 20971520 },
  };
}

function expectInvalid(input: unknown, path: string): void {
  let thrown: unknown;
  try {
    parseAppConfig(input);
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(AppConfigError);
  expect((thrown as AppConfigError).kind).toBe('invalid');
  expect((thrown as AppConfigError).message).toContain(path);
}

describe('parseAppConfig', () => {
  it('maps a valid file to the typed configuration', () => {
    expect(parseAppConfig(validInput())).toEqual({
      version: '1.0.42',
      backendHost: '/api',
      features: { widgetMenu: false },
      upload: { maxFileSizeBytes: 20971520 },
    });
  });

  it('tolerates unknown keys', () => {
    const input = { ...validInput(), Logging: { Level: 'Debug' } };

    expect(parseAppConfig(input).version).toBe('1.0.42');
  });

  it('returns a frozen object', () => {
    const config = parseAppConfig(validInput());

    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.features)).toBe(true);
    expect(Object.isFrozen(config.upload)).toBe(true);
  });

  it.each([null, undefined, 'text', 42, []])('rejects the non-object root %j', (input) => {
    expectInvalid(input, 'root');
  });

  it.each([
    ['Version', { Version: undefined }],
    ['Version', { Version: '' }],
    ['Version', { Version: 1 }],
    ['Backend', { Backend: undefined }],
    ['Backend', { Backend: '/api' }],
    ['Backend.Host', { Backend: {} }],
    ['Backend.Host', { Backend: { Host: '' } }],
    ['FeatureManagement', { FeatureManagement: null }],
    ['FeatureManagement.WidgetMenu', { FeatureManagement: { WidgetMenu: 'false' } }],
    ['Upload', { Upload: [] }],
    ['Upload.MaxFileSizeBytes', { Upload: {} }],
    ['Upload.MaxFileSizeBytes', { Upload: { MaxFileSizeBytes: '20971520' } }],
    ['Upload.MaxFileSizeBytes', { Upload: { MaxFileSizeBytes: 0 } }],
    ['Upload.MaxFileSizeBytes', { Upload: { MaxFileSizeBytes: -1 } }],
    ['Upload.MaxFileSizeBytes', { Upload: { MaxFileSizeBytes: 1.5 } }],
  ])('rejects an invalid "%s" (%j)', (path, override) => {
    expectInvalid({ ...validInput(), ...override }, path);
  });
});
