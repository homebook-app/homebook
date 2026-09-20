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

- [x] `scripts/generate-openapi.sh` läuft lokal durch und erzeugt ein Dokument mit deutlich mehr als 21 Pfaden
- [x] Das Dokument enthält `/account/login`, `/info`, `/user/preferences/locale`, `/search`, `/storage/files`, `/media/{mediaId}/url` und die Pfade unter `/modules/homebook/kitchen` sowie `/modules/homebook/finances`
- [x] `components.securitySchemes` enthält ein Bearer-Schema, geschützte Operationen sind entsprechend markiert
- [x] `scripts/generate-clients.sh` erzeugt beide Clients; `dotnet build backend/HomeBook.Client/HomeBook.Client.csproj` läuft durch
- [x] `bun run build` und `bun run test` im Package `api-client` laufen durch
- [x] Beide Workflows rufen die Skripte auf und enthalten keine inline-`kiota`-Aufrufe mehr
- [x] `generate-client.sh` ist entfernt

## Nicht in diesem Schritt

- Keine Vue-App, keine UI
- Kein npm-Publish
- Keine sonstigen Backend-Änderungen über den Transformer hinaus

---

## Umsetzungsnotizen

Umgesetzt auf Branch `HB-188`. Abweichungen vom Text oben, alle abgestimmt:

- **Das OpenAPI-Dokument war nie eingecheckt**, sondern per `.gitignore` ausgeschlossen. Es wird jetzt eingecheckt. Damit `dotnet build` es nicht mehr mit der 21-Pfade-Version überschreibt, sind `Microsoft.Extensions.ApiDescription.Server` und `OpenApiDocumentsDirectory` aus `HomeBook.Backend.csproj` entfernt. `scripts/generate-openapi.sh` ist der einzige Erzeuger.
- **Keine Runtime-Datei im Temp-Verzeichnis.** `PathHandler` verdrahtet den Pfad fest auf `/var/lib/homebook`, ohne Override. Das Skript bringt das Backend stattdessen über die vorhandenen Umgebungsvariablen `HB_Database__Provider=SQLITE` und `HB_Database__UseInMemory=true` in den Zustand `RUNNING`. Das Temp-Verzeichnis nimmt den `dotnet publish`-Output und das Log auf.
- **`servers` wird aus dem Dokument entfernt**, weil die laufende Instanz dort ihre temporäre lokale Adresse einträgt und Kiota sie sonst als Basis-URL in die Clients schreibt.
- **Formatierung mit `jq -S`.** jq ist auf Ubuntu-Runnern vorhanden und lokal als Dev-Tool installiert.
- **Kiota-TypeScript-Checkpoint bestanden, mit zwei Einschränkungen**, beide im Package gekapselt: `GET /storage/scopes` liefert eine nackte GUID, wofür Kiota ein `"Guid"`-Primitiv erzeugt, das die TypeScript-Laufzeit weder typisiert noch deserialisiert. Die Operation ist per `--exclude-path` ausgenommen und als `getScopeIdByName` von Hand geschrieben. Der JSON-Serializer von Kiota kodiert Byte-Arrays im Browser über `TextDecoder`, was Binärdaten beschädigt; `uploadFile` baut den Body deshalb selbst mit `toBase64Content`.
- `pull-request.yml` erzeugte den Client mit `--class-name RestClient`, die anderen Stellen mit `BackendClient`. Durch die Skripte gibt es nur noch `BackendClient`.
- Kiota ist im Skript auf 1.35.0 gepinnt, TypeScript im Workspace auf 5.x (bun löste sonst 7.x auf, was `vue-tsc` in Schritt 03 noch nicht trägt).
- `.editorconfig`: `*.sh`, das OpenAPI-Dokument und `src/generated/**` bekommen LF, weil ein CRLF-Shebang unter Linux bricht und die Generatoren LF schreiben.
- Nicht in diesem Schritt: ein Helfer für `/setup/availability`, weil dort 200/201/204 unterschieden werden müssen und der generierte Client den Status einer 2xx-Antwort nicht liefert. Gehört zum Setup-Schritt.
