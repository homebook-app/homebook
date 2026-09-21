import {
  DefaultApiError,
  HttpMethod,
  RequestInformation,
  ResponseHandlerOption,
  type RequestAdapter,
  type ResponseHandler,
} from '@microsoft/kiota-abstractions';

/**
 * The status codes `GET /setup/availability` answers with.
 *
 * - `200` setup required
 * - `201` update required
 * - `204` operational
 * - `409` a setup is already running
 */
export type SetupAvailability = 200 | 201 | 204 | 409;

const AVAILABILITY_CODES: readonly number[] = [200, 201, 204, 409];

function isSetupAvailability(status: number): status is SetupAvailability {
  return AVAILABILITY_CODES.includes(status);
}

/**
 * Reads the status code of `GET /setup/availability`.
 *
 * Kiota hides the status of successful responses, so the generated operation cannot tell
 * 200, 201 and 204 apart. A response handler reads the native response instead. Any other
 * status rejects with a {@link BackendApiError}; network failures propagate unchanged.
 */
export async function fetchSetupAvailability(adapter: RequestAdapter, baseUrl: string): Promise<SetupAvailability> {
  const request = new RequestInformation(HttpMethod.GET, '{+baseurl}/setup/availability', { baseurl: baseUrl });
  const handler: ResponseHandler = {
    handleResponse: async <NativeResponseType, ModelType>(response: NativeResponseType) =>
      (response as unknown as Response).status as unknown as ModelType,
  };
  const option = new ResponseHandlerOption();
  option.responseHandler = handler;
  request.addRequestOptions([option]);

  const status = await adapter.sendPrimitive<number>(request, 'number', undefined);
  if (status !== undefined && isSetupAvailability(status)) {
    return status;
  }
  const error = new DefaultApiError(`Unexpected status ${String(status)} from /setup/availability.`);
  error.responseStatusCode = status ?? 0;
  throw error;
}
