import {
  adminRules,
  configurationRules,
  createResolver,
  databaseRules,
  fieldError,
  loginRules,
  maxLength,
  minLength,
  passwordCharacters,
  pattern,
  range,
  required,
  sameAs,
  when,
} from './validation';

function errorsOf(rules: Parameters<typeof createResolver>[0], values: Record<string, unknown>) {
  const { errors } = createResolver(rules)({ values });
  return Object.fromEntries(Object.entries(errors).map(([field, list]) => [field, list.map((error) => error.key)]));
}

describe('rules', () => {
  it('requires a non-blank value', () => {
    expect(required('', {})?.key).toBe('validation.required');
    expect(required('   ', {})?.key).toBe('validation.required');
    expect(required(undefined, {})?.key).toBe('validation.required');
    expect(required(0, {})).toBeUndefined();
    expect(required('x', {})).toBeUndefined();
  });

  it('checks the length but leaves an empty value to required', () => {
    expect(minLength(5)('abcd', {})).toEqual({ key: 'validation.minLength', params: { min: 5 } });
    expect(minLength(5)('abcde', {})).toBeUndefined();
    expect(minLength(5)('', {})).toBeUndefined();
    expect(maxLength(3)('abcd', {})).toEqual({ key: 'validation.maxLength', params: { max: 3 } });
    expect(maxLength(3)('abc', {})).toBeUndefined();
  });

  it('matches a pattern', () => {
    const rule = pattern(/^\d+$/, 'digits');
    expect(rule('12a', {})?.key).toBe('digits');
    expect(rule('12', {})).toBeUndefined();
    expect(rule('', {})).toBeUndefined();
  });

  it('accepts whole numbers within the range only', () => {
    const rule = range(1, 65535);
    expect(rule(0, {})?.params).toEqual({ min: 1, max: 65535 });
    expect(rule(65536, {})).toBeDefined();
    expect(rule(1.5, {})).toBeDefined();
    expect(rule(5432, {})).toBeUndefined();
    expect(rule(null, {})).toBeUndefined();
  });

  it('compares with another field', () => {
    const rule = sameAs('password', 'mismatch');
    expect(rule('a', { password: 'b' })?.key).toBe('mismatch');
    expect(rule('a', { password: 'a' })).toBeUndefined();
  });

  it('applies conditional rules only while the condition holds', () => {
    const [rule] = when((values) => values.on === true, [required]);
    expect(rule!('', { on: true })).toBeDefined();
    expect(rule!('', { on: false })).toBeUndefined();
  });

  it('names the characters the password must not contain', () => {
    expect(passwordCharacters('Abc123!@#$%^&*()_+-=[]{}|;\':",./<>?~`', {})).toBeUndefined();
    expect(passwordCharacters('pass wordäpassä', {})).toEqual({
      key: 'validation.passwordCharacters',
      params: { characters: '␣ ä' },
    });
  });
});

describe('createResolver', () => {
  it('returns the values and only the fields that fail, with the key as message', () => {
    const result = createResolver({ a: [required], b: [required] })({ values: { a: '', b: 'x' } });

    expect(result.values).toEqual({ a: '', b: 'x' });
    expect(result.errors).toEqual({ a: [{ key: 'validation.required', message: 'validation.required' }] });
  });
});

describe('fieldError', () => {
  it('returns the first error of a field state', () => {
    const error = { key: 'validation.required', message: 'validation.required' };
    expect(fieldError({ error })).toBe(error);
    expect(fieldError({ error: null })).toBeUndefined();
    expect(fieldError({ error: 'text' })).toBeUndefined();
    expect(fieldError(undefined)).toBeUndefined();
  });
});

describe('rule sets', () => {
  it('login: at least five characters each', () => {
    expect(errorsOf(loginRules, { username: 'lars', password: '1234' })).toEqual({
      username: ['validation.minLength'],
      password: ['validation.minLength'],
    });
    expect(errorsOf(loginRules, { username: 'lars.k', password: '12345' })).toEqual({});
  });

  it('administrator: username as the backend checks it, strong password, repeated', () => {
    expect(errorsOf(adminRules, { username: 'ad min', password: 'short', passwordConfirm: 'other' })).toEqual({
      username: ['validation.usernameCharacters'],
      password: ['validation.minLength'],
      passwordConfirm: ['validation.passwordMismatch'],
    });
    expect(
      errorsOf(adminRules, { username: 'a'.repeat(21), password: 'long enough', passwordConfirm: 'long enough' }),
    ).toEqual({ username: ['validation.maxLength'], password: ['validation.passwordCharacters'] });
    expect(errorsOf(adminRules, { username: 'admin_1', password: 'S3cure!pw', passwordConfirm: 'S3cure!pw' })).toEqual(
      {},
    );
  });

  it('database: server fields for a server, only the file for SQLite', () => {
    expect(Object.keys(errorsOf(databaseRules, { provider: 'POSTGRESQL', port: 70000 }))).toEqual([
      'host',
      'port',
      'databaseName',
      'username',
      'password',
    ]);
    expect(errorsOf(databaseRules, { provider: 'SQLITE', port: null })).toEqual({
      databaseFile: ['validation.required'],
    });
    expect(
      errorsOf(databaseRules, {
        provider: 'MYSQL',
        host: 'db',
        port: 3306,
        databaseName: 'homebook',
        username: 'homebook',
        password: 'secret',
      }),
    ).toEqual({});
  });

  it('configuration: name up to 100 characters and a language', () => {
    expect(errorsOf(configurationRules, { instanceName: 'x'.repeat(101), defaultLocale: null })).toEqual({
      instanceName: ['validation.maxLength'],
      defaultLocale: ['validation.required'],
    });
  });
});
