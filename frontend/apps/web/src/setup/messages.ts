/** The two call forms of vue-i18n's `t()` a message needs. */
export interface Translate {
  (key: string, list: unknown[]): string;
  (key: string, named: Record<string, unknown>): string;
}

/**
 * A translatable message: a catalog key plus its parameters. The migrated resx templates use
 * positional placeholders (`{0}`), so they take a list; new keys use named placeholders.
 */
export interface Message {
  key: string;
  params?: unknown[] | Record<string, unknown>;
}

export function message(key: string, params?: Message['params']): Message {
  return params === undefined ? { key } : { key, params };
}

/** Translates a message with the list or the named parameters it carries. */
export function translateMessage(t: Translate, value: Message): string {
  if (Array.isArray(value.params)) {
    return t(value.key, value.params);
  }
  return t(value.key, value.params ?? {});
}
