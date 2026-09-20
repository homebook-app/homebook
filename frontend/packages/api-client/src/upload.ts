/**
 * Upload limit enforced by Kestrel, `Upload.MaxFileSizeBytes` and nginx (`client_max_body_size 20m`).
 */
export const MAX_UPLOAD_BYTES = 20_971_520;

/**
 * Thrown before any encoding or network traffic when a file exceeds {@link MAX_UPLOAD_BYTES}.
 */
export class UploadTooLargeError extends Error {
  readonly size: number;
  readonly limit: number;

  constructor(size: number, limit: number = MAX_UPLOAD_BYTES) {
    super(`File size ${size} bytes exceeds the upload limit of ${limit} bytes.`);
    this.name = 'UploadTooLargeError';
    this.size = size;
    this.limit = limit;
  }
}

/**
 * Body of the JSON upload (`POST /storage/files`), minus the scope.
 */
export interface Base64Content {
  filename: string;
  /** Base64-encoded file content. */
  content: string;
}

/**
 * Throws {@link UploadTooLargeError} when the file exceeds the limit.
 */
export function assertUploadSize(file: Blob): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadTooLargeError(file.size);
  }
}

/**
 * Resolves the file name from an explicit argument or the `File.name` property.
 */
export function resolveFilename(file: Blob, filename?: string): string {
  const name = filename ?? (file as { name?: unknown }).name;
  if (typeof name !== 'string' || name === '') {
    throw new Error('A filename is required for the upload.');
  }
  return name;
}

/**
 * Encodes a file for the JSON upload. The size is checked before the file is read.
 */
export async function toBase64Content(file: Blob, filename?: string): Promise<Base64Content> {
  const name = resolveFilename(file, filename);
  assertUploadSize(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { filename: name, content: bytesToBase64(bytes) };
}

/**
 * Converts raw bytes to a base64 string without exceeding the argument limit of `fromCharCode`.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}
