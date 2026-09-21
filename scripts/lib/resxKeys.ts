/**
 * Key conversion rules of the one-off resx migration (`scripts/migrate-resx.ts`).
 *
 * A resx key becomes a vue-i18n path:
 *
 * 1. Split on `_` and `.`. Underscores were the level separator in the Blazor keys, the two
 *    storage scope keys (`homebook.kitchen.recipeimages`) use dots.
 * 2. Every segment becomes camelCase. Only the leading run of capitals is lowered: a single
 *    capital becomes lowercase (`MainLayout` -> `mainLayout`), a longer run keeps its last
 *    capital when a lowercase letter follows, so an acronym stays one word
 *    (`UISetupStepper` -> `uiSetupStepper`, `UI` -> `ui`).
 * 3. The segments are joined with `.`.
 * 4. A key that is also the prefix of another key cannot be a leaf in nested JSON. That leaf
 *    moves one level down and gets the name `label`
 *    (`AddSavingGoal_MudStep_Goal_Title` -> `addSavingGoal.mudStep.goal.title.label`).
 * 5. Two keys that end up on the same path abort the migration.
 */

/** Lowers the leading run of capitals of one key segment. */
export function camelCaseSegment(segment: string): string {
    const run = /^[A-Z]+/.exec(segment)?.[0] ?? '';
    if (run.length === 0) {
        return segment;
    }
    const rest = segment.slice(run.length);
    if (run.length === 1 || rest.length === 0 || !/^[a-z]/.test(rest)) {
        return run.toLowerCase() + rest;
    }
    return run.slice(0, -1).toLowerCase() + run.slice(-1) + rest;
}

/** Converts a resx key to a dotted vue-i18n path, rules 1 to 3. */
export function convertKey(resxKey: string): string {
    const segments = resxKey.split(/[_.]/);
    if (segments.some((segment) => segment.length === 0)) {
        throw new Error(`Key "${resxKey}" has an empty segment.`);
    }
    return segments.map(camelCaseSegment).join('.');
}

export const LEAF_SUFFIX = 'label';

/**
 * Converts a whole set of keys, rules 1 to 5. Returns the mapping from old to new key in the
 * input order. `fixed` pins single keys to a given path and skips the conversion for them.
 */
export function convertKeys(resxKeys: readonly string[], fixed: Readonly<Record<string, string>> = {}): Map<string, string> {
    const converted = resxKeys.map((key) => [key, fixed[key] ?? convertKey(key)] as const);
    const paths = converted.map(([, path]) => path);

    const result = new Map<string, string>();
    const owners = new Map<string, string>();
    for (const [key, path] of converted) {
        const isPrefix = paths.some((other) => other.startsWith(`${path}.`));
        const finalPath = isPrefix ? `${path}.${LEAF_SUFFIX}` : path;
        const owner = owners.get(finalPath);
        if (owner !== undefined) {
            throw new Error(`Keys "${owner}" and "${key}" both convert to "${finalPath}".`);
        }
        owners.set(finalPath, key);
        result.set(key, finalPath);
    }
    return result;
}
