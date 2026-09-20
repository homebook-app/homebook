# 06 — App-Shell, Routing, Authentifizierung, i18n, Modulsystem

**Voraussetzung:** Schritte 02 und 05.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Das Gerüst, in dem alle Seiten leben: Layouts, Router, Anmeldung, Startsequenz, Übersetzungen und die Modul-Registry.

Dies ist der umfangreichste Schritt. Wenn er zu groß wird, teile ihn in zwei Durchgänge: **6a** Layouts, Router, Auth und Startsequenz — **6b** i18n-Migration, Modul-Registry, Menü und Suche. Die Akzeptanzkriterien gelten dann für 6b.

---

## Aufgaben

### 1. Layouts

**`MainLayout.vue`** — Vorlage `backend/HomeBook.Frontend/Layout/MainLayout.razor`. Von außen nach innen:

- **Wallpaper-Ebene**, bildschirmfüllend hinter allem (`z-index: -1`), mit drei Typen:
  - `Static` — Hintergrundbild von `/api/system/wallpaper/<name>`. Der Dateiname wird URL-kodiert, Punkte zusätzlich als `%2E`. Bei Wallpapern mit Themenkonfiguration wird derzeit schlicht der erste Eintrag genommen; dieses Verhalten übernehmen.
  - `Uploaded` — Bild über die Medien-ID, URL über den Client auflösen
  - `Dynamic` — `<iframe src="/wallpaper/<name>/index.html">`
- **Kopfleiste**: schwebend, abgerundet, `frosted-b6`. Enthält links den Menüknopf (nur unterhalb des `md`-Breakpoints) samt Instanzname und Anwendungstitel, daneben den Startseiten-Knopf, mittig die globale Suche, rechts das Profilmenü mit Benutzername und Abmelden — bei fehlender Anmeldung stattdessen ein Anmelde-Knopf. Unterhalb von `md` zusätzlich ein Überlaufmenü mit dem Einstellungslink.
- **Seitenleiste**: responsiv, `frosted-bg-b5`, abgerundet, abgesetzt. Kopf mit Anwendungstitel und Instanzname. Darunter Startseite, dann — nur wenn vorhanden — die Kontexteinträge der aktuellen Seite mit Trennlinie davor, dann unten Einstellungen.
- **Inhaltsbereich** für die Seitenkomponente
- **Fußleiste**: schwebend, `frosted-b6`, mit Anwendungstitel, Autorenhinweis und Link

**`ContentOnlyLayout.vue`** — ohne Chrome, nur Dialog- und Toast-Anker. Für `/Login` und `/Setup`.

### 2. Router

Alle Routen aus der Tabelle in `plan/00-uebersicht.md`, **Schreibweise zeichengenau** (`/Login`, nicht `/login`). Modul-Routen steuert die Registry bei.

- Meta-Feld je Route: welches Layout, ob Anmeldung nötig, ob Adminrechte nötig, ob nur im Entwicklermodus sichtbar
- Standard ist **Anmeldung erforderlich** — so wirkt heute das globale `[Authorize]` in `backend/HomeBook.Frontend/_Imports.razor`. Ausnahmen sind nur `/Login` und `/Setup`.
- Admin-Pflicht für `/Settings/Users`, `/Settings/Users/Add` und `/Settings/Users/{UserId}`
- Eine `NotFound`-Route
- Ergänzend eine Umleitung, die abweichende Groß- und Kleinschreibung auf die kanonische Route führt, damit alte Lesezeichen weiter funktionieren

### 3. Auth-Store und Guards

Vorlagen: `backend/HomeBook.Frontend/Services/AuthenticationService.cs` und `backend/HomeBook.Frontend/Provider/CustomAuthenticationStateProvider.cs`.

- Pinia-Store mit Token, Ablaufzeitpunkt, Benutzername, Benutzer-ID und Adminkennzeichen
- localStorage-Schlüssel **unverändert**: `authToken`, `refreshToken`, `expiresAt`
- Anmeldung über `POST /api/account/login`; Abmeldung ruft `POST /api/account/logout` auf und räumt danach lokal auf, auch wenn der Aufruf fehlschlägt
- JWT-Nutzlast dekodieren (nicht verifizieren) für `IsAdmin` und `role`. Nicht-Admins haben **gar keinen** Rollen-Claim — das darf nicht als Fehler behandelt werden.
- `isAuthenticated` vergleicht den Ablaufzeitpunkt mit der aktuellen Zeit
- **Es gibt keinen Refresh.** Bei 401 oder Ablauf: Store leeren, nach `/Login` umleiten, Hinweis anzeigen.
- Der 401-Callback des API-Clients aus Schritt 02 wird hier verdrahtet. Damit entfällt das heutige manuelle Anhängen des `Authorization`-Headers in jedem einzelnen Service.
- Router-Guards setzen Anmelde- und Adminpflicht durch

### 4. Startsequenz

Vorlagen: `backend/HomeBook.Frontend/Services/StartupService.cs` und `App.razor`.

Ein Bootstrap-Store führt beim Start aus:

1. `GET /api/setup/availability` auswerten — 200 Setup nötig, 201 Update nötig, 204 bereit, 409 Setup läuft bereits
2. Bei 200 oder 201 nach `/Setup` umleiten und dort in den passenden Zweig springen
3. Sonst Instanzdaten holen und zwischenspeichern (Name, Standardsprache), Entwicklermodus über `/api/info/devmode` abfragen
4. Sprache bestimmen: Benutzereinstellung, sonst Instanzstandard, sonst Browsersprache, sonst `en-US`
5. Module initialisieren
6. Bei fehlender Anmeldung nach `/Login`

