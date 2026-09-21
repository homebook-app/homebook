// Migrates the Blazor resx catalogs to the nested vue-i18n JSON catalogs of the Vue frontend.
//
// One-off: the result is checked in, and from then on the JSON files are the source of truth and
// are maintained in Weblate. The script stays for traceability, it is not part of any build.
// Running it again over its own output changes nothing.
//
// Usage:
//   bun scripts/migrate-resx.ts
//
// Reads   backend/HomeBook.Frontend.UI/Resources/LocalizationStrings*.resx
//         backend/HomeBook.Frontend.Module.<Name>/Resources/Strings*.resx
// Writes  frontend/apps/web/src/locales/<language>.json
//         frontend/packages/module-<name>/src/locales/<language>.json
//         frontend/locale-key-mapping.json
//
// Languages are plain language codes (`en`, `de`, `fr`, `ru`). English is the neutral resx with
// the `en-us` file layered on top and is the only complete catalog. Every other catalog carries
// every key; untranslated values are empty strings, Weblate shows them as untranslated and the
// app renders nothing for them. The key rules are documented in `scripts/lib/resxKeys.ts`.
//
// Keys the catalogs already contain win over the resx: they were written by hand in earlier
// migration steps and may already be translated in Weblate.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { convertKey, convertKeys } from './lib/resxKeys.ts';

interface Component {
    /** Name in the mapping file, identical to the Weblate component. */
    name: string;
    sourceDir: string;
    baseName: string;
    targetDir: string;
    /** Module catalogs are nested under one root key so they can be merged without clashes. */
    namespace?: string;
    /** Resx keys pinned to a path that already exists in the catalogs. */
    fixedKeys?: Record<string, string>;
    /** English texts for keys whose neutral value is empty. */
    englishOverrides?: Record<string, string>;
}

interface MessageTree {
    [key: string]: string | MessageTree;
}

interface MappingEntry {
    component: string;
    oldKey: string;
    newKey: string;
}

const DEFAULT_LANGUAGE = 'en';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = join(repoRoot, 'backend');
const frontend = join(repoRoot, 'frontend');

const components: Component[] = [
    {
        name: 'app',
        sourceDir: join(backend, 'HomeBook.Frontend.UI', 'Resources'),
        baseName: 'LocalizationStrings',
        targetDir: join(frontend, 'apps', 'web', 'src', 'locales'),
        fixedKeys: {
            UiLicenseDialog_Title: 'ui.licenseDialog.title',
            UiLicenseDialog_Close: 'ui.licenseDialog.close',
            UiLicenseDialog_AcceptContinue: 'ui.licenseDialog.acceptContinue',
            StartMenuItems_Open_Text: 'ui.startMenuItem.open',
        },
    },
    {
        name: 'module-kitchen',
        sourceDir: join(backend, 'HomeBook.Frontend.Module.Kitchen', 'Resources'),
        baseName: 'Strings',
        targetDir: join(frontend, 'packages', 'module-kitchen', 'src', 'locales'),
        namespace: 'kitchen',
    },
    {
        name: 'module-finances',
        sourceDir: join(backend, 'HomeBook.Frontend.Module.Finances', 'Resources'),
        baseName: 'Strings',
        targetDir: join(frontend, 'packages', 'module-finances', 'src', 'locales'),
        namespace: 'finances',
        // Empty in the neutral resx, translated from the German values
        englishOverrides: {
            AddSavingGoal_MudStep_Name_Title_Text: 'What do you want to achieve?',
            AddSavingGoal_MudStep_Name_Title_Caption: 'Choose a name that describes what you are saving for.',
            AddSavingGoal_MudStep_Name_Input_Placeholder: 'Enter a name',
            AddSavingGoal_MudStep_Goal_Title_Text: 'How much do you want to save?',
            AddSavingGoal_MudStep_Goal_Title_Caption: 'Enter the total amount you want to reach step by step.',
            AddSavingGoal_MudStep_Goal_Input_Placeholder: 'Enter an amount',
            AddSavingGoal_MudStep_Goal_Input_ValidationError: 'The amount is too small',
            AddSavingGoal_MudStep_Goal_TargetDate_Caption:
                'Tell us when you would like to reach your goal – it helps you stay motivated.',
            AddSavingGoal_MudStep_Goal_TargetDateInput_Placeholder: 'Select a date',
            AddSavingGoal_MudStep_Goal_TargetDateInput_Label: 'Target date (optional)',
            AddSavingGoal_MudStep_Options_Title_Text: 'More options',
            AddSavingGoal_MudStep_Options_Title_Caption: 'Does your savings account earn interest?',
            AddSavingGoal_MudStep_InterestRateOption_None_Option_Text: 'No interest',
            AddSavingGoal_MudStep_InterestRateOption_Monthly_Option_Text: 'Monthly',
            AddSavingGoal_MudStep_InterestRateOption_Yearly_Option_Text: 'Yearly',
            AddSavingGoal_MudStep_InterestRate_Input_Label: 'Interest rate (%)',
            AddSavingGoal_MudStep_Summary_Title_Text: 'Your saving goal at a glance',
            AddSavingGoal_MudStep_Summary_Name_Text: 'Your saving goal:',
            AddSavingGoal_MudStep_Summary_TargetDate_Text: 'By:',
            AddSavingGoal_MudStep_Summary_NumberOfMonths_Text: 'Months:',
            AddSavingGoal_MudStep_Summary_AmountPerMonth_Text: 'Per month:',
            AddSavingGoal_MudStep_Summary_Result_TextTemplate:
                'In the end you will have {0}, including {1} in interest :)',
            AddSavingGoalSummary_Total_Name: 'Total',
            AddSavingGoalSummary_Payments_Name: 'Payments',
        },
    },
    {
        name: 'module-platform-info',
        sourceDir: join(backend, 'HomeBook.Frontend.Module.PlatformInfo', 'Resources'),
        baseName: 'Strings',
        targetDir: join(frontend, 'packages', 'module-platform-info', 'src', 'locales'),
        namespace: 'platformInfo',
    },
];

