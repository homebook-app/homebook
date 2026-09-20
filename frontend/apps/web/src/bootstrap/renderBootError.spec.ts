import { renderBootError } from './renderBootError';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  target.innerHTML = '<span class="stale">stale</span>';
  return target;
}

describe('renderBootError', () => {
  it('replaces the content of the target with an alert', () => {
    const target = createTarget();

    renderBootError(target, new Error('boom'), 'en-US');

    expect(target.querySelector('.stale')).toBeNull();
    expect(target.querySelector('[role="alert"]')).not.toBeNull();
    expect(target.querySelector('h1')?.textContent).toBe('HomeBook could not be started');
  });

  it.each([
    ['de-DE', 'HomeBook konnte nicht gestartet werden'],
    ['de', 'HomeBook konnte nicht gestartet werden'],
    ['fr-CA', "HomeBook n'a pas pu démarrer"],
    ['EN-gb', 'HomeBook could not be started'],
  ])('picks the text for the language %s', (language, title) => {
    const target = createTarget();

    renderBootError(target, new Error('boom'), language);

    expect(target.querySelector('h1')?.textContent).toBe(title);
  });

  it.each(['es-ES', '', 'toString'])('falls back to English for the language "%s"', (language) => {
    const target = createTarget();

    renderBootError(target, new Error('boom'), language);

    expect(target.querySelector('h1')?.textContent).toBe('HomeBook could not be started');
  });

  it('shows the error message as plain text, never as markup', () => {
    const target = createTarget();

    renderBootError(target, new Error('<img src=x onerror=alert(1)>'), 'en-US');

    expect(target.querySelector('pre')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(target.querySelector('img')).toBeNull();
  });

  it('renders values that are not errors', () => {
    const target = createTarget();

    renderBootError(target, 'plain reason', 'en-US');

    expect(target.querySelector('pre')?.textContent).toBe('plain reason');
  });
});
