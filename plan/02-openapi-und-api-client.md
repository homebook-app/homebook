# 02 — OpenAPI-Dokument reparieren und TypeScript-Client erzeugen

**Voraussetzung:** Schritt 01.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Eine **vollständige** OpenAPI-Spezifikation des Backends erzeugen und daraus einen TypeScript-Client als eigenes, später auf npm veröffentlichbares Package generieren.

Das ist der einzige Schritt, der Backend-Code anfasst — bewusst minimal gehalten.

---

## Das Problem

`backend/HomeBook.Backend/HomeBook.Backend.json` entsteht heute als Nebenprodukt von `dotnet build`: `Microsoft.Extensions.ApiDescription.Server` erzeugt das Dokument zur Buildzeit, `OpenApiDocumentsDirectory` in `backend/HomeBook.Backend/HomeBook.Backend.csproj` legt es neben die csproj.

Dieser Design-Time-Lauf passiert im Zustand `SETUP`, weil keine Datenbank konfiguriert ist. Ergebnis:

- nur **21 Pfade** — `/version`, `/system/*`, `/platform/locales`, `/Development/Config`, `/setup/*`
- **kein** `/account/login`, `/info`, `/user`, `/search`, `/media`, `/storage`
- **keine** Modul-Routen, denn die werden erst nach dem Build gemappt (`RunModulesPostBuild`)
- **kein** `securityScheme`, also kein Auth-fähiger generierter Client

Der eingecheckte C#-Client unter `backend/HomeBook.Client` enthält dagegen bereits Modul-Ordner — er stammt also aus einem reicheren Dokument. Das eingecheckte JSON ist veraltet und unvollständig.

Solange das nicht behoben ist, lässt sich kein brauchbarer Client generieren, weder für C# noch für TypeScript.

---

## Aufgaben

### 1. Bearer-SecurityScheme ins Dokument

Einen `IOpenApiDocumentTransformer` unter `backend/HomeBook.Backend/OpenApi/` anlegen, der ein HTTP-Bearer-Schema mit Format `JWT` in `components.securitySchemes` einträgt und es an den Operationen hinterlegt, die Autorisierung verlangen. Registrierung an `AddOpenApi(...)` in `backend/HomeBook.Backend/Program.cs` (dort steht heute nur `o.OpenApiVersion = OpenApiSpecVersion.OpenApi3_0`).

Vorhandene Muster im Projekt beachten: `backend/HomeBook.Backend/OpenApi/` und `backend/HomeBook.Backend.Core.Modules/OpenApi/Description.cs`. Für den Transformer gibt es bereits einen Test unter `backend/HomeBook.UnitTests/Backend/OpenApi/DescriptionTests.cs` als Vorlage — einen analogen Test ergänzen.

### 2. `scripts/generate-openapi.sh`

Neues Skript, das das vollständige Dokument erzeugt. Ablauf:

1. Backend im `Release`-Modus bauen
2. Ein temporäres Arbeitsverzeichnis anlegen und dort eine Runtime-Konfiguration mit SQLite hinterlegen, sodass `Database:Provider` gesetzt ist und `InstanceStatus` auf `RUNNING` steht. Nur dann sind Account-, Info-, User-, Search-, Media-, Storage- und alle Modul-Routen gemappt. Wie die Runtime-Konfiguration geladen wird, steht in `backend/HomeBook.Backend/Program.cs` (`PathHandler.RuntimeConfigurationFilePath`) und in `Homebook.Backend.Core.Setup`.
3. Backend mit `ASPNETCORE_ENVIRONMENT=Development` im Hintergrund starten (nur dann ist `MapOpenApi()` aktiv) und auf Erreichbarkeit warten
4. `/openapi/v1.json` abrufen und nach `backend/HomeBook.Backend/HomeBook.Backend.json` schreiben, formatiert und mit stabiler Schlüsselreihenfolge, damit Diffs lesbar bleiben
5. Prozess beenden und das temporäre Verzeichnis aufräumen, auch im Fehlerfall (Trap)

Das Skript muss idempotent sein und sowohl lokal als auch in CI ohne Nachfragen laufen. Bei einem Fehler mit von null verschiedenem Exitcode abbrechen.

**Plausibilitätsprüfung im Skript selbst:** Nach dem Abruf verifizieren, dass mindestens `/account/login`, `/search`, `/storage/files` und ein Pfad unterhalb `/modules/homebook/` enthalten sind sowie `components.securitySchemes` nicht leer ist. Schlägt die Prüfung fehl, abbrechen statt ein kaputtes Dokument einzuchecken.