// --- resx parsing -----------------------------------------------------------------------------

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

// HTML entities that survived as text inside a value, e.g. `&amp;copy;`
const HTML_ENTITIES: Record<string, string> = { copy: '©', reg: '®', trade: '™', nbsp: ' ' };

function decodeXml(text: string): string {
    return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity: string) => {
        if (entity.startsWith('#x') || entity.startsWith('#X')) {
            return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
        }
        if (entity.startsWith('#')) {
            return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
        }
        const decoded = XML_ENTITIES[entity];
        if (decoded === undefined) {
            throw new Error(`Unknown XML entity ${match}.`);
        }
        return decoded;
    });
}

function decodeHtmlEntities(text: string): string {
    return text.replace(/&(\w+);/g, (match, entity: string) => {
        const decoded = HTML_ENTITIES[entity];
        if (decoded === undefined) {
            throw new Error(`Unknown HTML entity ${match} in a value.`);
        }
        return decoded;
    });
}

/**
 * vue-i18n message syntax treats `@`, `|`, `{` and `}` as special. Placeholders like `{0}` are
 * kept as list interpolation; everything else is escaped as a literal.
 */
function escapeMessage(text: string): string {
    return text
        .split(/(\{\d+\})/)
        .map((part, index) => (index % 2 === 1 ? part : part.replace(/[@|{}$]/g, (char) => `{'${char}'}`)))
        .join('');
}

/** Reads the `<data>` entries of a resx file in document order. `<value />` counts as empty. */
function readResx(file: string): Map<string, string> {
    const xml = readFileSync(file, 'utf8');
    const entries = new Map<string, string>();
    const dataPattern = /<data\b([^>]*?)(?:\/>|>([\s\S]*?)<\/data>)/g;
    for (const match of xml.matchAll(dataPattern)) {
        const attributes = match[1] ?? '';
        const body = match[2] ?? '';
        const name = /\bname="([^"]*)"/.exec(attributes)?.[1];
        if (name === undefined) {
            throw new Error(`A <data> element in ${file} has no name.`);
        }
        const value = /<value>([\s\S]*?)<\/value>/.exec(body)?.[1] ?? '';
        entries.set(decodeXml(name), escapeMessage(decodeHtmlEntities(decodeXml(value))));
    }
    return entries;
}

/** Finds `<base>.resx` and `<base>.<culture>.resx` and groups them by language code. */
function readCultures(component: Component): Map<string, Map<string, string>> {
    const pattern = new RegExp(`^${component.baseName}(?:\\.([A-Za-z-]+))?\\.resx$`);
    const files = readdirSync(component.sourceDir)
        .map((file) => ({ file, culture: pattern.exec(file) }))
        .filter((entry): entry is { file: string; culture: RegExpExecArray } => entry.culture !== null)
        // The neutral file first, so English cultures are layered on top of it
        .sort((a, b) => (a.culture[1] ?? '').localeCompare(b.culture[1] ?? ''));

    const languages = new Map<string, Map<string, string>>();
    for (const { file, culture } of files) {
        const language = culture[1] === undefined ? DEFAULT_LANGUAGE : culture[1].split('-')[0]!.toLowerCase();
        const merged = languages.get(language) ?? new Map<string, string>();
        for (const [key, value] of readResx(join(component.sourceDir, file))) {
            if (value !== '' || !merged.has(key)) {
                merged.set(key, value);
            }
        }
        languages.set(language, merged);
    }
    return languages;
}

// --- catalog handling -------------------------------------------------------------------------

function readCatalog(file: string): MessageTree {
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as MessageTree) : {};
}

