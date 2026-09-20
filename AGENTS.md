# AGENTS.md

Verbindliche Anweisungen für alle Agenten und Menschen, die in diesem Repository arbeiten. Diese Datei zuerst lesen.

---

## Das Projekt

**HomeBook** ist eine selbst gehostete Web-Anwendung zur Organisation von Haushalt und gemeinsamer Finanzplanung.

- **Backend:** .NET 10, Minimal APIs, modular. Unter `backend/HomeBook.Backend*`.
- **Frontend:** Vue 3 Single-Page-Anwendung. Unter `frontend/`.
- **Auslieferung:** ein Docker-Image mit zwei Prozessen — nginx auf `:8080` liefert das SPA statisch aus und leitet `/api/` an Kestrel auf `127.0.0.1:5000` weiter.
- **Datenbanken:** PostgreSQL, MySQL, SQLite.
- **Module:** Kitchen und Finances existieren auf beiden Seiten, PlatformInfo nur im Frontend. Die Modularität ist Absicht und bleibt erhalten.

Das Frontend wurde von Blazor WebAssembly auf Vue migriert. Der vollständige Backend-Vertrag — Endpunkte, Authentifizierung, Eigenheiten — steht in [`plan/00-uebersicht.md`](plan/00-uebersicht.md). **Vor der Arbeit an einer Stelle, die das Backend aufruft, dort nachlesen.**

---

## Toolchain

**Ausschließlich `bun`.** Niemals `npm`, `npx`, `yarn` oder `pnpm`.

Alle Frontend-Befehle aus `frontend/`:

| Befehl | Zweck |
|---|---|
| `bun install` | Abhängigkeiten installieren |
| `bun run dev` | Entwicklungsserver mit Proxy auf das lokale Backend |
| `bun run build` | Produktionsbuild nach `apps/web/dist` |
| `bun run test` | Vitest einmalig |
| `bun run test:watch` | Vitest im Beobachtungsmodus |
| `bun run test:coverage` | Tests mit lcov-Abdeckung |
| `bun run lint` / `lint:fix` | ESLint |
| `bun run format` | Prettier |
| `bun run typecheck` | `vue-tsc` |

Backend lokal starten:

```
dotnet run --project backend/HomeBook.Backend
```

Lauscht auf `http://localhost:5032`, API-Referenz unter `/scalar`. Der Vite-Proxy leitet `/api` dorthin.

API-Client neu erzeugen, nachdem sich Backend-Endpunkte geändert haben:

```
./scripts/generate-clients.sh
```

---

## Sprache

- **Englisch:** Code, Bezeichner, Kommentare, Dokumentationskommentare, Commit-Messages, PR-Beschreibungen
- **Deutsch:** diese Datei und die Dateien in `plan/`
- **Übersetzt:** jeder benutzersichtbare Text, nie direkt im Template

---

## Vue und TypeScript

- `<script setup lang="ts">`, Composition API. Keine Options API, keine Mixins.
- TypeScript `strict`. Kein `any` — wo ein Typ wirklich unbekannt ist, `unknown` plus Narrowing.
- Props und Emits typisiert deklarieren, Defaults über `withDefaults`.
- Wiederverwendbare Logik als Composable `useXyz()` in `composables/`.
- Pinia-Stores in Setup-Syntax, ein Store pro Belang.
- Komponentendateien PascalCase, Composables camelCase mit `use`-Präfix.

### Namenskonventionen

Aus dem Bestand übernommen, bitte fortführen:

- `Ui*` — Design-System-Komponenten in `@homebook/ui`
- `Hb*` — modulspezifische Komponenten
- CSS-Klassen: `hb-` für Layout und App-Chrome, `ui-` für Komponenten. BEM-artige Modifier wie `ui-search-component__item-title` sind in Ordnung.

---

## Styling

- SCSS, in Komponenten als `<style scoped lang="scss">`.
- **Keine hartkodierten Farben, Abstände, Radien oder Schriftgrößen.** Immer `--hb-*`-Token oder PrimeVue-Token.
- Neue Token gehören nach `@homebook/ui`, nicht in eine einzelne Komponente.
- CSS-Layer-Reihenfolge ist `primevue, hb`. Wer PrimeVue überschreibt, tut das im `hb`-Layer — **nicht** per `!important`.
- Breakpoints: 0 / 600 / 960 / 1280 / 1920 / 2560 / 3840 / 5120.
- Das visuelle Markenzeichen sind die Frosted-Glass-Stufen `.frosted-b1` bis `.frosted-b10` und das schwebende, abgerundete Chrome über einem bildschirmfüllenden Wallpaper. Wer daran etwas ändert, ändert das Erscheinungsbild der Anwendung — das ist keine Nebensache.

