import { DefaultApiError } from '@microsoft/kiota-abstractions';
import { describe, expect, it } from 'vitest';
import {
  isBackendApiError,
  isBadRequest,
  isConflict,
  isForbidden,
  isNotFound,
  isServiceUnavailable,
  isUnauthorized,
  isUnprocessable,
  statusCodeOf,
} from './errors.js';

function apiError(status: number): DefaultApiError {
  const error = new DefaultApiError('failed');
  error.responseStatusCode = status;
  return error;
}

describe('errors', () => {
  it('recognizes API errors by their status code', () => {
    expect(isBackendApiError(apiError(500))).toBe(true);
    expect(isBackendApiError(new DefaultApiError('no status'))).toBe(false);
    expect(isBackendApiError(new Error('plain'))).toBe(false);
    expect(isBackendApiError(null)).toBe(false);
    expect(isBackendApiError('text')).toBe(false);
  });

  it('extracts the status code', () => {
    expect(statusCodeOf(apiError(404))).toBe(404);
    expect(statusCodeOf(new Error('network'))).toBeUndefined();
  });

  it.each([
    [400, isBadRequest],
    [401, isUnauthorized],
    [403, isForbidden],
    [404, isNotFound],
    [409, isConflict],
    [422, isUnprocessable],
    [503, isServiceUnavailable],
  ])('predicate for %i matches only that status', (status, predicate) => {
    expect(predicate(apiError(status))).toBe(true);
    expect(predicate(apiError(status + 1))).toBe(false);
    expect(predicate(new Error('plain'))).toBe(false);
  });
});