Während die Sequenz läuft, einen ordentlichen Ladezustand anzeigen. Das heutige `Task.Delay(50)`-Warten aus `App.razor` wird **nicht** nachgebaut — stattdessen wird sauber auf das Promise gewartet.

Backend nicht erreichbar: verständliche Fehlerseite mit Wiederholen-Möglichkeit, keine weiße Seite.

### 5. Übersetzungen migrieren

`scripts/migrate-resx.ts`, einmalig, Ergebnis wird eingecheckt:

- Liest alle `.resx` aus `backend/HomeBook.Frontend.UI/Resources/` und `backend/HomeBook.Frontend.Module.*/Resources/`
- Wandelt Schlüssel in die vue-i18n-Konvention: aus `MainLayout_SearchTextField_Placeholder` wird `mainLayout.searchTextField.placeholder`. Unterstriche trennen Ebenen, jedes Segment in camelCase. Die Regel deterministisch implementieren und dokumentieren.
- Schreibt verschachteltes JSON nach `frontend/apps/web/src/locales/<locale>.json` beziehungsweise `frontend/packages/module-*/src/locales/<locale>.json`
- Sprachen: `de-DE`, `en-US`, `fr-FR`. Die neutrale `.resx` liefert die englische Fassung. Die bisherige Datei `LocalizationStrings.en-us.resx` wird zu `en-US`.
- Schreibt zusätzlich `frontend/locale-key-mapping.json` mit der Zuordnung alt zu neu — die braucht die Weblate-Umstellung, damit keine Übersetzung verloren geht
- Meldet Schlüssel, die in einer Sprache fehlen

Die Krücke aus `backend/HomeBook.Frontend.UI/Utilities/LocalizationCultureMapper.cs`, die `en-US` auf ein nicht existierendes `en-EN` abbildet, wird **nicht** übernommen.

Sprachumschaltung: Sprache setzen, in `localStorage` unter `HomeBook.User.Locale` ablegen und per `POST /api/user/preferences/locale` sichern. Anders als heute ohne vollständigen Seiten-Neuaufbau — vue-i18n kann zur Laufzeit wechseln.

Weblate: In `README.md` und, falls vorhanden, in der Weblate-Konfiguration die Komponenten auf die neuen JSON-Pfade umstellen, Dateiformat „JSON nested structure". Die Zuordnungstabelle im PR erwähnen.

### 6. Modul-Registry

Ersetzt die Assembly-Scan-Mechanik aus `backend/HomeBook.Frontend/ModuleCore/` und `backend/HomeBook.Frontend.Modules.Abstractions/`.

Ein Interface `HomeBookModule` in `@homebook/ui` oder einem schlanken eigenen Package:

| Feld | Zweck |
|---|---|
| `key` | z. B. `homebook.kitchen` — identisch zum Backend-Schlüssel |
| `name`, `description` | über den Modul-Katalog übersetzt |
| `icon` | Satz- und Namensangabe für `UiIcon` |
| `routes` | Routen, die dem Router hinzugefügt werden |
| `startMenuItems` | Kacheln der Startseite: Titel, Untertitel, Ziel-URL, Icon, Farbe als `var(--hb-color-*)` |
| `widgets` | Widgets für das Raster |
| `searchResultComponents` | Zuordnung vom Backend-Handler-Typnamen zur Ergebniskomponente, etwa `HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler` |
| `messages` | Übersetzungskatalog des Moduls |
| `setup(app)` | optionale Registrierung eigener Abhängigkeiten |

`apps/web` importiert die drei Module statisch und registriert sie beim Start. Kein Laufzeit-Plugin-Loader — der Erweiterungspunkt bleibt erhalten, die Komplexität nicht.

### 7. Kontextmenü und globale Suche

- Menü-Store als Ersatz für `backend/HomeBook.Frontend.Services/Services/MenuService.cs`: Seiten melden ihre Kontexteinträge an, bei Navigation wird geleert. Die Seitenleiste zeigt sie zwischen Startseite und Einstellungen.
- `UiSearchComponent.vue` — Eingabefeld in der Kopfleiste, **1000 ms Entprellung** wie im Bestand, ruft `GET /api/search?s=<query>`, gruppiert die Treffer nach Modul und rendert sie über die Ergebniskomponenten aus der Registry.

---

## Akzeptanzkriterien

- [ ] Anmeldung gegen ein lokal laufendes Backend funktioniert, Abmelden leert den Store und leitet um
- [ ] Ein Aufruf mit abgelaufenem Token führt zu Abmeldung und Umleitung, nicht zu einem stillen Fehler
- [ ] Die App-Shell steht: Wallpaper aller drei Typen, schwebende Frosted-Leisten, responsive Seitenleiste
- [ ] Die Startsequenz leitet bei Statuscode 200 und 201 nach `/Setup`, bei 204 und fehlender Anmeldung nach `/Login`
- [ ] Alle Sprachkataloge sind erzeugt, `frontend/locale-key-mapping.json` existiert, die Sprachumschaltung wirkt ohne Neuladen
- [ ] Die drei Module sind registriert, ihre Routen sind erreichbar, ihre Kacheln erscheinen auf der Startseite
- [ ] Die globale Suche liefert Treffer und rendert sie über die Modul-Komponenten
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Keine Seiteninhalte — die Seiten dürfen leere Hüllen mit korrekter Route und korrektem Layout sein
- Kein Widget-Raster (Schritt 10)
- Kein Dark Mode
