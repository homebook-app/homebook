import { toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

/**
 * The product name. It is a constant, not a translation: `AppTitle` reads `HomeBook` in every
 * one of the Blazor resource files, and a brand name is not translated.
 */
export const APP_TITLE = 'HomeBook';

/**
 * Keeps `document.title` at `"<title> - HomeBook"`, the format of the former `UiPageTitle`.
 *
 * An empty or missing title leaves the app title standing on its own. The title is not
 * restored when the caller unmounts - in a single-page app the next page sets its own, and
 * restoring would briefly show the previous page's title during a route change.
 */
export function usePageTitle(
  title: MaybeRefOrGetter<string | undefined>,
  appTitle: MaybeRefOrGetter<string> = APP_TITLE,
): void {
  watchEffect(() => {
    const page = toValue(title)?.trim();
    const app = toValue(appTitle);

    document.title = page ? `${page} - ${app}` : app;
  });
}
