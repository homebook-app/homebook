# 00 — Übersicht und geteilter Kontext

> Diese Datei wird **jedem** Agenten zusammen mit seiner Schritt-Datei mitgegeben.
> Sie enthält keine Aufgaben, sondern den Kontext, den alle Schritte brauchen.

---

## Worum es geht

HomeBook ist eine selbst-gehostete Haushalts-App. Das Repository enthält:

- ein **.NET 10 Backend** (Minimal APIs, modular) unter `backend/HomeBook.Backend*`
- ein **Blazor-WebAssembly-Frontend** unter `backend/HomeBook.Frontend*`

Beide werden in **ein Docker-Image** gepackt: nginx lauscht auf `:8080`, liefert das SPA statisch aus und proxied `/api/` an Kestrel auf `127.0.0.1:5000`.

**Ziel der Migration:** Das Blazor-Frontend wird durch eine **Vue-3-App** ersetzt, die
1. **optisch nahezu identisch** ist und
2. **100 % denselben Funktionsumfang** bietet.

Erst wenn beides erreicht ist (Schritt 11), werden die Blazor-Projekte entfernt. Bis dahin bleibt der Bestand unangetastet und lauffähig — er ist die **Referenz**, gegen die verglichen wird.

---

## Tech-Stack der neuen App

| Bereich | Entscheidung |
|---|---|
| Toolchain | **Bun** — Paketmanager, Script-Runner, Workspaces. Niemals `npm`/`npx`/`yarn`/`pnpm`. |
| Bundler | **Vite** + `@vitejs/plugin-vue` |
| Framework | **Vue 3**, Composition API, `<script setup lang="ts">` |
| Sprache | **TypeScript**, `strict: true` |
| UI-Framework | **PrimeVue 4** + `@primeuix/themes`, eigenes Preset auf Aura-Basis |
| Styling | **SCSS**, portierte `--hb-*`-Token-Schicht, PrimeVue-Layer untergeordnet |
| Routing | **vue-router 4** |
| State | **Pinia** (Setup-Syntax) |
| i18n | **vue-i18n**, JSON-Kataloge |
| API-Client | **Kiota** (TypeScript-Target) als eigenes Workspace-Package |
| Tests | **Vitest** + `@vue/test-utils` + happy-dom. Kein E2E, kein Playwright. |
| Lint | ESLint 9 flat config + `eslint-plugin-vue` + `typescript-eslint` + Prettier, `vue-tsc` |

---

## Zielstruktur im Repository

```
frontend/
  package.json                 # Bun-Workspace-Root
  bun.lock
  apps/
    web/
      index.html
      public/appsettings.json
      public/wallpaper/<name>/ # die drei animierten iframe-Wallpaper
      src/{main.ts,App.vue,router/,layouts/,pages/,stores/,composables/,locales/}
      vite.config.ts
  packages/
    api-client/                # @homebook/api-client
    ui/                        # @homebook/ui  (Design-System, Tokens, Icons)
    module-kitchen/            # @homebook/module-kitchen
    module-finances/           # @homebook/module-finances
    module-platform-info/      # @homebook/module-platform-info
backend/                       # das .NET-Backend, der C#-Client und die Tests
scripts/
  generate-openapi.sh
  generate-clients.sh
  extract-icons.ts
  migrate-resx.ts
plan/                          # diese Prompt-Dateien
AGENTS.md
.claude/skills/
```

`nginx.conf` bleibt **unverändert** — SPA-Fallback und `/api`-Proxy sind bereits generisch.

---

## Der Backend-Vertrag

Das Backend wird **nicht** umgebaut. Einzige Ausnahme ist Schritt 02 (OpenAPI-Dokument). Alles Folgende ist gegeben und muss exakt so bedient werden.

### Basis-URL

In der Produktion liegt alles hinter `/api` (nginx `proxy_pass http://127.0.0.1:5000/` — mit abschließendem Slash, das `/api`-Präfix wird also abgeschnitten). Im Code stehen Routen root-relativ; der Client bekommt `/api` als Basis-URL aus `appsettings.json` (`Backend.Host`).

### Boot-Sequenz

`GET /api/setup/availability` liefert **per Statuscode**:

| Code | Bedeutung | Reaktion |
|---|---|---|
| 200 | Setup erforderlich | Weiterleitung nach `/Setup` |
| 201 | Update erforderlich | Weiterleitung nach `/Setup` (Update-Zweig) |
| 204 | Betriebsbereit | normal weiter, ggf. nach `/Login` |
| 409 | Setup läuft bereits | Hinweis anzeigen |

### Authentifizierung

