---
name: homebook-vue-component
description: Write or change a Vue component in this repository. Use for any .vue file under frontend/ - where the file belongs, Ui*/Hb* naming, typed props and emits, scoped SCSS restricted to --hb-* tokens, t() for every visible string, and the sibling *.spec.ts. Load together with vue-best-practices.
---

# HomeBook Vue Component

Repository-specific rules only. General Vue guidance lives in `vue-best-practices` - load
both. Where the two disagree, this file wins.

## Status

Parts of this skill describe artifacts that do not exist yet. Anything tagged
**Not yet available** is a contract for a later migration step, not something you can import
today. If you need one and the file is missing: **stop and report.** Do not invent a
substitute, and do not build the missing module as a side effect of another task.

## Where the file belongs

| Kind of component | Location |
|---|---|
| Design system (`Ui*`) | `frontend/packages/ui/src/components/UiX.vue` |
| Module-specific (`Hb*`) | `frontend/packages/module-<name>/src/components/HbX.vue` |
| App-only: layout, page, chrome | `frontend/apps/web/src/{layouts,pages}/` |
| The test | always next to the source file |

## Naming

- `Ui*` for design-system components in `@homebook/ui`, `Hb*` for module-specific ones.
- Component files PascalCase. Composables camelCase with a `use` prefix, in `composables/`.
- CSS classes: `hb-` for layout and app chrome, `ui-` for components. BEM-like modifiers such
  as `ui-search-component__item-title` are fine.

## The shape of a component

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  label: string
  value: number
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), { compact: false })

const emit = defineEmits<{
  select: [value: number]
}>()

const { t } = useI18n()

const formatted = computed(() => props.value.toFixed(2))
</script>

<template>
  <button
    class="ui-value-card"
    :class="{ 'ui-value-card--compact': compact }"
    type="button"
    @click="emit('select', value)"
  >
    <span class="ui-value-card__label">{{ label }}</span>
    <span class="ui-value-card__value">{{ formatted }}</span>
    <span class="ui-value-card__hint">{{ t('common.selectHint') }}</span>
  </button>
</template>

<style scoped lang="scss">
.ui-value-card {
  border-radius: var(--hb-border-radius-default);
  color: var(--hb-text-primary);

  &--compact {
    padding: 0;
  }
}
</style>
```

Block order is always `<script setup lang="ts">`, then `<template>`, then
`<style scoped lang="scss">`.

## Props and emits

- Declare both with types. Defaults go through `withDefaults`, never through a runtime
  `default` object.
- TypeScript is `strict`. No `any`. Where a type is genuinely unknown, use `unknown` plus
  narrowing.
- No Options API, no mixins.

## Styling

- **No hardcoded colors, spacings, radii or font sizes.** Use `--hb-*` tokens or PrimeVue
  tokens.
- A new token belongs in `@homebook/ui`, never in a single component. The Sass side lives in
  `frontend/packages/ui/src/styles/abstracts/_tokens.scss`, the custom properties in
  `_variables.scss`, `_theme.scss` and `_layout.scss` next to it. `abstracts.scss` is injected
  into every SCSS block, so `$breakpoint-*`, `media-up()` and the `frosted-*` mixins are
  available without an import.
- Icons: `UiIcon` for the single-color sets (takes `color`), `UiPictogram` for the sets with
  their own colors (no `color`). For a set that arrives as a string, `isTintableIconSet()`
  picks the component.
- CSS layer order is `primevue, hb`. Override PrimeVue inside the `hb` layer - **not** with
  `!important`.
- Breakpoints: 0 / 600 / 960 / 1280 / 1920 / 2560 / 3840 / 5120.
- The frosted-glass steps `.frosted-b1` to `.frosted-b10` and the floating, rounded chrome
  over a full-screen wallpaper are the visual signature of this application. Changing them
  changes the product; that is not a side detail.

## Text

No visible string without `t()`. Never literal user-facing text in a template, a `computed`,
a `throw` or a toast. For key naming and catalogs see the `homebook-i18n` skill.

## The test beside it

Every component with logic - conditional rendering, emitted events, computed values - gets a
`*.spec.ts` next to it. See the `homebook-testing` skill.

## Checklist

- [ ] `<script setup lang="ts">`, Composition API, no Options API
- [ ] Props and emits typed, defaults via `withDefaults`
- [ ] No `any`
- [ ] File in the right package, PascalCase name, correct `Ui*`/`Hb*` prefix
- [ ] CSS classes prefixed `ui-` or `hb-`
- [ ] No hardcoded color, spacing, radius or font size
- [ ] Every visible string through `t()`, key added to all catalogs
- [ ] `*.spec.ts` next to the source file
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` passes

## Not yet available

| Item | Arrives in |
|---|---|
| The `Ui*` component library | step 05 |
