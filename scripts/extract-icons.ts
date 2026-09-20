// Extracts the Icons8 sets from the C# constants of the Blazor frontend into single SVG files.
//
// One-off: the result is checked in, and from then on the `.svg` files are the source of truth.
// The script stays for traceability, it is not part of any build.
//
// Usage:
//   bun scripts/extract-icons.ts
//
// Reads   backend/HomeBook.Frontend.Core/Icons/*.cs
// Writes  frontend/packages/ui/src/icons/<set>/<Name>.svg

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface IconSource {
    file: string;
    set: string;
    /** Sets without own colors get `fill="currentColor"` on the root element. */
    tintable: boolean;
}

interface Skipped {
    set: string;
    name: string;
    reason: string;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(repoRoot, 'backend', 'HomeBook.Frontend.Core', 'Icons');
const targetDir = join(repoRoot, 'frontend', 'packages', 'ui', 'src', 'icons');

const sources: IconSource[] = [
    { file: 'Windows11Outline.cs', set: 'windows11-outline', tintable: true },
    { file: 'Windows11Filled.cs', set: 'windows11-filled', tintable: true },
    { file: 'Windows11Colored.cs', set: 'windows11-colored', tintable: false },
    { file: 'GlassMorphism.cs', set: 'glass-morphism', tintable: false },
    { file: 'LiquidGlassColor.cs', set: 'liquid-glass-color', tintable: false },
    { file: 'Logos.cs', set: 'logos', tintable: true },
];

// Classes whose members keep their colors although the set is tintable: the HomeBook logo
const untintableClasses = new Set(['OwnLogos']);

const classPattern = /\bclass\s+(\w+)/;
const constPattern = /public\s+const\s+string\s+(\w+)\s*=\s*(.*);\s*$/;
const escapes: Record<string, string> = { '"': '"', n: '\n', t: '\t', '\\': '\\' };

function unescapeCSharp(literal: string): string {
    let result = '';
    for (let index = 0; index < literal.length; index += 1) {
        const char = literal[index];
        if (char !== '\\') {
            result += char;
            continue;
        }

        index += 1;
        const replacement = escapes[literal[index] ?? ''];
        if (replacement === undefined) {
            throw new Error(`unknown escape sequence \\${literal[index]}`);
        }
        result += replacement;
    }
    return result;
}

function normalize(svg: string, tint: boolean): string {
    const rootEnd = svg.indexOf('>');
    if (!svg.startsWith('<svg') || rootEnd === -1) {
        throw new Error('value is not an <svg> element');
    }

    // Only the root element: inner elements carry width, height, x and y of their own
    let root = svg.slice(0, rootEnd);
    if (!/\sviewBox="[^"]+"/.test(root)) {
        throw new Error('root element has no viewBox');
    }

    root = root.replace(/\s+(width|height|x|y)="[^"]*"/g, '').replace(/\s{2,}/g, ' ');
    if (tint && !/\sfill="/.test(root)) {
        root += ' fill="currentColor"';
    }

    return root + svg.slice(rootEnd);
}

const counts = new Map<string, number>();
const skipped: Skipped[] = [];

for (const source of sources) {
    const setDir = join(targetDir, source.set);
    // Only the set directories are rebuilt, the folder also holds hand-written code
    rmSync(setDir, { recursive: true, force: true });
    mkdirSync(setDir, { recursive: true });

    const lines = readFileSync(join(sourceDir, source.file), 'utf8').split(/\r?\n/);
    const seen = new Set<string>();
    let currentClass = '';

    for (const line of lines) {
        const constMatch = constPattern.exec(line);
        if (constMatch === null) {
            currentClass = classPattern.exec(line)?.[1] ?? currentClass;
            continue;
        }

        const name = constMatch[1] ?? '';
        const value = (constMatch[2] ?? '').trim();

        try {
            if (!value.startsWith('"') || !value.endsWith('"') || value.length < 2) {
                throw new Error('not a regular string literal');
            }
            if (seen.has(name.toLowerCase())) {
                throw new Error('name collides with another icon of the set on a case-insensitive file system');
            }

            const tint = source.tintable && !untintableClasses.has(currentClass);
            const svg = normalize(unescapeCSharp(value.slice(1, -1)).trim(), tint);

            // CRLF and a final newline, as .editorconfig asks for
            writeFileSync(join(setDir, `${name}.svg`), svg.replace(/\r?\n/g, '\r\n') + '\r\n');
            seen.add(name.toLowerCase());
            counts.set(source.set, (counts.get(source.set) ?? 0) + 1);
        } catch (error) {
            skipped.push({ set: source.set, name, reason: error instanceof Error ? error.message : String(error) });
        }
    }
}

console.log('==> Extracted icons');
let total = 0;
for (const source of sources) {
    const count = counts.get(source.set) ?? 0;
    total += count;
    console.log(`    ${source.set.padEnd(20)} ${String(count).padStart(4)}`);
}
console.log(`    ${'total'.padEnd(20)} ${String(total).padStart(4)}`);

console.log(`==> Skipped: ${skipped.length}`);
for (const entry of skipped) {
    console.log(`    ${entry.set}/${entry.name}: ${entry.reason}`);
}

if (skipped.length > 0) {
    process.exitCode = 1;
}
