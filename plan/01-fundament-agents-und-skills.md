# 01 — Fundament: AGENTS.md, Skills, Bun-Workspace

**Voraussetzung:** keine. Dies ist der erste Schritt.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` vollständig.

---

## Ziel

Die Arbeitsgrundlage für alle folgenden Schritte schaffen: verbindliche Regeln in `AGENTS.md`, installierte Agent-Skills und ein leeres, aber funktionsfähiges Bun-Workspace.

Nach diesem Schritt existiert noch keine Vue-App — nur das Gerüst, in das sie ab Schritt 03 hineinwächst.

---

## Aufgaben

### 1. `AGENTS.md` im Repository-Wurzelverzeichnis

**Erledigt.** `AGENTS.md` existiert bereits im Wurzelverzeichnis. **Nicht neu schreiben, nicht überschreiben.** Lies sie, prüfe sie gegen die folgende Sollbeschreibung und ergänze nur, was tatsächlich fehlt.

Sollbeschreibung des Inhalts:

**Projektüberblick** — in etwa zehn Zeilen: .NET-10-Backend plus Vue-3-Frontend, ein Docker-Image, nginx auf `:8080` liefert das SPA und proxied `/api/` an Kestrel auf `:5000`. Modularer Aufbau mit den Modulen Kitchen, Finances und PlatformInfo auf beiden Seiten. Verweis auf `plan/00-uebersicht.md` für den vollständigen Backend-Vertrag.

**Toolchain**

- Ausschließlich `bun`. Niemals `npm`, `npx`, `yarn` oder `pnpm`.
- Befehle, jeweils aus `frontend/`: `bun install`, `bun run dev`, `bun run build`, `bun run test`, `bun run lint`, `bun run typecheck`, `bun run format`
- Backend lokal: `dotnet run --project source/HomeBook.Backend` — lauscht auf `http://localhost:5032`, API-Referenz unter `/scalar`

**Sprachregelung**

- Code, Bezeichner, Kommentare, Dokumentationskommentare, Commit-Messages und PR-Beschreibungen: **Englisch**
- `AGENTS.md` und die Dateien in `plan/`: **Deutsch**
- Benutzersichtbare Texte: niemals direkt im Template, immer über `t()`

**Vue- und TypeScript-Konventionen**

- `<script setup lang="ts">`, Composition API. Keine Options API, keine Mixins.
- TypeScript `strict`. Kein `any`; wo ein Typ wirklich unbekannt ist, `unknown` plus Narrowing.
- Props und Emits typisiert deklarieren, Defaults über `withDefaults`.
- Wiederverwendbare Logik als Composable `useXyz()` in `composables/`.
- Pinia-Stores in Setup-Syntax, ein Store pro Belang.
- Komponentendateien in PascalCase, Composables in camelCase mit `use`-Präfix.

**Namenskonventionen aus dem Bestand**

- `Ui*` für Design-System-Komponenten in `@homebook/ui`
- `Hb*` für modulspezifische Komponenten
- CSS-Klassen: `hb-` für Layout und App-Chrome, `ui-` für Komponenten; BEM-artige Modifier wie `ui-search-component__item-title` sind in Ordnung

**Styling**

- SCSS, in Komponenten als `<style scoped lang="scss">`
- **Keine hartkodierten Farben, Abstände, Radien oder Schriftgrößen.** Immer `--hb-*`-Token oder PrimeVue-Token.
- Neue Token gehören nach `@homebook/ui`, nicht in eine einzelne Komponente.
- CSS-Layer-Reihenfolge ist `primevue, hb`. Wer PrimeVue überschreibt, tut das im `hb`-Layer, nicht per `!important`.
- Responsiv über die definierten Breakpoints: 0 / 600 / 960 / 1280 / 1920 / 2560 / 3840 / 5120.

**Internationalisierung**

- Kein sichtbarer String ohne `t()`.
- Keys in camelCase, verschachtelt nach Bereich, etwa `settings.users.addButton`.
- Ein neuer Key wird in **allen** Katalogen angelegt (`de-DE`, `en-US`, `fr-FR`); fehlende Übersetzungen als Kopie des englischen Werts, nie leer.
- Modulspezifische Keys gehören in den Katalog des jeweiligen Modul-Packages.

