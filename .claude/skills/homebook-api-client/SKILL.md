---
name: homebook-api-client
description: Talk to the HomeBook backend. Use before writing any code that calls the API, when regenerating the client after a backend endpoint change, or when handling an API error. Covers @homebook/api-client as the only entry point, error handling by HTTP status code, the absence of token refresh, base64 JSON uploads with a 20 MB limit, and the backend quirks - search parameter s, mandatory searchFilter, media URLs missing the /api prefix.
---

# HomeBook API Client

## Status

The package `frontend/packages/api-client` is in place: `src/generated/` holds the Kiota
TypeScript client, `src/index.ts` and its siblings the hand-written surface. The scripts
`scripts/generate-openapi.sh` and `scripts/generate-clients.sh` exist and are the only way
to produce the OpenAPI document and the two clients. The checked-in document
`backend/HomeBook.Backend/HomeBook.Backend.json` covers all 47 paths and carries the bearer
security scheme; `dotnet build` no longer generates it.

## The one rule

All backend traffic goes through `@homebook/api-client`. No direct `fetch` against the
backend from anywhere else. The quirks listed below belong **inside** the package; a calling
site must never have to know them.

## Errors are status codes, never bodies

Response bodies are inconsistent - sometimes `ValidationProblemDetails`, sometimes a bare
JSON string, sometimes plain text from the admin middleware - and none of it is localized.
The backend has no localization infrastructure at all. **Branch on the status code.**

| Code | Meaning |
|---|---|
| 200 on `/setup/availability` | setup required |
| 201 on `/setup/availability` | update required |
| 204 on `/setup/availability` | operational |
| 409 on `/setup/availability` | setup already running |
| 401 | log out and send to `/Login` |
| 400 | refused: cannot delete, disable or demote yourself |
| 422 | licenses not accepted |
| 503 | database unreachable |
| 404 on `/setup/user`, `/setup/configuration`, `/setup/database/configuration` | not preconfigured - **not** an error |

In code: every failed request throws a `BackendApiError` with `responseStatusCode`. Use the
predicates `isUnauthorized`, `isBadRequest`, `isForbidden`, `isNotFound`, `isConflict`,
`isUnprocessable`, `isServiceUnavailable` or `statusCodeOf(error)`. Network failures have no
status code; `isBackendApiError(error)` tells them apart.

The generated `setup.availability.get()` cannot distinguish 200, 201 and 204 - Kiota hides
the status of successful responses. Use `client.getSetupAvailability()`, which reads the status
through a response handler and resolves to `200 | 201 | 204 | 409`; any other status rejects
with a `BackendApiError`.

## Authentication

- `Authorization: Bearer <token>` on every protected call.
- **There is no refresh endpoint.** `POST /account/login` returns a `refreshToken`, but it is
  not redeemable anywhere. The token expires after 60 minutes with `ClockSkew = 0`.
- On 401 or expiry: log out, clear local state, send the user to `/Login`. The client fires
  `onUnauthorized` on every 401 response; the request itself still rejects.
- `POST /account/logout` is a server-side no-op. Call it anyway, then clean up locally.
- Only admins carry the claims `role=Admin` and `IsAdmin=True`. Non-admins have no role claim
  at all.

## Quirks that stay inside the package

| Quirk | Detail | In the package |
|---|---|---|
| Search parameter | `GET /search?s=<query>` - the parameter is **`s`** | `client.search(query)` |
| Recipe list | `GET /recipes?searchFilter=` is **mandatory**; empty string means "all", omitting it is a 400 | `client.listRecipes(filter = '')` |
| Uploads | JSON `{ filename, content (base64), scopeId }`, **not** `multipart/form-data` | `client.uploadFile(file, scopeId)`, `toBase64Content(file)` |
| Upload limit | 20 MB, enforced in Kestrel, in `appsettings.json` (`Upload.MaxFileSizeBytes`) and in nginx (`client_max_body_size 20m`). Checked client-side **before** encoding and sending | `MAX_UPLOAD_BYTES`, `UploadTooLargeError` |
| Scope lookup | `GET /storage/scopes?name=` returns a bare GUID. Kiota's TypeScript runtime cannot deserialize it, so the operation is excluded from generation | `client.getScopeIdByName(name)` |
| Known scopes | `homebook.kitchen.RecipeImages`, `homebook.core.wallpaper.UserWallpaper` | |
| Media URLs | `GET /media/{mediaId}/url` returns `/storage/media/{id}` **without** the `/api` prefix. The client prepends it | `client.resolveMediaUrl(id)`, `client.mediaUrl(id)` for `<img src>` without a request |
| Saving goal delete | `DELETE /saving-goals/{id}` - the route parameter is **`id`**, not `savingGoalId` as on every other saving-goal route | `client.deleteSavingGoal(id)` |
| Wallpaper | `wallpaperConfiguration` is a **serialized string**: `{ key, configuration, type, wallpaperKey }` with `type` in `{ Static, Dynamic, Uploaded }` | |
| Interest rate | `interestRateOption`: `0 = NONE`, `1 = MONTHLY`, `2 = YEARLY` | |
| Update | `POST /update/start` **terminates the process on purpose**. Expect the request to fail or hang; Docker restarts the container | |

