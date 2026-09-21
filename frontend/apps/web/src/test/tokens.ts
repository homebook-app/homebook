// Test helpers, only imported by specs

function base64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Builds an unsigned token with the given payload. */
export function createTestToken(payload: Record<string, unknown>): string {
  return `${base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${base64Url(JSON.stringify(payload))}.signature`;
}
