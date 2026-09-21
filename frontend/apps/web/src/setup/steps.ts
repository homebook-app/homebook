import type { DependencyLicense } from '@homebook/api-client';
import type { UiLicense } from '@homebook/ui';

export type SetupStepKey =
  | 'backendConnection'
  | 'licenseAgreement'
  | 'databaseConfiguration'
  | 'adminUser'
  | 'configuration'
  | 'setupProcess'
  | 'updateProcess';

/** First installation or update of an existing one, decided by `GET /setup/availability`. */
export type SetupBranch = 'install' | 'update';

// The order of the Blazor SetupService, step by step
export const INSTALL_STEPS: readonly SetupStepKey[] = [
  'backendConnection',
  'licenseAgreement',
  'databaseConfiguration',
  'adminUser',
  'configuration',
  'setupProcess',
];

export const UPDATE_STEPS: readonly SetupStepKey[] = ['backendConnection', 'updateProcess'];

export function stepsOf(branch: SetupBranch): readonly SetupStepKey[] {
  return branch === 'install' ? INSTALL_STEPS : UPDATE_STEPS;
}

/** Catalog key of the title in the step list. */
export function stepTitleKey(key: SetupStepKey): string {
  return `uiSetupStepper.${key}SetupStep.title`;
}

/** The licenses of `GET /setup/licenses` in the shape of the license dialog, sorted by name. */
export function toUiLicenses(licenses: readonly DependencyLicense[] | null | undefined): UiLicense[] {
  return (licenses ?? [])
    .map((license) => ({ name: license.name ?? '', htmlContent: license.content ?? '' }))
    .filter((license) => license.name !== '')
    .sort((a, b) => a.name.localeCompare(b.name));
}
