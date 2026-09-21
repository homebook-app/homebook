import { createI18n } from 'vue-i18n';

import { message, translateMessage } from './messages';

const { t } = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { list: 'Hello {0}', named: 'At least {min}', plain: 'Plain' } },
}).global;

describe('messages', () => {
  it('leaves out absent parameters', () => {
    expect(message('plain')).toEqual({ key: 'plain' });
    expect(message('list', ['x'])).toEqual({ key: 'list', params: ['x'] });
  });

  it('translates list, named and plain messages', () => {
    expect(translateMessage(t, message('list', ['HomeBook']))).toBe('Hello HomeBook');
    expect(translateMessage(t, message('named', { min: 5 }))).toBe('At least 5');
    expect(translateMessage(t, message('plain'))).toBe('Plain');
  });
});
