---
name: homebook-i18n
description: Add or change a user-visible string in this repository. Use whenever a new label, message, tooltip, toast or error text appears under frontend/ - key naming, which catalog it belongs in, the rule that every locale gets the key in the same commit, and why keys must not be renamed casually because Weblate owns the translations.
---

# HomeBook i18n

## Status

The catalogs were migrated from the Blazor resx files in step 06 (`scripts/migrate-resx.ts`,
one-off). From now on the JSON files are the source of truth and are maintained in Weblate.

## The one rule

**No visible string without `t()`.** Never literal user-facing text in a template, a
`computed`, a `throw`, a toast or a confirmation dialog.

**The single exception** is `frontend/apps/web/src/bootstrap/renderBootError.ts`. It renders
the error page shown when `appsettings.json` cannot be loaded - before the app and vue-i18n
exist. Its three short texts (de, en, fr) live in that file and are not in Weblate. Do not
treat it as a precedent: anything that renders after the app has mounted goes through `t()`.

## Key naming

- camelCase segments, nested by area: `settings.users.addButton`.
- Derive the key from **where the string appears**, not from its English wording. The wording
  changes; the location does not.
- A key is either a message or a group, never both. Where the migration met a key that was
  both, the message moved one level down as `label` (`finances.addSavingGoal.mudStep.goal.title.label`).

## Which catalog

| Scope | Catalog |
|---|---|
| App-wide, including `@homebook/ui` components | `frontend/apps/web/src/locales/<language>.json` |
| Module-specific | `frontend/packages/module-<name>/src/locales/<language>.json` |

A module key never goes into the global catalog. Module catalogs are nested under the module's
namespace - `kitchen.…`, `finances.…`, `platformInfo.…` - because the app merges every module
catalog into one vue-i18n instance.

## Languages

Catalogs are named by the plain language code: `en`, `de`, `fr`, `ru`. No region
(`de-DE`, `en-US`). The backend and the browser speak in culture tags; `resolveLocale()` in
`apps/web/src/locales/index.ts` maps a tag to its catalog.

- **English is the default and the only mandatory language.** Every English value is filled.
- A new key goes into **every** catalog in the **same commit**. In the other languages the value
  may be an empty string - Weblate shows it as untranslated. Fill in what you can translate
  reliably yourself, leave the rest empty.
- **There is no fallback.** An empty or missing value renders as nothing at runtime, not as the
  English text. That is deliberate.

The specs enforce the shape: `describeCatalogs()` from `@homebook/test-utils` checks that every
language has exactly the English keys and that no English value is empty.

## Weblate

Translations are maintained at <https://hosted.weblate.org/projects/homebook/>, one component
per catalog, file format "JSON nested structure".

- Renaming or deleting a key discards its existing translations. Consider that before
  touching one.
- Do not reformat or reorder catalogs by hand.
- `frontend/locale-key-mapping.json` records old resx key and new key of every migrated string.

## Where the strings came from

The Blazor originals, for reference while porting a page. `locale-key-mapping.json` gives the new
key for each of them.

| File | Keys |
|---|---|
| `backend/HomeBook.Frontend.UI/Resources/LocalizationStrings*.resx` | 254 |
| `backend/HomeBook.Frontend.Module.Kitchen/Resources/Strings*.resx` | 53 |
| `backend/HomeBook.Frontend.Module.Finances/Resources/Strings*.resx` | 41 |
| `backend/HomeBook.Frontend.Module.PlatformInfo/Resources/Strings*.resx` | 2 |

The `LocalizationCultureMapper` workaround that mapped `en-US` onto a non-existent `en-EN` is
dropped with no replacement.

## Checklist

- [ ] No visible string left without `t()`
- [ ] Key in camelCase, nested by area
- [ ] Key present in every catalog: `en`, `de`, `fr`, `ru`
- [ ] English value filled; other languages filled or empty
- [ ] Module keys in the module catalog, under the module's namespace
