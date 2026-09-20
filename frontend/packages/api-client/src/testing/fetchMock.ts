import { vi } from 'vitest';
import type { FetchFunction } from '../client.js';

/** A request as it reached the mocked fetch. */
export interface RecordedRequest {
  url: string;
  method: string;
  headers: Headers;
  body: string | undefined;
}

export type Responder = (request: RecordedRequest) => Response | Promise<Response>;

/**
 * Creates a fetch mock that records every request and answers through the responder.
 */
export function createFetchMock(responder: Responder) {
  const requests: RecordedRequest[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit): Promise<Response> => {
    const recorded: RecordedRequest = {
      url,
      method: init.method ?? 'GET',
      headers: new Headers(init.headers),
      body: decodeBody(init.body),
    };
    requests.push(recorded);
    return responder(recorded);
  });
  return {
    fetch: fetchMock as unknown as FetchFunction,
    calls: fetchMock,
    requests,
    last: (): RecordedRequest => {
      const request = requests.at(-1);
      if (!request) {
        throw new Error('No request was recorded.');
      }
      return request;
    },
  };
}

function decodeBody(body: BodyInit | null | undefined): string | undefined {
  if (body === null || body === undefined) {
    return undefined;
  }
  if (typeof body === 'string') {
    return body;
  }
  if (body instanceof ArrayBuffer) {
    return new TextDecoder().decode(body);
  }
  if (ArrayBuffer.isView(body)) {
    return new TextDecoder().decode(body);
  }
  return undefined;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function textResponse(body: string, status: number): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/plain' } });
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}
