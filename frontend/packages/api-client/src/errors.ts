import type { ApiError } from '@microsoft/kiota-abstractions';

/**
 * Error thrown by the client for every non-successful HTTP response.
 *
 * The backend's error bodies are inconsistent and not localized, so callers must branch on
 * {@link BackendApiError.responseStatusCode} and never on the message.
 */
export interface BackendApiError extends ApiError {
  responseStatusCode: number;
}

/**
 * Narrows an unknown error to a {@link BackendApiError}.
 */
export function isBackendApiError(error: unknown): error is BackendApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { responseStatusCode?: unknown }).responseStatusCode === 'number'
  );
}

/**
 * Returns the HTTP status code carried by the error, or `undefined` for non-API errors
 * such as network failures.
 */
export function statusCodeOf(error: unknown): number | undefined {
  return isBackendApiError(error) ? error.responseStatusCode : undefined;
}

function hasStatus(status: number): (error: unknown) => boolean {
  return (error) => statusCodeOf(error) === status;
}

/** 400: the backend refused the request, e.g. deleting, disabling or demoting yourself. */
export const isBadRequest = hasStatus(400);
/** 401: the token is missing, invalid or expired. Log out and go to the login page. */
export const isUnauthorized = hasStatus(401);
/** 403: authenticated, but not an admin. */
export const isForbidden = hasStatus(403);
/** 404: not found. On the preconfigured setup endpoints this means "not preconfigured". */
export const isNotFound = hasStatus(404);
/** 409: conflict, e.g. a username that is already taken or a setup that is already running. */
export const isConflict = hasStatus(409);
/** 422: the licenses have not been accepted. */
export const isUnprocessable = hasStatus(422);
/** 503: the database is unreachable. */
export const isServiceUnavailable = hasStatus(503);
