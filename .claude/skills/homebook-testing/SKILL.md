---
name: homebook-testing
description: Write or fix a test in this repository. Use when adding a Vitest spec for a Vue component, Pinia store, composable or helper under frontend/ - file placement beside the source, the mountWithPlugins helper, mocking @homebook/api-client, and what is deliberately not tested. There are no end-to-end tests.
---

# HomeBook Testing

## Stack

- Vitest with `@vue/test-utils`, environment happy-dom, globals enabled.
- Coverage via v8, emitted as **lcov** into `coverage/`. Step 11 feeds SonarCloud with that
  format, so do not change it to `text` or `html` only.
- **No end-to-end tests, no Playwright.** This is deliberate. Introducing E2E needs prior
  agreement, not a pull request.

## Where the file belongs

Next to the source file, same directory:

| Source | Test |
|---|---|
| `UiValueCard.vue` | `UiValueCard.spec.ts` |
| `useWallpaper.ts` | `useWallpaper.spec.ts` |
| `stores/auth.ts` | `stores/auth.spec.ts` |

Never a parallel `__tests__/` tree.

## What is tested

- Every component with logic: conditional rendering, emitted events, computed values.
- Every Pinia store.
- Every composable.
- Every helper function.

## What is not tested

- Plain markup with no branching.
- Generated code - `frontend/packages/api-client/src/generated/`.

## Mounting

**Never call `mount()` directly and never register plugins ad hoc inside a spec.** Always use
the shared helper, so every test sees the same PrimeVue theme, the same i18n setup, a fresh
Pinia and a router.

The helper lives in its own private workspace package, `frontend/packages/test-utils`, so
specs in `apps/web`, `packages/ui` and the module packages all import it the same way:

```ts
import { mountWithPlugins } from '@homebook/test-utils'

const { wrapper, router, pinia, i18n } = await mountWithPlugins(UiValueCard, {
  props: { label: 'Total', value: 3 },
})
```

It is **async** - it navigates and waits for the router before mounting. It preconfigures:

- PrimeVue with the shared `primeVueOptions` from `@homebook/ui` (`darkModeSelector: false`,
  `cssLayer: { name: 'primevue', order: 'primevue, hb' }`) plus `ToastService`,
  `ConfirmationService` and `DialogService`
- vue-i18n with `legacy: false`, locale `en` and **no catalogs**, so `t('some.key')`
  renders `some.key`
- a **fresh** Pinia instance per call, so state never leaks between tests
- a memory-history router with a catch-all route

Options, on top of every `mount` option of `@vue/test-utils`:

| Option | Purpose |
|---|---|
| `locale` | Active locale, default `en` |
| `messages` | Catalogs by locale, only for tests that are about translation |
| `routes` | Route table of the memory router |
| `initialRoute` | Path to navigate to before mounting, default `/` |
| `pinia` | A Pinia prepared beforehand instead of a fresh one |

`global.plugins` passed by the caller are installed after the built-in ones.

A package that gets its first spec needs three things: `@homebook/test-utils` as a
devDependency (`workspace:*`), a `vitest.config.ts` that spreads `sharedTest` from
`frontend/vitest.shared.ts`, and `@homebook/test-utils/setup` in `setupFiles`. Copy
`frontend/packages/test-utils/vitest.config.ts` and add `@vitejs/plugin-vue`.

Code that reads the runtime configuration needs `setAppConfig(fixture)` from
`@/composables/useAppConfig` before it runs - the configuration is a module singleton, not
a plugin.

## Mocking the API client

The API client is **always** mocked, never really called. Mock at the module boundary:

```ts
vi.mock('@homebook/api-client', () => ({
  // the named exports the code under test uses, see packages/api-client/src/index.ts
}))
```

In `apps/web` this is already done for every spec: `src/test/setup.ts` replaces the package
with `src/test/apiClientMock.ts` (the status predicates plus a spied `createBackendClient`).
Stores and guards reach the client through `useBackend()`; `mockBackend({...})` from
`@/test/backend` installs a stub with just the parts a test needs, and `apiError(status)`
builds a rejection with a status code. The app never loads the real client in tests - its
Kiota runtime pulls in an ESM build of `@opentelemetry/api` that Node cannot load outside Vite.

Module components get the client injected (`useBackendClient()` from `@homebook/module-sdk`);
their specs pass a stub through `global.provide` under `backendClientKey`.

Assert on the **status-code** branches of the code under test, never on response body text.
The reason is in the `homebook-api-client` skill: the bodies are inconsistent and not
localized.

## i18n in tests

Assert on translation **keys**, not on translated strings - unless the test is specifically
about translation. Otherwise every wording change breaks unrelated tests.

## Commands

All from `frontend/`:

```
bun run test
bun run test:watch
bun run test:coverage
```
