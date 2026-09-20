export {
  createBackendClient,
  DEFAULT_BASE_URL,
  type BackendClientOptions,
  type FetchFunction,
  type HomeBookClient,
} from './client.js';
export { BearerAccessTokenProvider, UnauthorizedMiddleware, type AccessTokenSource } from './auth.js';
export {
  isBackendApiError,
  isBadRequest,
  isConflict,
  isForbidden,
  isNotFound,
  isServiceUnavailable,
  isUnauthorized,
  isUnprocessable,
  statusCodeOf,
  type BackendApiError,
} from './errors.js';
export { mediaUrl, prefixMediaPath } from './media.js';
export {
  assertUploadSize,
  bytesToBase64,
  MAX_UPLOAD_BYTES,
  resolveFilename,
  toBase64Content,
  UploadTooLargeError,
  type Base64Content,
} from './upload.js';

export type { Guid } from '@microsoft/kiota-abstractions';
export type { BackendClient } from './generated/backendClient.js';
export type * from './generated/models/index.js';
