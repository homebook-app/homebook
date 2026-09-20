import { AppConfigError, parseAppConfig, type AppConfig } from './appConfig';

/**
 * Fetches and validates `appsettings.json`.
 *
 * Plain `fetch` on purpose: this is a static asset served next to `index.html`, not a backend
 * endpoint. The "only through `@homebook/api-client`" rule covers backend calls.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  const url = `${import.meta.env.BASE_URL}appsettings.json`;

  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (cause) {
    throw new AppConfigError('network', `appsettings.json: request to ${url} failed`, { cause });
  }

  if (!response.ok) {
    throw new AppConfigError('http', `appsettings.json: ${url} answered with status ${response.status}`);
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (cause) {
    // Typical cause: the web server answers with index.html because the file is missing
    throw new AppConfigError('parse', 'appsettings.json: the response is not valid JSON', { cause });
  }

  return parseAppConfig(raw);
}
