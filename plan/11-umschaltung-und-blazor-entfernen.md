# 11 — Umschaltung des Docker-Images und Entfernen des Blazor-Frontends

**Voraussetzung:** Schritte 07 bis 10 sind abgeschlossen und die Vue-App deckt den vollen Funktionsumfang ab.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Das ausgelieferte Docker-Image baut und enthält die Vue-App statt der Blazor-App. Die Blazor-Projekte verlassen das Repository.

**Vor Beginn prüfen:** Läuft die Vue-App gegen ein echtes Backend vollständig durch — Ersteinrichtung, Anmeldung, Startseite, alle Einstellungsseiten, Rezepte mit Bildern, Speiseplan, Sparziele, Suche, Sprachwechsel, Wallpaperwechsel, Benutzerverwaltung? Wenn nein: nicht umschalten, sondern zurückmelden, was fehlt.

---

## Aufgaben

### 1. Dockerfile

Aktueller Stand: die Build-Stufe installiert Node 24 und global `sass` (nur damit das Blazor-csproj `npx sass` ausführen kann), veröffentlicht Blazor-Frontend und Backend, und die finale Stufe kopiert `/frontend_dist/wwwroot` nach `/usr/share/nginx/html`.

Neu:

- In der Build-Stufe Node und `sass` durch **Bun** ersetzen. Backend-Veröffentlichung bleibt unverändert.
- Frontend bauen: `bun install --frozen-lockfile` und `bun run build` in `frontend/`
- `COPY --from=build /homebook-src/frontend/apps/web/dist /usr/share/nginx/html` statt der Blazor-Zeile
- Die Zeile, die `$FRONTEND_APPSETTINGS_FILE` nach `/usr/share/nginx/html/wwwroot/appsettings.json` kopiert, **entfernen**. Sie ist schon heute wirkungslos, weil das SPA die Datei unter `/appsettings.json` erwartet, nicht unter `/wwwroot/`. Die Vue-App bringt ihre Datei über `public/` ohnehin an der richtigen Stelle mit.
- `ARG FRONTEND_APPSETTINGS_FILE` auf `./frontend/apps/web/public/appsettings.json` umstellen, falls der Pfad noch anderweitig gebraucht wird

Die finale Stufe, der nicht privilegierte Benutzer 21001, die Wallpaper-Kopien, `docker-entrypoint.sh` und **`nginx.conf` bleiben unverändert**.

### 2. Workflows

In `.github/workflows/build.yml` und `.github/workflows/pull-request.yml`:

- Node-Setup und `npm install --save-dev sass` durch Bun-Setup ersetzen
- Frontend-Schritte ergänzen: `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun run test:coverage`, `bun run build`
- Die lcov-Ausgabe an SonarCloud hängen: `sonar.javascript.lcov.reportPaths`. Die bestehende Analyse der .NET-Abdeckung bleibt.
- `FRONTEND_APPSETTINGS_FILE` auf den neuen Pfad. Das Versions-Stempeln per `sed` im Job `post-build` muss weiter greifen — nach der Änderung mit `cat` überprüfen, wie es der Workflow heute schon tut.
- Die auskommentierte `tests-e2e`-Stufe und die Variable `E2E_TEST_CSPROJ` entfernen. Es gibt kein E2E-Projekt und es ist auch keines geplant.

### 3. Blazor entfernen

Löschen:

- `backend/HomeBook.Frontend`
- `backend/HomeBook.Frontend.UI`
- `backend/HomeBook.Frontend.Core`
- `backend/HomeBook.Frontend.Abstractions`
- `backend/HomeBook.Frontend.Services`
- `backend/HomeBook.Frontend.Modules.Abstractions`
- `backend/HomeBook.Frontend.Module.Kitchen`
- `backend/HomeBook.Frontend.Module.Finances`
- `backend/HomeBook.Frontend.Module.PlatformInfo`
- `backend/HomeBook.UnitTests/Frontend/` samt der nun unbenutzten Helfer in `TestCore/` (etwa `TestJSRuntime`)
- `install-dev.sh` (installierte nur global `sass`)
- `frontend_dist/` (lokales Build-Artefakt)

Anpassen:

- `homebook.slnx`: den Ordner `/Frontend/` und `/Frontend/Modules/` samt Projekteinträgen entfernen; `HomeBook.Client` bleibt, aber verschieben nach `/Backend/` oder einen eigenen Ordner `/Client/`
- `.run/Backend with Frontend.run.xml`: entfernen oder auf reines Backend umstellen
- `backend/HomeBook.UnitTests/HomeBook.UnitTests.csproj`: Projektverweis auf `HomeBook.Frontend` entfernen

**`backend/HomeBook.Client` bleibt bestehen** — der C#-Client wird weiterhin als NuGet-Paket veröffentlicht, das erledigt der Job `client-deploy`.

Vorher gegenprüfen: Verweist noch irgendetwas auf die gelöschten Projekte? `grep -r "HomeBook.Frontend" --include=*.csproj --include=*.slnx --include=*.yml --include=*.sh --include=*.xml`

### 4. Dokumentation

- `README.md`: Abschnitt zur lokalen Entwicklung ergänzen — Backend mit `dotnet run`, Frontend mit `bun run dev`, Proxy-Konfiguration. Weblate-Hinweis auf die neuen JSON-Pfade.
- `AGENTS.md`: den Hinweis „keine Blazor-Dateien anfassen" entfernen, Pfadangaben aktualisieren

---

## Akzeptanzkriterien

- [ ] `docker build -t homebook-test .` läuft durch
- [ ] `docker run -p 8080:8080 homebook-test` liefert auf `http://localhost:8080` die Vue-App; Ersteinrichtung und Anmeldung funktionieren im Container
- [ ] Das Image ist **kleiner** als zuvor — keine WebAssembly-Nutzlast, keine 1,1 MB Icon-Konstanten
- [ ] `dotnet build homebook.slnx` läuft durch, keine verwaisten Verweise
- [ ] `dotnet test backend/HomeBook.UnitTests/HomeBook.UnitTests.csproj` läuft durch
- [ ] Beide Workflows sind grün, die Abdeckung von Frontend und Backend landet in SonarCloud
- [ ] Das Versions-Stempeln setzt die Version in der Frontend-Konfiguration
- [ ] `grep -r "HomeBook.Frontend"` findet nur noch Erwähnungen in `plan/` und in der Historie

## Nicht in diesem Schritt

- Keine funktionalen Änderungen an der Vue-App
- Keine Änderung an `nginx.conf`, `docker-entrypoint.sh` oder der finalen Docker-Stufe
- Kein npm-Publish des API-Clients
