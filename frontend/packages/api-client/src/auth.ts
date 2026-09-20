import { AllowedHostsValidator, type AccessTokenProvider, type RequestOption } from '@microsoft/kiota-abstractions';
import type { Middleware } from '@microsoft/kiota-http-fetchlibrary';

/**
 * Supplies the current bearer token. Return `null` or `undefined` when the user is not logged in;
 * the request is then sent without an `Authorization` header.
 */
export type AccessTokenSource = () => string | null | undefined | Promise<string | null | undefined>;

/**
 * Kiota access token provider backed by a plain token source.
 *
 * There is no token refresh in HomeBook: a token is valid for 60 minutes and cannot be renewed.
 * When it expires the backend answers 401 and {@link UnauthorizedMiddleware} reports it.
 */
export class BearerAccessTokenProvider implements AccessTokenProvider {
  private readonly validator = new AllowedHostsValidator();

  constructor(private readonly source: AccessTokenSource) {}

  getAuthorizationToken = async (): Promise<string> => (await this.source()) ?? '';

  getAllowedHostsValidator = (): AllowedHostsValidator => this.validator;
}

/**
 * Middleware that invokes a callback whenever the backend answers with 401.
 * The response is passed through unchanged, so the request still fails with a status-code error.
 */
export class UnauthorizedMiddleware implements Middleware {
  next: Middleware | undefined;

  constructor(private readonly onUnauthorized: () => void) {}

  async execute(
    url: string,
    requestInit: RequestInit,
    requestOptions?: Record<string, RequestOption>,
  ): Promise<Response> {
    if (!this.next) {
      throw new Error('UnauthorizedMiddleware must not be the last middleware in the chain.');
    }
    const response = await this.next.execute(url, requestInit, requestOptions);
    if (response.status === 401) {
      this.onUnauthorized();
    }
    return response;
  }
}