function getLeaf(tree: MessageTree, path: string): string | undefined {
    let node: string | MessageTree | undefined = tree;
    for (const segment of path.split('.')) {
        if (typeof node !== 'object') {
            return undefined;
        }
        node = node[segment];
    }
    return typeof node === 'string' ? node : undefined;
}

/** Sets a leaf unless the catalog already has a non-empty value there. */
function setLeaf(tree: MessageTree, path: string, value: string): void {
    const segments = path.split('.');
    const leaf = segments.pop()!;
    let node = tree;
    for (const segment of segments) {
        const child = node[segment];
        if (typeof child === 'string') {
            throw new Error(`"${path}" needs "${segment}" to be a group, but it is a message.`);
        }
        node = child ?? (node[segment] = {});
    }
    const existing = node[leaf];
    if (typeof existing === 'object') {
        throw new Error(`"${path}" is a group in the catalog, it cannot become a message.`);
    }
    if (existing === undefined || existing === '') {
        node[leaf] = value;
    }
}

function leafPaths(tree: MessageTree, prefix = ''): string[] {
    return Object.entries(tree).flatMap(([key, value]) => {
        const path = prefix === '' ? key : `${prefix}.${key}`;
        return typeof value === 'string' ? [path] : leafPaths(value, path);
    });
}

function writeJson(file: string, content: unknown): void {
    mkdirSync(dirname(file), { recursive: true });
    const json = `${JSON.stringify(content, null, 2)}\n`;
    writeFileSync(file, json.replace(/\r?\n/g, '\r\n'), 'utf8');
}

// --- migration --------------------------------------------------------------------------------

const allCultures = new Map(components.map((component) => [component.name, readCultures(component)]));
const languages = [
    ...new Set([DEFAULT_LANGUAGE, ...[...allCultures.values()].flatMap((cultures) => [...cultures.keys()])]),
].sort((a, b) => (a === DEFAULT_LANGUAGE ? -1 : b === DEFAULT_LANGUAGE ? 1 : a.localeCompare(b)));

const mapping: MappingEntry[] = [];
const report: string[] = [];

for (const component of components) {
    const cultures = allCultures.get(component.name)!;
    const english = cultures.get(DEFAULT_LANGUAGE);
    if (english === undefined) {
        throw new Error(`${component.name} has no neutral resx file.`);
    }

    const prefix = component.namespace === undefined ? '' : `${component.namespace}.`;
    const fixedKeys = component.fixedKeys ?? {};
    const converted = convertKeys([...english.keys()], fixedKeys);
    const pathOf = (key: string): string =>
        key in fixedKeys ? converted.get(key)! : `${prefix}${converted.get(key)!}`;

    for (const key of english.keys()) {
        mapping.push({ component: component.name, oldKey: key, newKey: pathOf(key) });
    }

    const catalogs = new Map(languages.map((language) => [language, readCatalog(join(component.targetDir, `${language}.json`))]));

    for (const language of languages) {
        const catalog = catalogs.get(language)!;
        const values = cultures.get(language);
        for (const key of english.keys()) {
            let value = values?.get(key) ?? '';
            if (language === DEFAULT_LANGUAGE && value === '') {
                value = component.englishOverrides?.[key] ?? '';
                if (value === '') {
                    throw new Error(`${component.name}: "${key}" has no English text and no override.`);
                }
            }
            setLeaf(catalog, pathOf(key), value);
        }
    }

    // Every catalog carries every English key, the hand-written ones included
    const englishPaths = leafPaths(catalogs.get(DEFAULT_LANGUAGE)!);
    for (const language of languages) {
        const catalog = catalogs.get(language)!;
        for (const path of englishPaths) {
            if (getLeaf(catalog, path) === undefined) {
                setLeaf(catalog, path, '');
            }
        }
        const extra = leafPaths(catalog).filter((path) => !englishPaths.includes(path));
        if (extra.length > 0) {
            throw new Error(`${component.name}/${language} has keys English does not have: ${extra.join(', ')}`);
        }
        const empty = leafPaths(catalog).filter((path) => getLeaf(catalog, path) === '').length;
        report.push(
            `${component.name.padEnd(22)} ${language}  ${String(englishPaths.length).padStart(4)} keys, ${String(empty).padStart(4)} untranslated`,
        );
        writeJson(join(component.targetDir, `${language}.json`), catalog);
    }

    for (const [key, path] of converted) {
        if (!(key in fixedKeys) && path !== convertKey(key)) {
            report.push(`${component.name.padEnd(22)} leaf moved: ${key} -> ${pathOf(key)}`);
        }
    }
    for (const key of Object.keys(component.englishOverrides ?? {})) {
        report.push(`${component.name.padEnd(22)} English override: ${key}`);
    }
}

writeJson(join(frontend, 'locale-key-mapping.json'), mapping);

console.log(`Languages: ${languages.join(', ')}`);
console.log(report.join('\n'));
console.log(`Mapping: ${relative(repoRoot, join(frontend, 'locale-key-mapping.json'))} (${mapping.length} keys)`);
