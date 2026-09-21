import {
  BaseBearerTokenAuthenticationProvider,
  HttpMethod,
  RequestInformation,
  type Guid,
} from '@microsoft/kiota-abstractions';
import {
  FetchRequestAdapter,
  HeadersInspectionHandler,
  HttpClient,
  ParametersNameDecodingHandler,
  RedirectHandler,
  type Middleware,
} from '@microsoft/kiota-http-fetchlibrary';
import { BearerAccessTokenProvider, UnauthorizedMiddleware, type AccessTokenSource } from './auth.js';
import { createBackendClient as createGeneratedClient, type BackendClient } from './generated/backendClient.js';
import {
  createFilePostResponseFromDiscriminatorValue,
  type FilePostResponse,
  type RecipesListResponse,
  type SearchResponse,
} from './generated/models/index.js';
import { mediaUrl, prefixMediaPath, staticWallpaperUrl } from './media.js';
import { fetchSetupAvailability, type SetupAvailability } from './setup.js';
import { toBase64Content } from './upload.js';

/** Base URL used when none is configured. Production is same-origin behind nginx. */
export const DEFAULT_BASE_URL = '/api';

/** Signature of the fetch implementation used to send requests. Injectable for tests. */
export type FetchFunction = (url: string, init: RequestInit) => Promise<Response>;

export interface BackendClientOptions {
  /** API base URL, defaults to {@link DEFAULT_BASE_URL}. */
  baseUrl?: string;
  /** Supplies the bearer token for protected calls. */
  getAccessToken: AccessTokenSource;
  /** Called whenever the backend answers 401. Log out, clear local state and go to the login page. */
  onUnauthorized?: () => void;
  /** Custom fetch implementation, defaults to the global `fetch`. */
  fetch?: FetchFunction;
}

/**
 * The HomeBook backend client: the generated Kiota surface plus helpers that encapsulate
 * the backend's quirks so no calling site has to know them.
 */
export interface HomeBookClient {
  /** The generated Kiota request builders. */
  readonly api: BackendClient;
  /** The configured base URL without a trailing slash. */
  readonly baseUrl: string;
  /** `GET /search?s=<query>`: the query parameter is named `s`. */
  search(query: string): Promise<SearchResponse | undefined>;
  /** `GET /recipes?searchFilter=`: the parameter is mandatory, an empty string means "all". */
  listRecipes(searchFilter?: string): Promise<RecipesListResponse | undefined>;
  /** `DELETE /saving-goals/{id}`: the route parameter is `id`, unlike the other saving-goal routes. */
  deleteSavingGoal(id: Guid): Promise<void>;
  /** Resolves `GET /media/{mediaId}/url` and prefixes the missing base URL. */
  resolveMediaUrl(mediaId: Guid): Promise<string>;
  /** `GET /setup/availability`: 200 setup required, 201 update required, 204 operational, 409 setup running. */
  getSetupAvailability(): Promise<SetupAvailability>;
  /** URL of an anonymous system wallpaper, with the file name encoded the way the backend expects. */
  staticWallpaperUrl(fileName: string): string;
  /** URL of the anonymous raw media endpoint, suitable for `<img src>`. No request is sent. */
  mediaUrl(mediaId: Guid): string;
  /** `GET /storage/scopes?name=`: returns the scope id for a scope name. */
  getScopeIdByName(name: string): Promise<Guid | undefined>;
  /** `POST /storage/files` as JSON with base64 content. Checks the 20 MB limit before reading the file. */
  uploadFile(file: Blob, scopeId: Guid, filename?: string): Promise<FilePostResponse | undefined>;
}

/**
 * Creates the backend client.
 */
export function createBackendClient(options: BackendClientOptions): HomeBookClient {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

  // No RetryHandler on purpose: a 503 means "database unreachable" and must surface immediately.
  const middlewares: Middleware[] = [
    new UnauthorizedMiddleware(options.onUnauthorized ?? (() => undefined)),
    new RedirectHandler(),
    new ParametersNameDecodingHandler(),
    new HeadersInspectionHandler(),
  ];
  // Kiota appends the terminal fetch handler only for a custom fetch; with own middlewares and
  // none given, the chain would end without one. The global fetch is resolved per request, so it
  // is always the current one.
  const fetchFunction: FetchFunction = options.fetch ?? ((url, init) => fetch(url, init));
  const httpClient = new HttpClient(fetchFunction, ...middlewares);
  const authenticationProvider = new BaseBearerTokenAuthenticationProvider(
    new BearerAccessTokenProvider(options.getAccessToken),
  );
  const adapter = new FetchRequestAdapter(authenticationProvider, undefined, undefined, httpClient);
  adapter.baseUrl = baseUrl;

  const api = createGeneratedClient(adapter);

  const createRequest = (method: HttpMethod, urlTemplate: string): RequestInformation => {
    const request = new RequestInformation(method, urlTemplate, { baseurl: baseUrl });
    request.headers.tryAdd('Accept', 'application/json');
    return request;
  };

  return {
    api,
    baseUrl,

    search: (query) => api.search.get({ queryParameters: { s: query } }),

    listRecipes: (searchFilter = '') => api.modules.homebook.kitchen.recipes.get({ queryParameters: { searchFilter } }),

    deleteSavingGoal: async (id) => {
      await api.modules.homebook.finances.savingGoals.byId(id).delete();
    },

    resolveMediaUrl: async (mediaId) => {
      const response = await api.media.byMediaId(mediaId).url.get();
      const mediaUri = response?.mediaUri;
      if (!mediaUri) {
        throw new Error(`The backend returned no URL for media ${mediaId}.`);
      }
      return prefixMediaPath(baseUrl, mediaUri);
    },

    mediaUrl: (mediaId) => mediaUrl(baseUrl, mediaId),

    getSetupAvailability: () => fetchSetupAvailability(adapter, baseUrl),

    staticWallpaperUrl: (fileName) => staticWallpaperUrl(baseUrl, fileName),

    // The generated operation is excluded: Kiota emits a "Guid" primitive that its runtime cannot
    // deserialize. The endpoint returns a JSON string, so it is read as a plain string here.
    getScopeIdByName: (name) => {
      const request = createRequest(HttpMethod.GET, '{+baseurl}/storage/scopes{?name}');
      request.queryParameters['name'] = name;
      return adapter.sendPrimitive<string>(request, 'string', undefined);
    },

    // The generated serializer base64-encodes byte arrays through TextDecoder in browsers, which
    // corrupts binary data. The body is therefore encoded here and sent as a raw JSON stream.
    uploadFile: async (file, scopeId, filename) => {
      const content = await toBase64Content(file, filename);
      const body = JSON.stringify({ ...content, scopeId });
      const request = createRequest(HttpMethod.POST, '{+baseurl}/storage/files');
      request.setStreamContent(new TextEncoder().encode(body).buffer, 'application/json');
      return adapter.send(request, createFilePostResponseFromDiscriminatorValue, undefined);
    },
  };
}
