/** Runtime configuration, read from `/appsettings.json` before the app mounts. */
export interface AppConfig {
  readonly version: string;
  /** Base URL of the backend, `/api` behind nginx and behind the dev proxy. */
  readonly backendHost: string;
  readonly features: {
    readonly widgetMenu: boolean;
  };
  readonly upload: {
    readonly maxFileSizeBytes: number;
  };
}

export type AppConfigErrorKind = 'network' | 'http' | 'parse' | 'invalid';

/** Raised when `appsettings.json` cannot be loaded or does not have the expected shape. */
export class AppConfigError extends Error {
  readonly kind: AppConfigErrorKind;

  constructor(kind: AppConfigErrorKind, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AppConfigError';
    this.kind = kind;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalid(path: string, expected: string): AppConfigError {
  return new AppConfigError('invalid', `appsettings.json: "${path}" must be ${expected}`);
}

function readSection(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = parent[key];
  if (!isRecord(value)) {
    throw invalid(key, 'an object');
  }
  return value;
}

function readString(parent: Record<string, unknown>, key: string, path: string): string {
  const value = parent[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw invalid(path, 'a non-empty string');
  }
  return value;
}

/**
 * Validates the raw content of `appsettings.json` and maps it to {@link AppConfig}.
 *
 * The file keeps its PascalCase keys because the release workflow stamps the version into
 * the `"Version"` line with `sed`. Unknown keys are tolerated.
 */
export function parseAppConfig(input: unknown): AppConfig {
  if (!isRecord(input)) {
    throw new AppConfigError('invalid', 'appsettings.json: the root must be an object');
  }

  const version = readString(input, 'Version', 'Version');
  const backendHost = readString(readSection(input, 'Backend'), 'Host', 'Backend.Host');

  const widgetMenu = readSection(input, 'FeatureManagement').WidgetMenu;
  if (typeof widgetMenu !== 'boolean') {
    throw invalid('FeatureManagement.WidgetMenu', 'a boolean');
  }

  const maxFileSizeBytes = readSection(input, 'Upload').MaxFileSizeBytes;
  if (typeof maxFileSizeBytes !== 'number' || !Number.isSafeInteger(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
    throw invalid('Upload.MaxFileSizeBytes', 'a positive integer');
  }

  return Object.freeze({
    version,
    backendHost,
    features: Object.freeze({ widgetMenu }),
    upload: Object.freeze({ maxFileSizeBytes }),
  });
}
