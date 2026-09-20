interface BootErrorMessage {
  title: string;
  hint: string;
}

/**
 * The one deliberate exception to "no visible string without t()": this page renders when the
 * app could not start, so vue-i18n is not running. These texts are not managed in Weblate.
 */
const bootErrorMessages = {
  de: {
    title: 'HomeBook konnte nicht gestartet werden',
    hint: 'Die Konfiguration der Anwendung konnte nicht geladen werden. Bitte die Seite neu laden. Bleibt der Fehler bestehen, hilft die Person weiter, die diese Installation betreut.',
  },
  en: {
    title: 'HomeBook could not be started',
    hint: 'The application configuration could not be loaded. Please reload the page. If the problem persists, contact the person who maintains this installation.',
  },
  fr: {
    title: "HomeBook n'a pas pu démarrer",
    hint: "La configuration de l'application n'a pas pu être chargée. Veuillez recharger la page. Si le problème persiste, contactez la personne qui gère cette installation.",
  },
} satisfies Record<string, BootErrorMessage>;

type BootErrorLanguage = keyof typeof bootErrorMessages;

function isBootErrorLanguage(value: string): value is BootErrorLanguage {
  return Object.hasOwn(bootErrorMessages, value);
}

function pickMessage(language: string): BootErrorMessage {
  const prefix = language.toLowerCase().split('-')[0] ?? '';
  return bootErrorMessages[isBootErrorLanguage(prefix) ? prefix : 'en'];
}

/** Replaces the content of `target` with a readable error page instead of leaving it blank. */
export function renderBootError(target: Element, error: unknown, language: string = navigator.language): void {
  const message = pickMessage(language);

  const container = document.createElement('main');
  container.className = 'hb-boot-error';
  container.setAttribute('role', 'alert');

  const title = document.createElement('h1');
  title.textContent = message.title;

  const hint = document.createElement('p');
  hint.textContent = message.hint;

  // Technical detail for whoever maintains the installation, deliberately not translated
  const detail = document.createElement('pre');
  detail.textContent = error instanceof Error ? error.message : String(error);

  container.append(title, hint, detail);
  target.replaceChildren(container);
}