Everything else is reached through the generated builders on `client.api`, for example
`client.api.account.login.post({ username, password })` or
`client.api.modules.homebook.finances.savingGoals.byId(id).amounts.patch(body)`.

## Two runtime states

The backend decides from `Database:Provider` whether it is in `SETUP` or `RUNNING`.

In `SETUP` only `/version`, `/system/*`, `/platform/*`, `/Development/*` and `/setup/*` are
mapped, and **no authentication middleware runs at all**. Module routes are mapped after the
build and exist only in `RUNNING`.

Consequence: a 404 on a module route may mean "the backend is in SETUP", not "wrong URL".

## Base URL and CORS

The base URL comes from `appsettings.json`, field `Backend.Host`, and is `/api`. Production
is same-origin through nginx and has **no CORS**. For local development use the Vite proxy
`/api` to `http://localhost:5032`. Never talk cross-origin, or you build a habit that breaks
in production.

The full backend contract is in `plan/00-uebersicht.md`. Read it before working on anything
that calls the backend.

## Regenerating the client

Run from the repository root, needs `dotnet`, `jq` and `curl`:

```
./scripts/generate-clients.sh
```

It calls `scripts/generate-openapi.sh` (publishes the backend, starts it in `RUNNING` with an
in-memory SQLite through `HB_*` environment variables, fetches `/openapi/v1.json`, sorts and
verifies it), installs the pinned Kiota version and regenerates the C# client under
`backend/HomeBook.Client` and the TypeScript client under
`frontend/packages/api-client/src/generated`. Both generated trees and the OpenAPI document
are committed. Needed after any change to a backend endpoint, its route or its DTOs.

`src/generated/` is generated code: excluded from linting and formatting, and **never**
edited by hand.

## Public surface

From `@homebook/api-client`:

- `createBackendClient({ baseUrl?, getAccessToken, onUnauthorized?, fetch? })` returns a
  `HomeBookClient` with `api` (generated builders), `baseUrl`, `search`, `listRecipes`,
  `deleteSavingGoal`, `resolveMediaUrl`, `mediaUrl`, `getScopeIdByName`, `uploadFile`,
  `getSetupAvailability`, `staticWallpaperUrl`
- `BearerAccessTokenProvider`, `UnauthorizedMiddleware`, `AccessTokenSource`
- `BackendApiError`, `isBackendApiError`, `statusCodeOf` and the status predicates
- `prefixMediaPath(baseUrl, path)`, `mediaUrl(baseUrl, mediaId)`,
  `staticWallpaperUrl(baseUrl, fileName)` (file name URL-encoded, dots as `%2E`)
- `SetupAvailability`

In the app there is exactly one client, created in `apps/web/src/bootstrap/createHomeBookApp.ts`.
Its `onUnauthorized` ends the session and sends the user to `/Login?reason=expired`. Stores and
guards reach it through `useBackend()` from `@/api/backend`, components and modules through
`useBackendClient()` from `@homebook/module-sdk`. Never create a second one.
- `toBase64Content(file, filename?)`, `assertUploadSize`, `MAX_UPLOAD_BYTES`, `UploadTooLargeError`
- all generated model types (`LoginRequest`, `RecipeResponse`, ...) and `BackendClient`

Tests live next to the sources as `*.spec.ts` and mock `fetch` through the `fetch` option;
the helper is `src/testing/fetchMock.ts`.
