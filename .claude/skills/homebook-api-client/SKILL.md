---
name: homebook-api-client
description: Talk to the HomeBook backend. Use before writing any code that calls the API, when regenerating the client after a backend endpoint change, or when handling an API error. Covers @homebook/api-client as the only entry point, error handling by HTTP status code, the absence of token refresh, base64 JSON uploads with a 20 MB limit, and the backend quirks - search parameter s, mandatory searchFilter, media URLs missing the /api prefix.
---

# HomeBook API Client

## Status

The workspace member `frontend/packages/api-client` exists but is empty. The generated code
and the hand-written surface arrive in **step 02**. `scripts/generate-openapi.sh` and
`scripts/generate-clients.sh` **do not exist yet** - the repository currently has only
`generate-client.sh` at the root, which generates the **C#** client from an OpenAPI document
that covers just 21 paths and carries no security scheme. Do not run it expecting a
TypeScript client.

Everything below that is not tagged **Not yet available** is the backend contract and is
already binding.

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

## Authentication

- `Authorization: Bearer <token>` on every protected call.
- **There is no refresh endpoint.** `POST /account/login` returns a `refreshToken`, but it is
  not redeemable anywhere. The token expires after 60 minutes with `ClockSkew = 0`.
- On 401 or expiry: log out, clear local state, send the user to `/Login`.
- `POST /account/logout` is a server-side no-op. Call it anyway, then clean up locally.
- Only admins carry the claims `role=Admin` and `IsAdmin=True`. Non-admins have no role claim
  at all.

## Quirks that stay inside the package

| Quirk | Detail |
|---|---|
| Search parameter | `GET /search?s=<query>` - the parameter is **`s`** |
| Recipe list | `GET /recipes?searchFilter=` is **mandatory**; empty string means "all", omitting it is a 400 |
| Uploads | JSON `{ filename, content (base64), scopeId }`, **not** `multipart/form-data` |
| Upload limit | 20 MB, enforced in Kestrel, in `appsettings.json` (`Upload.MaxFileSizeBytes`) and in nginx (`client_max_body_size 20m`). Check client-side **before** encoding and sending |
| Known scopes | `homebook.kitchen.RecipeImages`, `homebook.core.wallpaper.UserWallpaper` |
| Media URLs | `GET /media/{mediaId}/url` returns `/storage/media/{id}` **without** the `/api` prefix. The client prepends it |
| Saving goal delete | `DELETE /saving-goals/{id}` - the route parameter is **`id`**, not `savingGoalId` as on every other saving-goal route |
| Wallpaper | `wallpaperConfiguration` is a **serialized string**: `{ key, configuration, type, wallpaperKey }` with `type` in `{ Static, Dynamic, Uploaded }` |
| Interest rate | `interestRateOption`: `0 = NONE`, `1 = MONTHLY`, `2 = YEARLY` |
| Update | `POST /update/start` **terminates the process on purpose**. Expect the request to fail or hang; Docker restarts the container |

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

**Not yet available - arrives in step 02.** Intended sequence, run from the repository root:

```
./scripts/generate-openapi.sh
./scripts/generate-clients.sh
```

Needed after any change to a backend endpoint, its route or its DTOs.
`packages/api-client/src/generated/` is generated code: excluded from linting, and **never**
edited by hand.

## Intended public surface

**Not yet available - arrives in step 02.** Signatures only, no implementations:

- `createBackendClient(options)` - base URL plus a token provider
- an `AccessTokenProvider` that supplies the bearer token and fires a callback on 401
- an error type carrying the **status code**, plus predicates such as `isUnauthorized(error)`
- `resolveMediaUrl(mediaId)` - prepends the missing `/api` base to `/storage/media/{id}`
- `toBase64Content(file)` - JSON upload encoding including the 20 MB check

## Not yet available

| Item | Arrives in |
|---|---|
| `scripts/generate-openapi.sh`, `scripts/generate-clients.sh` | step 02 |
| The generated TypeScript client | step 02 |
| The hand-written surface listed above | step 02 |
