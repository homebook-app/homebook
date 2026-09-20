---
name: homebook-testing
description: Write or fix a test in this repository. Use when adding a Vitest spec for a Vue component, Pinia store, composable or helper under frontend/ - file placement beside the source, the mountWithPlugins helper, mocking @homebook/api-client, and what is deliberately not tested. There are no end-to-end tests.
---

# HomeBook Testing

## Status

Parts of this skill describe artifacts that do not exist yet. Anything tagged
**Not yet available** is a contract for a later migration step, not something you can import
today. If you need one and the file is missing: **stop and report.** Do not invent a
substitute, and do not build the missing module as a side effect of another task.

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

**Not yet available - arrives in step 03.** Intended location
`frontend/apps/web/src/test/mountWithPlugins.ts`. It must preconfigure:

- PrimeVue with the Aura preset, `darkModeSelector: false`, and
  `cssLayer: { name: 'primevue', order: 'primevue, hb' }`
- vue-i18n with `legacy: false` and fallback `en-US`
- a **fresh** Pinia instance per test, so state never leaks between tests
- a memory-history router

Until it exists, do not hand-roll a local equivalent - report that the helper is missing.

## Mocking the API client

The API client is **always** mocked, never really called. Mock at the module boundary:

```ts
vi.mock('@homebook/api-client', () => ({
  // named exports - see "Not yet available"
}))
```

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

## Not yet available

| Item | Arrives in |
|---|---|
| `mountWithPlugins` and the Vitest configuration | step 03 |
| The named exports of `@homebook/api-client` | step 02 |
