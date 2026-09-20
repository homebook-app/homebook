---
name: homebook-i18n
description: Add or change a user-visible string in this repository. Use whenever a new label, message, tooltip, toast or error text appears under frontend/ - key naming, which catalog it belongs in, the rule that every locale gets the key in the same commit, and why keys must not be renamed casually because Weblate owns the translations.
---

# HomeBook i18n

## Status

The catalogs and the `t()` wiring land in **step 03** and **step 06**. The rules below apply
from the very first key onwards.

## The one rule

**No visible string without `t()`.** Never literal user-facing text in a template, a
`computed`, a `throw`, a toast or a confirmation dialog.

## Key naming

- camelCase segments, nested by area: `settings.users.addButton`.
- Derive the key from **where the string appears**, not from its English wording. The wording
  changes; the location does not.

## Which catalog

| Scope | Catalog |
|---|---|
| App-wide | `frontend/apps/web/src/locales/<locale>.json` |
| Module-specific | `frontend/packages/module-<name>/src/locales/<locale>.json` |

A module key never goes into the global catalog. The paths above are the layout that steps 03
and 06 create.

## Every locale, every time

The catalogs are `de-DE`, `en-US` and `fr-FR`. A new key goes into **all** of them in the
**same commit**.

A missing translation is a **copy of the English value** - **never an empty string**. Weblate
renders an empty value as nothing at all, so an empty placeholder silently ships a blank
label.

> Open question, do not decide unilaterally: `GET /platform/locales` advertises a fourth
> locale, `en-GB`, which has no counterpart in the Blazor resx files. `AGENTS.md` specifies
> three catalogs and is the authoritative rulebook, so three it is. Whether `en-GB` gets a
> catalog is a step 06 decision to be agreed, not taken in passing.

## Weblate

Translations are maintained at <https://hosted.weblate.org/projects/homebook/>.

- Renaming or deleting a key discards its existing translations. Consider that before
  touching one.
- Do not reformat or reorder catalogs by hand.

## Where the strings come from

The Blazor originals, for reference while porting a page:

| File | Keys |
|---|---|
| `backend/HomeBook.Frontend.UI/Resources/LocalizationStrings*.resx` | 254 |
| `backend/HomeBook.Frontend.Module.Kitchen/Resources/Strings*.resx` | 53 |
| `backend/HomeBook.Frontend.Module.Finances/Resources/Strings*.resx` | 41 |
| `backend/HomeBook.Frontend.Module.PlatformInfo/Resources/Strings*.resx` | 2 |

The `LocalizationCultureMapper` workaround that mapped `en-US` onto a non-existent `en-EN` is
dropped with no replacement - it is plain `en-US` now.

## Checklist

- [ ] No visible string left without `t()`
- [ ] Key in camelCase, nested by area
- [ ] Key present in `de-DE`, `en-US` and `fr-FR`
- [ ] No empty values - untranslated entries hold the English text
- [ ] Module keys in the module catalog, not the global one

## Not yet available

| Item | Arrives in |
|---|---|
| The locale catalogs and the vue-i18n setup | steps 03 and 06 |
| `scripts/migrate-resx.ts` | step 06 |