- `POST /api/account/login` mit `{ username, password }` → `{ token, refreshToken, expiresAt, userId, username }`
- **Es gibt keinen Refresh-Endpunkt.** `refreshToken` wird zwar geliefert, ist aber nirgends einlösbar. Token läuft nach 60 Minuten ab, `ClockSkew = 0`. Bei Ablauf oder 401: abmelden und neu anmelden lassen.
- `POST /api/account/logout` ist serverseitig ein No-Op. Trotzdem aufrufen, dann lokal aufräumen.
- Jeder geschützte Aufruf braucht `Authorization: Bearer <token>`.
- Rollen: Nur Admins bekommen die Claims `role=Admin` und `IsAdmin=True`. Nicht-Admins haben **gar keinen** Rollen-Claim.
- Admin-Endpunkte werden serverseitig von einer eigenen Middleware geprüft, die bei Verstoß **Klartext** statt ProblemDetails zurückgibt.

> **Regel:** Fehler immer am **HTTP-Statuscode** festmachen, nie am Text des Response-Bodys. Die Bodies sind inkonsistent (mal `ValidationProblemDetails`, mal nacktes JSON-String, mal Klartext) und nicht lokalisiert.

### Zwei Laufzeitzustände

Das Backend entscheidet anhand von `Database:Provider`, ob es im Zustand `SETUP` oder `RUNNING` ist. Im `SETUP`-Zustand sind nur `/version`, `/system/*`, `/platform/*`, `/Development/*` und `/setup/*` gemappt — und es läuft **überhaupt keine** Auth-Middleware. Modul-Routen werden erst nach dem Build gemappt und existieren nur im `RUNNING`-Zustand.

### Endpunkte

**Setup** (anonym, in beiden Zuständen verfügbar)

| Methode | Route | Zweck |
|---|---|---|
| GET | `/setup/availability` | siehe oben |
| GET | `/setup/licenses` | `{ licensesAccepted, licenses[] }` |
| GET | `/setup/database/configuration` | per ENV vorbelegte DB-Konfiguration, 404 wenn keine |
| POST | `/setup/database/check` | Verbindung prüfen; 200 mit Provider-Name, 503 wenn nicht erreichbar |
| GET | `/setup/user` | 200/404 — ist ein Admin per ENV vorbelegt |
| GET | `/setup/configuration` | 200/404 — ist der Instanzname per ENV vorbelegt |
| POST | `/setup/start` | Setup ausführen; 422 wenn Lizenzen nicht akzeptiert |
| POST | `/update/start` | Migrationen ausführen, danach **beendet sich die App** (Neustart durch Docker) |

**Kern**

| Methode | Route | Auth | Zweck |
|---|---|---|---|
| GET | `/version` | – | Versionsstring |
| GET | `/platform/locales` | – | verfügbare Sprachen (`en-GB`, `en-US`, `de-DE`, `fr-FR`) |
| GET | `/info` | Bearer | `{ name, defaultLocale }` |
| GET | `/info/name` | – | Instanzname |
| GET | `/info/devmode` | – | `{ isActive }` |
| GET | `/info/default-locale` | – | z. B. `"de-DE"` |
| GET | `/Development/Config` | Bearer | Konfigurations-Dump (Developer-Seite) |
| GET | `/search?s=<query>` | Bearer | modulübergreifende Suche — **Parameter heißt `s`** |

**Benutzereinstellungen** (Bearer)

| Methode | Route |
|---|---|
| GET / POST | `/user/preferences/locale` |
| GET / POST | `/user/preferences/wallpaper` |

Das Wallpaper wird als **serialisierter String** im Feld `wallpaperConfiguration` übertragen. Struktur: `{ key, configuration, type, wallpaperKey }` mit `type ∈ { Static, Dynamic, Uploaded }`.

**System / Administration** (alle mit Admin-Pflicht)

| Methode | Route |
|---|---|
| GET / POST | `/system/users` (Query: `page`, `pageSize`, `username`) |
| GET / DELETE | `/system/users/{userId}` |
| PUT | `/system/users/{userId}/username` |
| PUT | `/system/users/{userId}/password` |
| PUT | `/system/users/{userId}/admin` |
| PUT | `/system/users/{userId}/enable` |
| PUT | `/system/users/{userId}/disable` |
| GET | `/system/instance/info` |
| PUT | `/system/instance/name` |
| PUT | `/system/instance/default-locale` |
| GET | `/system/storage/info` |
| GET | `/system/wallpaper` |
| GET | `/system/wallpaper/{**pfad}` (anonym, Rohbytes, 1 h Cache) |

