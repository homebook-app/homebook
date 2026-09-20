# 03 — Projekt-Setup: Vite, Vue, TypeScript, PrimeVue, Tooling

**Voraussetzung:** Schritt 01.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Eine lauffähige, leere Vue-3-App inklusive vollständiger Werkzeugkette. Nach diesem Schritt startet `bun run dev`, es erscheint eine leere Seite, und alle Qualitätsbefehle laufen grün durch.

Noch keine Gestaltung, keine Seiten, keine Geschäftslogik.

---

## Aufgaben

### 1. App-Gerüst `frontend/apps/web`

- Vite mit `@vitejs/plugin-vue`
- `index.html` mit `lang`-Attribut, Viewport-Meta wie im Bestand (`width=device-width, initial-scale=1.0`), Favicon, Web-App-Manifest und Apple-Touch-Icons. Vorlage: `backend/HomeBook.Frontend/wwwroot/index.html` und `manifest.webmanifest` (Name `HomeBook`, `display: standalone`, `theme_color: #03173d`, Icons 192 und 512).
- `src/main.ts`, `src/App.vue`
- Ordnerstruktur anlegen: `src/router/`, `src/layouts/`, `src/pages/`, `src/stores/`, `src/composables/`, `src/locales/`
- Kein Service Worker — der Bestand hat keinen, und Offline-Betrieb ist nicht Teil dieser Migration

### 2. `vite.config.ts`

- Alias `@` auf `src`
- SCSS-Preprocessor mit automatisch eingebundenen Token aus `@homebook/ui` (ab Schritt 04 relevant, hier schon vorbereiten)
- Dev-Proxy: `/api` auf `http://localhost:5032`, damit in der Entwicklung same-origin gearbeitet wird. Das ist nötig, weil das Backend in der Produktion **kein** CORS hat und man sich sonst ein Verhalten angewöhnt, das später bricht.
- Build-Ausgabe nach `dist/`, Chunking mit Augenmaß

### 3. TypeScript

