import { describe, expect, it, vi } from 'vitest';
import {
  assertUploadSize,
  bytesToBase64,
  MAX_UPLOAD_BYTES,
  resolveFilename,
  toBase64Content,
  UploadTooLargeError,
} from './upload.js';

describe('toBase64Content', () => {
  it('encodes the file content', async () => {
    const file = new File(['hello'], 'greeting.txt');

    await expect(toBase64Content(file)).resolves.toEqual({ filename: 'greeting.txt', content: 'aGVsbG8=' });
  });

  it('prefers an explicit filename', async () => {
    const file = new File(['hello'], 'greeting.txt');

    await expect(toBase64Content(file, 'renamed.txt')).resolves.toMatchObject({ filename: 'renamed.txt' });
  });

  it('requires a filename for a bare blob', async () => {
    await expect(toBase64Content(new Blob(['x']))).rejects.toThrow(/filename/);
  });

  it('rejects files above the limit before reading them', async () => {
    const oversized = new Blob([new Uint8Array(MAX_UPLOAD_BYTES + 1)]);
    const read = vi.spyOn(oversized, 'arrayBuffer');

    const failure = await toBase64Content(oversized, 'big.bin').catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(UploadTooLargeError);
    expect((failure as UploadTooLargeError).size).toBe(MAX_UPLOAD_BYTES + 1);
    expect((failure as UploadTooLargeError).limit).toBe(MAX_UPLOAD_BYTES);
    expect(read).not.toHaveBeenCalled();
  });

  it('accepts a file exactly at the limit', () => {
    expect(() => assertUploadSize(new Blob([new Uint8Array(MAX_UPLOAD_BYTES)]))).not.toThrow();
  });
});

describe('resolveFilename', () => {
  it('reads the name of a File', () => {
    expect(resolveFilename(new File([], 'a.png'))).toBe('a.png');
  });

  it('rejects an empty name', () => {
    expect(() => resolveFilename(new File([], ''))).toThrow(/filename/);
  });
});

describe('bytesToBase64', () => {
  it('matches the reference encoding for binary data larger than one chunk', () => {
    const bytes = new Uint8Array(70_000);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = (index * 31 + 7) % 256;
    }

    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    expect(bytesToBase64(bytes)).toBe(btoa(binary));
  });
});