### 3. `scripts/generate-clients.sh`

Ersetzt `generate-client.sh` (das alte Skript entfernen). Ablauf:

1. `scripts/generate-openapi.sh` aufrufen
2. Kiota installieren oder aktualisieren
3. C#-Client nach `backend/HomeBook.Client` generieren — Klassenname `BackendClient`, Namespace `HomeBook.Client`, unveränderte Parameter gegenüber heute
4. TypeScript-Client nach `frontend/packages/api-client/src/generated` generieren
5. `dotnet restore` für die Client-csproj

Die heutigen Parameter stehen in `generate-client.sh` und in den Workflow-Umgebungsvariablen von `.github/workflows/build.yml`.

### 4. Workflows anpassen

In `.github/workflows/build.yml` und `.github/workflows/pull-request.yml` die inline eingebetteten `kiota generate`-Schritte durch den Aufruf der Skripte ersetzen. Die vorhandenen Umgebungsvariablen (`OPENAPI_FILE`, `CLIENT_*`) weiterverwenden oder in die Skripte verschieben, aber nicht doppelt pflegen.

### 5. Package `@homebook/api-client`

Unter `frontend/packages/api-client`:

- `package.json` mit Name `@homebook/api-client`, ESM, `types`, `exports`, `files`. `publishConfig` für npm vorbereiten, aber **noch nicht veröffentlichen**.
- Build als Library (tsup oder `vite build --mode lib`), Ausgabe nach `dist/`
- Kiota-Laufzeitpakete als `dependencies`: Abstractions, Fetch-HTTP-Bibliothek, JSON-/Text-/Form-/Multipart-Serialisierung
- `src/generated/` ist generierter Code: vom Linting ausgenommen, nicht von Hand ändern
- `src/index.ts` als handgeschriebene, stabile Oberfläche:
  - `createBackendClient(options)` mit Basis-URL und einem Token-Provider
  - ein `AccessTokenProvider`, der den Bearer-Token liefert und bei 401 einen Callback auslöst
  - ein Fehlertyp, der den **Statuscode** trägt, plus Hilfsprädikate wie `isUnauthorized(error)`
  - `resolveMediaUrl(mediaId)`, das die fehlende `/api`-Basis vor `/storage/media/{id}` setzt
  - `toBase64Content(file)` für den JSON-Upload samt Prüfung gegen die 20-MB-Grenze

Die Eigenheiten aus `plan/00-uebersicht.md` gehören in diese Oberfläche, nicht in jede aufrufende Stelle: Suchparameter heißt `s`, `searchFilter` ist bei der Rezeptliste Pflicht, beim Löschen eines Sparziels heißt der Routenparameter `id` statt `savingGoalId`.

Tests für die handgeschriebene Schicht mit Vitest, gemocktem `fetch`.

---

## Wichtiger Vorbehalt

Kiotas TypeScript-Generator ist deutlich unreifer als der C#-Generator. Prüfe früh, ob der generierte Code sauber typprüft, baut und benutzbar ergonomisch ist.

**Falls nicht: anhalten und zurückmelden.** Der vorgesehene Ausweichweg ist `openapi-typescript` plus `openapi-fetch` aus derselben Spezifikation — aber das ist eine Entscheidung, die abgestimmt wird, kein stiller Kurswechsel. Der C#-Client bleibt in jedem Fall bei Kiota.

---

## Akzeptanzkriterien

- [ ] `scripts/generate-openapi.sh` läuft lokal durch und erzeugt ein Dokument mit deutlich mehr als 21 Pfaden
- [ ] Das Dokument enthält `/account/login`, `/info`, `/user/preferences/locale`, `/search`, `/storage/files`, `/media/{mediaId}/url` und die Pfade unter `/modules/homebook/kitchen` sowie `/modules/homebook/finances`
- [ ] `components.securitySchemes` enthält ein Bearer-Schema, geschützte Operationen sind entsprechend markiert
- [ ] `scripts/generate-clients.sh` erzeugt beide Clients; `dotnet build backend/HomeBook.Client/HomeBook.Client.csproj` läuft durch
- [ ] `bun run build` und `bun run test` im Package `api-client` laufen durch
- [ ] Beide Workflows rufen die Skripte auf und enthalten keine inline-`kiota`-Aufrufe mehr
- [ ] `generate-client.sh` ist entfernt

## Nicht in diesem Schritt

- Keine Vue-App, keine UI
- Kein npm-Publish
- Keine sonstigen Backend-Änderungen über den Transformer hinaus