- `tsconfig` mit `strict: true`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`
- Project References auf die Workspace-Packages
- `vue-tsc` als Typecheck-Skript

### 4. Laufzeitkonfiguration

`frontend/apps/web/public/appsettings.json` in **exakt der heutigen Struktur** anlegen — Vorlage `backend/HomeBook.Frontend/wwwroot/appsettings.json`:

```json
{
  "Version": "0.0.0",
  "Backend": { "Host": "/api" },
  "FeatureManagement": { "WidgetMenu": false },
  "Upload": { "MaxFileSizeBytes": 20971520 }
}
```

Die Struktur muss erhalten bleiben, weil `.github/workflows/build.yml` per `sed` die Versionsnummer in genau dieses Feld stempelt.

Dazu ein Loader, der die Datei **vor** dem Mount der App holt, sie gegen ein Schema validiert und in einem typisierten Konfigurationsobjekt bereitstellt. Ein Composable `useAppConfig()` liefert sie an den Rest der App. Beim Fehlschlag eine verständliche Fehlerseite statt einer weißen Seite.

### 5. PrimeVue registrieren

PrimeVue 4 mit `@primeuix/themes` einbinden, zunächst mit dem unveränderten Aura-Preset — das eigene Preset kommt in Schritt 04. Wichtig ist schon jetzt die CSS-Layer-Konfiguration, damit die eigene Schicht später gewinnt:

```
theme: {
  preset: Aura,
  options: {
    darkModeSelector: false,
    cssLayer: { name: 'primevue', order: 'primevue, hb' }
  }
}
```

`darkModeSelector: false`, weil es in dieser Migration keinen Dark Mode gibt.

Zusätzlich `ToastService`, `ConfirmationService` und `DialogService` registrieren — sie ersetzen `MudSnackbarProvider` und `MudDialogProvider`.

### 6. Pinia, vue-router, vue-i18n

Jeweils registrieren und minimal konfigurieren:

- Router mit `createWebHistory` und vorerst einer einzigen Platzhalterroute
- i18n mit `legacy: false`, Fallback `en-US`, vorerst leeren Katalogen (Befüllung in Schritt 06)
- Pinia ohne Plugins

### 7. Linting, Formatierung, Tests

- ESLint 9 Flat Config mit `eslint-plugin-vue` und `typescript-eslint`, Prettier als Formatter. `src/generated/` im api-client ausnehmen.
- Vitest mit happy-dom, globals aktiviert, Coverage über v8 als `lcov` nach `coverage/` — das Format braucht Schritt 11 für SonarCloud.
- Ein Test-Setup-Modul, das PrimeVue, i18n, Pinia und Router für Komponententests vorkonfiguriert, plus ein `mountWithPlugins`-Helper. Der Helper ist die Grundlage aller folgenden Tests und wird im Skill `homebook-testing` dokumentiert.
- Ein erster, trivialer Test, damit die Kette nachweislich läuft

### 8. Root-Skripte

In `frontend/package.json`: `dev`, `build`, `preview`, `test`, `test:watch`, `test:coverage`, `lint`, `lint:fix`, `format`, `typecheck`. Jeweils über alle Workspaces.

---

## Akzeptanzkriterien

- [ ] `bun run dev` startet, die Seite lädt ohne Konsolenfehler
- [ ] Der Dev-Proxy funktioniert: bei laufendem Backend liefert `/api/version` im Browser eine Antwort
- [ ] `bun run build` erzeugt `dist/` ohne Warnungen
- [ ] `bun run lint`, `bun run typecheck`, `bun run test` laufen grün
- [ ] `public/appsettings.json` hat die unveränderte Struktur und wird vor dem Mount geladen
- [ ] Die Coverage-Ausgabe liegt als lcov vor

## Nicht in diesem Schritt

- Keine Gestaltung, keine Token, kein eigenes Preset — das ist Schritt 04
- Keine Seiten, kein Layout, keine Authentifizierung
- Keine Änderungen an Dockerfile oder Workflows

---

## Umsetzungsnotizen

Umgesetzt auf Branch `HB-188`. Abweichungen vom Text oben:

- **Der Dev-Proxy schneidet `/api` ab.** Das Backend mappt seine Endpunkte an der Wurzel (`/version`, nicht `/api/version`), und nginx entfernt das Präfix mit `proxy_pass http://127.0.0.1:5000/;`. Ohne `rewrite` im Vite-Proxy liefert `/api/version` 404. Dasselbe gilt für `preview`.
- **Chunking über `build.rolldownOptions.output.codeSplitting.groups`.** Vite 8 baut mit rolldown; `manualChunks` ist dort abgelöst. Zwei Gruppen: `vue` und `primevue`.
- **`mountWithPlugins` liegt in einem eigenen Package `frontend/packages/test-utils`** (`@homebook/test-utils`), nicht unter `apps/web/src/test/`. Specs in `packages/ui` und den Modul-Packages können nicht aus der App importieren. Das Package enthält auch das gemeinsame Vitest-Setup; die geteilten Testeinstellungen stehen in `frontend/vitest.shared.ts`.
- **Workspace-Packages werden aus dem Quellcode konsumiert.** `ui`, `module-*` und `test-utils` exportieren `./src/index.ts` direkt. `api-client` behält seinen tsup-Build, hat aber zusätzlich die Export-Condition `homebook:source` auf `./src/index.ts`. `tsconfig.base.json` (`customConditions`) und Vite (`resolve.conditions`) aktivieren sie. Dadurch braucht `lint && typecheck && test && build` auf einem frischen Clone keinen vorherigen Build von api-client.
- **Typecheck pro Workspace mit `vue-tsc --noEmit`**, nicht `--build`. Das Root-`tsconfig.json` führt die Project References für die IDE; ein Build-Modus würde `composite` und Emit in allen Packages erzwingen.
- **`lint`, `lint:fix` und `format` laufen als ein Aufruf im Root** (`eslint .`, `prettier --write .`) statt per `--filter` durch die Workspaces. Eine Konfiguration, ein Prozess, und `.` deckt alle Workspaces ab.
- **Prettier mit `endOfLine: 'auto'`.** Die Zeilenenden regeln `.editorconfig` und git; bun schreibt `package.json` mit LF, und ein festes `crlf` würde später auf der Linux-CI scheitern.
- **Geteilte Versionen stehen im Bun-`catalog`** der Root-`package.json` (vue, vue-router, pinia, vue-i18n, primevue, `@primeuix/themes`, `@vue/test-utils`, `@vue/devtools-api`), damit es genau eine Vue-Instanz gibt. `@primeuix/themes` ist auf 2.0.3 gepinnt: 3.x gehört zu einer neueren `@primeuix/styled`-Generation als PrimeVue 4.5. `@vue/devtools-api` 8 ist explizit deklariert, weil Pinia 4 es als Peer verlangt und sonst die 6er-Version von vue-router aufgelöst wird.
- **Die Konfiguration wird ohne Schema-Bibliothek geprüft**, mit einer handgeschriebenen `parseAppConfig(unknown)`. Geladen wird sie per `fetch` — `appsettings.json` ist ein statisches Asset, kein Backend-Endpunkt. `useAppConfig()` ist ein Modul-Singleton, damit auch Stores und Router-Guards ohne Komponentenkontext darauf zugreifen können.
- **Die Boot-Fehlerseite ist die eine Ausnahme von „kein String ohne `t()`“.** Sie erscheint, bevor vue-i18n läuft, und bringt ihre drei kurzen Texte (de, en, fr) selbst mit. Vermerkt im Skill `homebook-i18n`.
- `<Toast>`, `<ConfirmDialog>` und `<DynamicDialog>` sind noch nicht im Template — die Services sind registriert, die Host-Komponenten gehören ins Layout aus Schritt 06.
- Geprüft wurde der Proxy mit `curl` gegen den laufenden Dev-Server und das laufende Backend. Die Browser-Konsole wurde nicht in einem echten Browser kontrolliert.