Man kann sich nicht selbst löschen, deaktivieren oder die eigenen Adminrechte ändern — das Backend antwortet mit 400.

**Dateien und Medien**

| Methode | Route | Auth | Zweck |
|---|---|---|---|
| GET | `/storage/media/{mediaId}` | – | Rohbytes; **das ist die URL für `<img src>`** |
| GET | `/storage/files?filename=&scopeId=` | Bearer | Datei als base64 in JSON |
| POST | `/storage/files` | Bearer | **Upload: JSON `{ filename, content (base64), scopeId }`** → `{ mediaItemId }` |
| DELETE | `/storage/files?filename=&scopeId=` | Bearer | löschen |
| GET | `/storage/scopes?name=` | Bearer | Scope-GUID zu einem Namen |
| GET | `/media/{mediaId}/url` | Bearer | liefert `/storage/media/{id}` — **ohne** `/api`-Präfix, das muss der Client ergänzen |

> **Uploads sind kein `multipart/form-data`.** Datei clientseitig in base64 wandeln und als JSON schicken. Grenze 20 MB, durchgesetzt in Kestrel, in `appsettings.json` (`Upload.MaxFileSizeBytes`) und in nginx (`client_max_body_size 20m`). Vor dem Upload clientseitig prüfen.
>
> Bekannte Scope-Namen: `homebook.kitchen.RecipeImages`, `homebook.core.wallpaper.UserWallpaper`.

**Modul Kitchen** — Basis `/modules/homebook/kitchen`, alles Bearer