**API-Zugriff**

- Nur über `@homebook/api-client`. Kein direktes `fetch` auf das Backend.
- Fehler **nach Statuscode** behandeln, nie nach dem Text des Bodys — die Bodies sind inkonsistent und nicht lokalisiert.
- 401 bedeutet: abmelden und zur Anmeldung. Es gibt keinen Token-Refresh.
- Uploads sind JSON mit base64-Inhalt, nicht multipart. Grenze 20 MB, vorher clientseitig prüfen.

**Tests**

- Vitest plus `@vue/test-utils`, Umgebung happy-dom.
- Testdatei liegt neben der Quelldatei: `UiValueCard.vue` bekommt `UiValueCard.spec.ts`.
- Getestet wird: jede Komponente mit Logik (bedingtes Rendern, Events, berechnete Werte), jeder Store, jedes Composable, jede Hilfsfunktion.
- Nicht getestet wird: reines Markup ohne Verzweigung, generierter Code.
- Der API-Client wird gemockt, nie echt aufgerufen.

**Definition of Done** für jeden Schritt: `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch.

**Git**

- Branch- und Commit-Präfix `HB-<Nummer>: `, Message auf Englisch im Imperativ
- Kein Commit auf `main`
- `.editorconfig` beachten: CRLF, abschließende Leerzeile, keine Leerzeichen am Zeilenende

**Was nicht getan wird**

- Keine neue Abhängigkeit ohne Begründung im PR — zuerst prüfen, ob PrimeVue, VueUse oder das eigene UI-Package es schon können
- Kein Umbau des Backends. Einzige Ausnahme: der OpenAPI-Transformer aus Schritt 02
- Keine Änderung an `nginx.conf`
- Keine Änderung an den Blazor-Projekten unter `source/HomeBook.Frontend*` — sie bleiben bis Schritt 11 unverändert lauffähig
- Kein Dark Mode in dieser Migration
- Kein Umbenennen oder Neustrukturieren von Routen

### 2. Skills von skills.sh installieren

**Erledigt.** Vier Skills sind projektlokal nach `.claude/skills/` installiert und eingecheckt:

```
npx skills add github/awesome-copilot          -s dotnet-best-practices -a claude-code -y --copy
npx skills add vuejs-ai/skills                 -s vue-best-practices    -a claude-code -y --copy
npx skills add nextlevelbuilder/ui-ux-pro-max-skill -s ui-ux-pro-max    -a claude-code -y --copy
npx skills add anthropics/skills               -s frontend-design       -a claude-code -y --copy
```

`--copy` statt Verlinkung, damit die Skills eingecheckt werden und auf jedem Rechner und in CI verfügbar sind. Der Agent-Bezeichner ist `claude-code`, nicht `claude`.

Wann welcher Skill zu verwenden ist, steht in `AGENTS.md` im Abschnitt „Skills". Wichtigster Punkt dort: `frontend-design` wird beim **Nachbau** bestehender Seiten **nicht** geladen — er drängt zu eigenständigen Gestaltungsentscheidungen, was bei einer 1:1-Portierung genau das Falsche ist.

Sobald Bun installiert ist, statt `npx` entsprechend `bunx` verwenden.

### 3. Projekteigene Skills

Auf skills.sh gibt es nichts Vue-Spezifisches, deshalb vier eigene als `.claude/skills/<name>/SKILL.md`. Jede mit YAML-Frontmatter (`name`, `description`) und knappem, konkretem Inhalt mit Codebeispielen aus diesem Repository.

| Skill | Inhalt |
|---|---|
| `homebook-vue-component` | Wie eine Komponente hier aussieht: Dateiaufbau, Props und Emits, scoped SCSS, Token-Nutzung, `t()`, Testdatei daneben. Ein vollständiges Beispiel. |
| `homebook-testing` | Vitest-Konventionen, der `mountWithPlugins`-Helper (PrimeVue, i18n, Pinia, Router vorkonfiguriert), API-Client mocken, was getestet wird und was nicht. |
| `homebook-api-client` | Client regenerieren (`scripts/generate-openapi.sh`, `scripts/generate-clients.sh`), wann das nötig ist, Auth-Provider, Fehlerbehandlung nach Statuscode, die Eigenheiten aus `plan/00-uebersicht.md`: base64-Upload, Suchparameter `s`, Pflicht-`searchFilter`, fehlendes `/api`-Präfix bei Medien-URLs. |
| `homebook-i18n` | Key anlegen, Namenskonvention, alle Kataloge, wo Modul-Kataloge liegen, Hinweis auf Weblate. |

Die Skills, die auf Artefakte aus Schritt 02 und 03 verweisen, dürfen zunächst schlank bleiben und werden in Schritt 12 nachgezogen.

### 4. Bun-Workspace-Skelett

`frontend/package.json` als privates Workspace-Root:

- `"private": true`
- `"workspaces": ["apps/*", "packages/*"]`
- Root-Skripte, die per `bun run --filter` durchreichen: `dev`, `build`, `test`, `lint`, `typecheck`, `format`
- `packageManager` auf die verwendete Bun-Version, zusätzlich `.bun-version` im Repository-Wurzelverzeichnis

Leere Package-Verzeichnisse mit jeweils einer minimalen `package.json` anlegen: `apps/web`, `packages/api-client`, `packages/ui`, `packages/module-kitchen`, `packages/module-finances`, `packages/module-platform-info`.

`.gitignore` ergänzen: `node_modules/`, `dist/`, `coverage/`, `*.tsbuildinfo`.
`.dockerignore` ergänzen: `frontend/**/node_modules`, `frontend/**/dist`.

---

## Akzeptanzkriterien

- [x] `AGENTS.md` existiert, ist deutsch und deckt alle oben genannten Abschnitte ab
- [x] `bunx skills list` zeigt die vier bezogenen Skills
- [x] Bun ist installiert, `bun --version` funktioniert — 1.4.2
- [x] `.claude/skills/` enthält zusätzlich die vier projekteigenen Skills, jede mit gültigem Frontmatter
- [x] `bun install` in `frontend/` läuft fehlerfrei durch und erzeugt `bun.lock`
- [x] `.gitignore` und `.dockerignore` sind ergänzt
- [x] Die Blazor-Projekte bauen unverändert: `dotnet build homebook.slnx` — 0 Fehler

## Stand

**Dieser Schritt ist abgeschlossen.** Bun 1.4.2 ist installiert und in `.bun-version` sowie in
`packageManager` festgeschrieben. Ab jetzt gilt die Regel aus `AGENTS.md` ohne Ausnahme: kein
`npm`, kein `npx` — stattdessen `bun` und `bunx`.

Drei Festlegungen, die bei der Umsetzung dazukamen und für die folgenden Schritte gelten:

- **Die Root-Skripte tragen `--if-present`.** Ohne das bricht `bun run build` ab, solange kein
  Workspace-Member das Skript definiert — die Definition of Done wäre bis Schritt 03 rot
  gewesen. Mit `--if-present` läuft die Kette schon jetzt grün durch.
- **Der Filter heißt `--filter '@homebook/*'`.** Alle sechs Member liegen im Scope, die
  Workspace-Wurzel heißt bewusst `homebook-frontend` ohne Scope und kann so nicht sich selbst
  treffen.
- **`.editorconfig` hat einen Abschnitt `[frontend/**]`** mit `indent_size = 2`. `end_of_line`
  bleibt `crlf` aus `[*]` geerbt. Pfadgebunden statt nach Dateiendung, damit `source/**/*.json`
  und die Workflow-YAMLs bei 4 Leerzeichen bleiben.

Eine Abhängigkeit war **nicht** nötig: `bun install` behält `bun.lock` auch ohne jedes Paket,
weil die sechs Workspace-Member selbst als Pakete zählen.

## Nicht in diesem Schritt

- Keine Vue-App, keine Abhängigkeiten außer dem Workspace-Gerüst
- Keine Änderungen an Dockerfile oder Workflows