---

## Internationalisierung

- **Kein sichtbarer String ohne `t()`.**
- Schlüssel in camelCase, verschachtelt nach Bereich: `settings.users.addButton`.
- Ein neuer Schlüssel wird in **allen** Katalogen angelegt: `de-DE`, `en-US`, `fr-FR`. Fehlende Übersetzungen als Kopie des englischen Werts, **nie leer** — Weblate zeigt sonst nichts an.
- Modulspezifische Schlüssel gehören in den Katalog des jeweiligen Modul-Packages, nicht in den globalen.
- Übersetzt wird über [Weblate](https://hosted.weblate.org/projects/homebook/). Schlüssel nicht umbenennen, ohne die Folgen dort zu bedenken.

---

## API-Zugriff

- **Nur über `@homebook/api-client`.** Kein direktes `fetch` auf das Backend.
- Fehler **nach HTTP-Statuscode** behandeln, nie nach dem Text des Response-Bodys. Die Bodies sind inkonsistent — mal `ValidationProblemDetails`, mal nacktes JSON, mal Klartext — und nicht lokalisiert.
- **Es gibt keinen Token-Refresh.** Ein Token läuft nach 60 Minuten ab, `ClockSkew` ist null. Bei 401: abmelden und zur Anmeldung.
- Uploads sind **JSON mit base64-Inhalt**, nicht `multipart/form-data`. Grenze 20 MB, clientseitig vor dem Absenden prüfen.
- Weitere Eigenheiten (Suchparameter heißt `s`, `searchFilter` ist bei der Rezeptliste Pflicht, Medien-URLs kommen ohne `/api`-Präfix) sind im Client gekapselt und gehören dort hin, nicht in die aufrufende Stelle.

---

## Tests

- Vitest mit `@vue/test-utils`, Umgebung happy-dom.
- Testdatei liegt **neben** der Quelldatei: `UiValueCard.vue` bekommt `UiValueCard.spec.ts`.
- Getestet wird: jede Komponente mit Logik (bedingtes Rendern, Events, berechnete Werte), jeder Store, jedes Composable, jede Hilfsfunktion.
- Nicht getestet wird: reines Markup ohne Verzweigung, generierter Code.
- Der API-Client wird **gemockt**, nie echt aufgerufen.
- Zum Mounten den Helfer `mountWithPlugins` verwenden — er bringt PrimeVue, i18n, Pinia und Router vorkonfiguriert mit.

Es gibt bewusst **keine** End-to-End-Tests. Wer welche einführen will, stimmt das vorher ab.

---

## Definition of Done

Ein Schritt gilt erst als fertig, wenn das hier durchläuft:

```
bun run lint && bun run typecheck && bun run test && bun run build
```

Bei Änderungen am Backend zusätzlich:

```
dotnet build homebook.slnx && dotnet test backend/HomeBook.UnitTests/HomeBook.UnitTests.csproj
```

---

## Git

- Branch- und Commit-Präfix `HB-<Nummer>: `, Message auf Englisch im Imperativ.
- Kein Commit direkt auf `main`.
- `.editorconfig` beachten: CRLF, abschließende Leerzeile, keine Leerzeichen am Zeilenende.

---

## Skills

Unter `.claude/skills/` liegen Agent-Skills. Sie sind eingecheckt, gelten also für alle. Zwei Gruppen: die **bezogenen** Skills stammen von skills.sh und werden in `skills-lock.json` mit Herkunft und Hash nachgehalten; die **projekteigenen** (`homebook-*`) haben kein Upstream, stehen nicht in der Lock-Datei und werden hier gepflegt.

Wann welcher zu laden ist:

| Skill | Wann verwenden |
|---|---|
| **`homebook-vue-component`** | Bei jeder Arbeit an einer `.vue`-Datei unter `frontend/`. Wo die Datei hingehört, `Ui*`/`Hb*`, typisierte Props und Emits, scoped SCSS nur mit Token, `t()`, Testdatei daneben. Zusammen mit `vue-best-practices` laden. |
| **`homebook-testing`** | Beim Anlegen oder Ändern einer `*.spec.ts`. Ablage neben der Quelldatei, `mountWithPlugins`, API-Client mocken, was getestet wird und was nicht. |
| **`homebook-api-client`** | **Vor** jedem Code, der das Backend aufruft, und beim Neuerzeugen des Clients. Fehlerbehandlung nach Statuscode, kein Token-Refresh, base64-Uploads, die Eigenheiten des Backend-Vertrags. |
| **`homebook-i18n`** | Sobald ein benutzersichtbarer String entsteht oder sich ändert. Key-Konvention, Kataloge, Weblate. |
| **`vue-best-practices`** | **Bei jeder Arbeit an Vue-Code.** Sobald eine `.vue`-Datei, ein Composable, ein Pinia-Store, eine Router-Konfiguration oder Vite-mit-Vue im Spiel ist. Deckt Composition API mit `<script setup>`, Reaktivität, Slots, Transitions, asynchrone Komponenten und Performance-Muster ab. Die Standards dieses Repositories (Composition API, TypeScript, keine Options API) decken sich mit dem Skill — wo er etwas genauer sagt, gilt er. |
| **`ui-ux-pro-max`** | Wenn eine Oberfläche **entworfen, umgebaut oder überprüft** wird: neue Seite, neue Komponente, Layoutfrage, Responsive-Verhalten, Zugänglichkeit, Interaktions- und Ladezustände, Diagramme. Nicht laden für reine Logik-, API- oder Infrastrukturarbeit. Besonders hilfreich für den Zugänglichkeits- und Interaktionsteil (Kontrast, Zielgrößen, Tastaturbedienung) — dort hat das Projekt heute die größten Lücken. |
| **`frontend-design`** | Nur wenn **gestalterisch neu entschieden** wird, also bei einer Oberfläche ohne Vorbild. **Beim Nachbau bestehender Seiten nicht laden** — die visuelle Richtung steht bereits fest, sie kommt aus den Token in `@homebook/ui` und dem Blazor-Bestand. Der Skill drängt bewusst zu eigenständigen, abweichenden Gestaltungsentscheidungen; das ist bei einer 1:1-Portierung genau falsch. |
| **`dotnet-best-practices`** | Bei Arbeit an C#-Code unter `backend/`, etwa dem OpenAPI-Transformer oder Backend-Tests. Für Frontend-Arbeit irrelevant. |

Einen bezogenen Skill hinzufügen oder aktualisieren:

```
bunx skills add <owner>/<repo> -s <skill-name> -a claude-code -y --copy
bunx skills update
bunx skills list
```

`--copy` ist Absicht: die Skills werden kopiert statt verlinkt, damit sie eingecheckt werden und auf jedem Rechner und in CI verfügbar sind.

> Hinweis: `ui-ux-pro-max` bringt rund 3,1 MB Referenzdaten mit und macht damit fast das gesamte Gewicht von `.claude/` aus. Das ist bekannt und in Kauf genommen.

---

## Was nicht getan wird

- **Keine neue Abhängigkeit ohne Begründung im PR.** Zuerst prüfen, ob PrimeVue, VueUse oder `@homebook/ui` es schon können.
- **Kein Umbau des Backends** im Rahmen von Frontend-Arbeit.
- **Keine Änderung an `nginx.conf`, `docker-entrypoint.sh` oder der finalen Docker-Stufe.**
- **Kein Dark Mode.** Er ist bewusst nicht umgesetzt, auch wenn die Wallpaper helle und dunkle Varianten mitbringen.
- **Routen nicht umbenennen oder umstrukturieren.** Die Schreibweise ist zeichengenau übernommen (`/Login`, nicht `/login`), damit bestehende Lesezeichen funktionieren.
- **Platzhalterseiten nicht ausbauen** — `/Settings`, `/Settings/Database`, `/Settings/Ai`, `/Settings/Feedback`, `/Kitchen/Pantry`, `/Finances/Settings`. Sie existieren, damit Navigation und Verlinkung vollständig sind.
- **Attrappen nicht für echte Features halten.** Wochen-Speiseplan, Finanzübersicht und `CurrentBudgetWidget` zeigen erfundene Daten, weil es dafür keine Backend-Endpunkte gibt. Die Beispieldaten liegen in erkennbar benannten Fixture-Dateien. Wer daran etwas ändert, baut entweder das Backend dazu oder lässt es.

---

## Wo was liegt

```
frontend/
  apps/web/                    # die Anwendung: Layouts, Seiten, Router, Stores
  packages/api-client/         # @homebook/api-client — aus OpenAPI generiert
  packages/ui/                 # @homebook/ui — Token, SCSS, Ui*-Komponenten, Icons
  packages/module-kitchen/     # Rezepte, Speiseplan
  packages/module-finances/    # Sparziele
  packages/module-platform-info/
backend/                       # .NET-Backend und der C#-Client
scripts/
  generate-openapi.sh          # vollständige OpenAPI-Spezifikation erzeugen
  generate-clients.sh          # C#- und TypeScript-Client daraus generieren
plan/                          # Migrationsmaterial, siehe 00-uebersicht.md
.claude/skills/                # Agent-Skills, siehe Abschnitt "Skills"
```

`packages/api-client/src/generated/` ist generierter Code. **Nicht von Hand ändern** — stattdessen `scripts/generate-clients.sh` ausführen.
