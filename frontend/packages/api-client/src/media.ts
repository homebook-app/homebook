const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * Prefixes a media path returned by the backend with the API base URL.
 *
 * `GET /media/{mediaId}/url` answers with `/storage/media/{id}` without the `/api` prefix.
 * Absolute URLs and paths that already start with the base URL are returned unchanged.
 */
export function prefixMediaPath(baseUrl: string, mediaPath: string): string {
  if (ABSOLUTE_URL.test(mediaPath)) {
    return mediaPath;
  }
  const base = baseUrl.replace(/\/+$/, '');
  const path = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  if (base !== '' && path.startsWith(`${base}/`)) {
    return path;
  }
  return `${base}${path}`;
}

/**
 * Builds the URL of the raw media endpoint, which is anonymous and suitable for `<img src>`.
 */
export function mediaUrl(baseUrl: string, mediaId: string): string {
  return prefixMediaPath(baseUrl, `/storage/media/${encodeURIComponent(mediaId)}`);
}