| Methode | Route |
|---|---|
| GET | `/recipes?searchFilter=` — **`searchFilter` ist Pflicht**, sonst 400 (leerer String für „alle") |
| GET | `/recipes/{id}` |
| GET | `/recipes/{id}/images` → `{ imageMediaIds }` |
| POST | `/recipes` |
| PUT | `/recipes/{id}` (Vollaktualisierung) |
| PATCH | `/recipes/{id}` (nur Umbenennen) |
| DELETE | `/recipes/{id}` |

**Modul Finances** — Basis `/modules/homebook/finances`, alles Bearer

| Methode | Route |
|---|---|
| POST | `/calculations/savings` |
| GET / POST | `/saving-goals` |
| PATCH | `/saving-goals/{savingGoalId}/name` |
| PATCH | `/saving-goals/{savingGoalId}/appearance` (`color`, `icon`) |
| PATCH | `/saving-goals/{savingGoalId}/amounts` |
| PATCH | `/saving-goals/{savingGoalId}/info` (`targetDate`) |
| DELETE | `/saving-goals/{id}` — **hier heißt der Parameter `id`, nicht `savingGoalId`** |

`interestRateOption`: `0 = NONE`, `1 = MONTHLY`, `2 = YEARLY`.

### CORS

In der Produktion gibt es **kein CORS** — same-origin über nginx. Nur im Development-Environment ist `AllowAnyOrigin` aktiv. Für die lokale Entwicklung deshalb den **Vite-Proxy** benutzen (`/api` → `http://localhost:5032`), nicht direkt cross-origin sprechen.

### Lokalisierung

Das Backend hat **keine** Lokalisierungsinfrastruktur. Fehlermeldungen sind hartkodierte englisch/deutsch gemischte Strings. Übersetzung ist vollständig Sache des Frontends.

---

## Die bestehende Oberfläche

### Routen (23 Stück, Schreibweise zeichengenau übernehmen)

| Route | Referenzdatei | Anmerkung |
|---|---|---|
| `/` | `Pages/Start.razor` | Kachelraster + Widget-Grid hinter Feature-Flag |
| `/Login` | `Pages/Account/Login.razor` | anonym, ContentOnlyLayout |
| `/Setup` | `Pages/Setup/SetupExperiance.razor` | anonym, ContentOnlyLayout |
| `/Settings` | `Pages/Settings/Overview.razor` | **Stub** |
| `/Settings/About` | `Pages/Settings/About.razor` | |
| `/Settings/Appearance` | `Pages/Settings/Appearance/Overview.razor` | Wallpaper-Auswahl |
| `/Settings/Localization` | `Pages/Settings/Localization.razor` | |
| `/Settings/Instance` | `Pages/Settings/Instance/Overview.razor` | Admin |
| `/Settings/Modules` | `Pages/Settings/Modules.razor` | Admin |
| `/Settings/Database` | `Pages/Settings/Database.razor` | **Stub**, Admin |
| `/Settings/Storage` | `Pages/Settings/Storage/Overview.razor` | Admin |
| `/Settings/Ai` | `Pages/Settings/Ai.razor` | **Stub**, Admin |
| `/Settings/Feedback` | `Pages/Settings/Feedback.razor` | **Stub** |
| `/Settings/Users` | `Pages/Settings/User/Overview.razor` | **nur Admin** |
| `/Settings/Users/Add` | `Pages/Settings/User/UserAdd.razor` | **nur Admin** |
| `/Settings/Users/{UserId:guid}` | `Pages/Settings/User/UserEdit.razor` | **nur Admin** |
| `/Settings/Developer` | `Pages/Settings/Developer/Overview.razor` | nur bei Dev-Mode |
| `/Settings/Developer/Components` | `…/Components.razor` | nur bei Dev-Mode |
| `/Settings/Developer/Colors` | `…/Colors.razor` | nur bei Dev-Mode |
| `/Settings/Developer/Icons` | `…/Icons.razor` | nur bei Dev-Mode |
| `/Kitchen/Recipes` | `Module.Kitchen/Pages/Recipes/Overview.razor` | |
| `/Kitchen/Recipes/New` | `Module.Kitchen/Pages/Recipes/Edit.razor` | gleiche Komponente wie Edit |
| `/Kitchen/Recipes/{RecipeId:guid}/Edit` | `Module.Kitchen/Pages/Recipes/Edit.razor` | |
| `/Kitchen/Recipes/{RecipeId:guid}/View` | `Module.Kitchen/Pages/Recipes/View.razor` | |
| `/Kitchen/MealPlan` | `Module.Kitchen/Pages/MealPlan/PlanOverview.razor` | |
| `/Kitchen/Pantry` | `Module.Kitchen/Pages/Pantry.razor` | **Stub** |
| `/Finances` | `Module.Finances/Pages/Overview.razor` | |
| `/Finances/Savings/Overview` | `Module.Finances/Pages/Saving/Overview.razor` | |
| `/Finances/Savings/Add` | `Module.Finances/Pages/Saving/Add.razor` | |
| `/Finances/Savings/{SavingGoalId:guid}` | `Module.Finances/Pages/Saving/Edit.razor` | |
| `/Finances/Settings` | `Module.Finances/Pages/Settings.razor` | **Stub** |

**Stubs bleiben Stubs.** Sie werden angelegt, damit Navigation und Links identisch bleiben, aber nicht ausgebaut.

### Design-Grundlagen

Quelle: `backend/HomeBook.Frontend/Styles/` (45 SCSS-Partials) und `backend/HomeBook.Frontend/Themes/HomebookTheme.cs`.

| Token | Wert |
|---|---|
| Primär | `#382960` |
| Sekundär | `#5A9690` |
| Tertiär | `#373f31` |
| Hintergrund | `#F5F5F5` |
| Text primär | `#080606` |
| Text sekundär | primär um 40 % aufgehellt |
| Standard-Radius | `20px` |
| Caption-Schriftgröße | `.8rem` |
| Schrift | Roboto 300/400/500/700 |
| Breakpoints | 0 / 600 / 960 / 1280 / 1920 / 2560 / 3840 / 5120 |

Prägende, nicht-generische Elemente — die müssen sitzen:

1. **Frosted Glass.** `.frosted-b1` … `.frosted-b10`, Alpha 0,05 in Schritten von 0,05, `backdrop-filter: blur(6px)`, Gradient bei 160°, weißer Innenschatten über `::before`. Zusätzlich `.frosted-bg-b1..b10` ohne Rahmen. Definition in `Styles/variables/_frosted-ui.scss` und `Styles/styles/_frosted.scss`.
2. **Schwebendes Chrome.** AppBar, Drawer und Footer sind abgerundete (12px), abgesetzte (8px Rand) Frosted-Flächen über einem bildschirmfüllenden Wallpaper. Siehe `Styles/components/_ui-layout.scss`.
3. **44-Farben-Palette.** `--hb-color-<name>` plus `-rgb`, `-dark`, `-dark-rgb` und die Klassen `.ui-color-*`, `.ui-color-bg-*`, `.ui-color-bg-gradient-*`. Textfarbe automatisch schwarz bei HSL-Helligkeit > 60, sonst weiß. Siehe `Styles/styles/_color-palette.scss`.
4. **Wallpaper.** Drei Typen: statisch (Bild vom Backend), hochgeladen (Medien-ID) und dynamisch (iframe auf `/wallpaper/<name>/index.html`, Vanilla-JS in `wwwroot/wallpaper/{ember_lines,ocean_waves,tide_cells}/`).
5. **Animierte Hintergründe** für Login und Setup: `UiStripeBackground` (Canvas mit Gradient-Schemata Noctara/Nerion/Frosted) und `UiWaveBackground` (reines CSS).
6. **Widget-Grid.** `--cell-size: 73px`, `--cell-gap: 24px`, Größenklassen `w-2/4/8` × `h-1/2/4`. Hinter dem Feature-Flag `WidgetMenu` (heute `false`).

**Dark Mode** ist im Bestand fest auf `false` verdrahtet und ohne eigene dunkle Palette. Er wird in dieser Migration **nicht** eingeführt.

### Icons

Aktuell ~1,1 MB SVG-Markup als C#-Konstanten in `backend/HomeBook.Frontend.Core/Icons/`:

| Datei | Set-Bezeichner neu |
|---|---|
| `Windows11Outline.cs` | `windows11-outline` |
| `Windows11Filled.cs` | `windows11-filled` |
| `Windows11Colored.cs` | `windows11-colored` |
| `GlassMorphism.cs` | `glass-morphism` |
| `LiquidGlassColor.cs` | `liquid-glass-color` |
| `Logos.cs` | `logos` |

Alle 24×24 mit `viewBox="0 0 48 48"`. Ab Schritt 04 sind einzelne `.svg`-Dateien unter `frontend/packages/ui/src/icons/<set>/<Name>.svg` die Quelle der Wahrheit.

### Übersetzungen

`.resx`-Dateien, gepflegt über [Weblate](https://hosted.weblate.org/projects/homebook/):

| Datei | Keys |
|---|---|
| `backend/HomeBook.Frontend.UI/Resources/LocalizationStrings*.resx` | 254 |
| `backend/HomeBook.Frontend.Module.Kitchen/Resources/Strings*.resx` | 53 |
| `backend/HomeBook.Frontend.Module.Finances/Resources/Strings*.resx` | 41 |
| `backend/HomeBook.Frontend.Module.PlatformInfo/Resources/Strings*.resx` | 2 |

Varianten: neutral, `de-DE`, `en-us`, `fr-FR`. Die Krücke in `LocalizationCultureMapper.cs`, die `en-US` auf ein nicht existierendes `en-EN` abbildet, entfällt ersatzlos — neu gilt schlicht `en-US`.

---

## Verbindliche Konventionen

Diese stehen ausführlich in `AGENTS.md`. Die wichtigsten in Kürze:

- **Bun, nicht npm.** `bun install`, `bun run <script>`, `bunx`.
- **Code, Bezeichner, Kommentare und Commit-Messages auf Englisch.** Nur diese Prompt-Dateien und `AGENTS.md` sind deutsch.
- `<script setup lang="ts">`, Composition API, keine Options API.
- Design-System-Komponenten heißen `Ui*`, modul-spezifische `Hb*`. CSS-Präfixe: `hb-` für Layout und Chrome, `ui-` für Komponenten.
- **Keine hartkodierten Farben, Abstände oder Radien** — immer Token.
- **Kein sichtbarer Text ohne `t()`.** Neue Keys in alle vier Kataloge, fremdsprachige Werte notfalls als Kopie des Englischen.
- **Kein direktes `fetch`** auf das Backend — nur über `@homebook/api-client`.
- Jede Komponente mit Logik und jeder Store bekommt einen Vitest-Test als `*.spec.ts` daneben.
- Ein Schritt gilt erst als fertig, wenn `bun run lint && bun run typecheck && bun run test && bun run build` durchlaufen.
- `.editorconfig` beachten: CRLF, abschließende Leerzeile, keine Leerzeichen am Zeilenende.

## Was nie angefasst wird

- `nginx.conf`
- Backend-Code — **einzige Ausnahme:** Schritt 02 ergänzt einen OpenAPI-Transformer
- Datenbank, Migrationen, Modul-SPI des Backends
- Die Blazor-Projekte — bis Schritt 11 bleiben sie unverändert lauffähig

---

## Reihenfolge

| # | Schritt | hängt ab von |
|---|---|---|
| 01 | Fundament: AGENTS.md, Skills, Workspace | – |
| 02 | OpenAPI und API-Client | 01 |
| 03 | Projekt-Setup | 01 |
| 04 | Design-System und Icons | 03 |
| 05 | UI-Komponenten | 04 |
| 06 | App-Shell, Auth, i18n, Modulsystem | 02, 05 |
| 07 | Setup und Login | 06 |
| 08 | Startseite und Einstellungen | 06 |
| 09 | Modul Kitchen | 06 |
| 10 | Modul Finances, PlatformInfo, Widgets | 06 |
| 11 | Umschaltung und Blazor entfernen | 07–10 |
| 12 | Abschluss | 11 |

08, 09 und 10 sind untereinander unabhängig und können parallel laufen.
