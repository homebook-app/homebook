import type { FormResolverOptions } from '@primevue/forms';

import { message, type Message } from './messages';

/** Checks one field. `undefined` when the value passes. */
export type Rule = (value: unknown, values: Record<string, unknown>) => Message | undefined;

export type Rules = Record<string, readonly Rule[]>;

/** The error shape `@primevue/forms` expects, the message stays a key until it is rendered. */
export interface FieldError extends Message {
  message: string;
}

export interface ResolverResult {
  values: Record<string, unknown>;
  errors: Record<string, FieldError[]>;
}

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export const required: Rule = (value) => (text(value).trim() === '' ? message('validation.required') : undefined);

export function minLength(min: number): Rule {
  return (value) => {
    const length = text(value).length;
    return length > 0 && length < min ? message('validation.minLength', { min }) : undefined;
  };
}

export function maxLength(max: number): Rule {
  return (value) => (text(value).length > max ? message('validation.maxLength', { max }) : undefined);
}

export function pattern(expression: RegExp, key: string): Rule {
  return (value) => {
    const current = text(value);
    return current !== '' && !expression.test(current) ? message(key) : undefined;
  };
}

export function range(min: number, max: number): Rule {
  return (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    const number = typeof value === 'number' ? value : Number(value);
    return !Number.isInteger(number) || number < min || number > max
      ? message('validation.range', { min, max })
      : undefined;
  };
}

/** The value has to repeat the one of another field, e.g. a password confirmation. */
export function sameAs(field: string, key: string): Rule {
  return (value, values) => (text(value) !== text(values[field]) ? message(key) : undefined);
}

/** Only applies `rules` while `condition` holds for the whole form. */
export function when(condition: (values: Record<string, unknown>) => boolean, rules: readonly Rule[]): Rule[] {
  return rules.map((rule) => (value, values) => (condition(values) ? rule(value, values) : undefined));
}

/**
 * The characters allowed in the administrator password, as listed in `README.md`:
 * letters, digits and `!@#$%^&*()_+-=[]{}|;':",./<>?~` plus the backtick.
 */
export const PASSWORD_CHARACTERS = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",./<>?~`]$/;

/** Rejects characters outside {@link PASSWORD_CHARACTERS} and names them in the message. */
export const passwordCharacters: Rule = (value) => {
  const invalid = [...new Set([...text(value)].filter((character) => !PASSWORD_CHARACTERS.test(character)))];
  if (invalid.length === 0) return undefined;
  const characters = invalid.map((character) => (character.trim() === '' ? '␣' : character)).join(' ');
  return message('validation.passwordCharacters', { characters });
};

/** Builds a resolver for `@primevue/forms` from the rules of each field. */
export function createResolver(rules: Rules) {
  return ({ values }: Pick<FormResolverOptions, 'values'>): ResolverResult => {
    const errors: Record<string, FieldError[]> = {};
    for (const [field, fieldRules] of Object.entries(rules)) {
      const failures = fieldRules
        .map((rule) => rule(values[field], values))
        .filter((failure): failure is Message => failure !== undefined)
        .map((failure) => ({ ...failure, message: failure.key }));
      if (failures.length > 0) {
        errors[field] = failures;
      }
    }
    return { values, errors };
  };
}

/** Narrows the first error of a form field state to the shape {@link createResolver} produced. */
export function fieldError(state: { error?: unknown } | undefined): FieldError | undefined {
  const error = state?.error;
  return typeof error === 'object' && error !== null && typeof (error as FieldError).key === 'string'
    ? (error as FieldError)
    : undefined;
}

// Username of an account, as the backend's UserValidator checks it when the user is created
export const USERNAME_MIN_LENGTH = 5;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

// The backend's user management demands at least 8 characters, the setup does not check at all
export const ADMIN_PASSWORD_MIN_LENGTH = 8;

// Sign-in. The backend does not enforce any length; anything shorter cannot belong to an account
export const LOGIN_USERNAME_MIN_LENGTH = 5;
export const LOGIN_PASSWORD_MIN_LENGTH = 5;

export const loginRules: Rules = {
  username: [required, minLength(LOGIN_USERNAME_MIN_LENGTH)],
  password: [required, minLength(LOGIN_PASSWORD_MIN_LENGTH)],
};

export const adminRules: Rules = {
  username: [
    required,
    minLength(USERNAME_MIN_LENGTH),
    maxLength(USERNAME_MAX_LENGTH),
    pattern(USERNAME_PATTERN, 'validation.usernameCharacters'),
  ],
  password: [required, minLength(ADMIN_PASSWORD_MIN_LENGTH), maxLength(255), passwordCharacters],
  passwordConfirm: [required, sameAs('password', 'validation.passwordMismatch')],
};

const isServerDatabase = (values: Record<string, unknown>) => values.provider !== 'SQLITE';

export const databaseRules: Rules = {
  provider: [required],
  host: when(isServerDatabase, [required, maxLength(255)]),
  port: when(isServerDatabase, [required, range(1, 65535)]),
  databaseName: when(isServerDatabase, [required, maxLength(64)]),
  username: when(isServerDatabase, [required, maxLength(64)]),
  password: when(isServerDatabase, [required, maxLength(255)]),
  databaseFile: when((values) => !isServerDatabase(values), [required, maxLength(255)]),
};

export const configurationRules: Rules = {
  // The backend's ConfigurationValidator allows up to 100 characters
  instanceName: [required, maxLength(100)],
  defaultLocale: [required],
};
