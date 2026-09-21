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

---

## Umsetzungsnotizen

Umgesetzt auf Branch `HB-188` in zwei Durchgängen (6a Shell, Auth, Router, Startsequenz — 6b Module, Suche, Doku). Die Übersetzungsmigration kam vor die Shell, weil die Shell die migrierten Schlüssel braucht. Abweichungen vom Text oben:

- **Sprachen als reine Sprachcodes, mit dem Nutzer abgestimmt.** Kataloge heißen `en`, `de`, `fr`, `ru` statt `en-US`, `de-DE`, `fr-FR`. Englisch ist Standard und die einzige Pflichtsprache. Andere Sprachen dürfen leere Werte haben, die Weblate füllt. **Es gibt keinen Fallback:** ein leerer oder fehlender Wert wird zur Laufzeit als nichts angezeigt (`fallbackLocale: false`, `missing` liefert `''`). Folge: Französisch zeigt fast keinen Text, bis Weblate es füllt — im Bestand waren nur vier Werte übersetzt. Das ist gewollt. `AGENTS.md` und die Skills `homebook-i18n` und `homebook-testing` sind angepasst; die Regel „nie leer, Kopie des englischen Werts" gilt nicht mehr.
- **Russisch migriert.** Die russische Übersetzung kam mit dem Weblate-Merge (`LocalizationStrings.ru.resx`, 254 von 254) und ist als `ru.json` übernommen. Die Module bekommen `ru.json` mit leeren Werten. **Offen:** `GET /api/platform/locales` bietet `ru` nicht an. Damit Russisch in den Einstellungen wählbar wird, braucht es eine Backend-Änderung — nicht Teil dieses Schritts.
- **Kultur-Tag und Katalog getrennt.** Das Backend speichert Kultur-Tags (`de-DE`), die App lädt Sprachkataloge (`de`). `resolveLocale()` bildet einen Tag auf seinen Katalog ab; `en-EN` aus alten Instanzkonfigurationen landet so bei `en`. Das ist keine Neuauflage der `LocalizationCultureMapper`-Krücke, sondern die allgemeine Regel. Gespeichert (localStorage `HomeBook.User.Locale`, `POST /user/preferences/locale`) wird weiter der Tag.
- **Schlüsselregel der Migration**, dokumentiert in `scripts/lib/resxKeys.ts`: Trennung an `_` und `.`, jedes Segment camelCase mit Akronym-Behandlung (`UISetupStepper` → `uiSetupStepper`). Ein Schlüssel, der zugleich Präfix eines anderen ist, rutscht als `label` eine Ebene tiefer — betroffen sind drei Finances-Schlüssel. Die Regel hat einen eigenen Test (`bun test scripts`).
- **Modulkataloge unter Namensraum.** Alle drei Module haben `ModuleName`, `ModuleDescription` und `StartMenuItem_*`. Da alle Kataloge in eine vue-i18n-Instanz gemischt werden, liegen Modulschlüssel unter `kitchen.…`, `finances.…`, `platformInfo.…`. Die Zuordnung in `frontend/locale-key-mapping.json` nennt die vollen neuen Schlüssel.
- **Vorhandene Schlüssel wiederverwendet.** `UiLicenseDialog_*` und `StartMenuItems_Open_Text` sind auf die in Schritt 05 angelegten `ui.licenseDialog.*` und `ui.startMenuItem.open` festgelegt, statt doppelt zu entstehen. Bereits vorhandene Werte gewinnen gegen die resx; das Skript ist dadurch idempotent.
- **24 englische Finances-Werte übersetzt.** In der neutralen resx waren sie leer (`<value />`), nur Deutsch war gefüllt. Die englischen Texte stehen als Override-Tabelle in `scripts/migrate-resx.ts` und gehören im PR geprüft.
- **HTML-Entität aufgelöst.** `Settings_About_LicensesArea_Copyright_TextTemplate` enthielt `&copy;` als Text; vue-i18n würde das wörtlich ausgeben. Es steht jetzt `©` im Katalog.
- **Weblate:** Im Repository gibt es keine Weblate-Konfiguration. `README.md` beschreibt die vier Komponenten mit Dateimaske und Format „JSON nested structure"; umgestellt werden muss in der Weblate-Oberfläche.
- **Neues Package `@homebook/module-sdk`** statt `@homebook/ui`, mit dem Nutzer abgestimmt. Es enthält `HomeBookModule`, `defineModule`, die Injektion des Backend-Clients (`backendClientKey`, `useBackendClient`), den Menü-Store samt `useContextMenu`, `ModulePlaceholderPage` und `GUID_ROUTE_PATTERN`. So bleibt das Design-System frei von API-Client und Pinia, und Module müssen nicht aus `apps/web` importieren.
- **Modulschlüssel statt Handlertyp im Suchergebnis.** Die Suchantwort liefert pro Gruppe `moduleKey`, und der ist der volle Name des Handlertyps (`HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler`). `searchResultComponents` ist darauf geschlüsselt, wie im Plan.
- **Modulinitialisierung ist kein Schritt der Startsequenz.** Die Registry registriert Routen, Kataloge und `setup(app)` synchron beim Erzeugen der App — vor dem Router, weil schon dessen erste Navigation die Modulrouten braucht. Asynchron initialisiert kein Modul etwas.
- **Suche als Panel, nicht als Dialog.** PrimeVues `Dialog` fokussiert beim Öffnen und fängt den Fokus im Modalmodus. Die Ergebnisse erscheinen aber, während man noch tippt — im Bestand lag das Eingabefeld deshalb über dem Dialog. Jetzt öffnet sich unter dem Feld ein Panel (`frosted-b3`) über einer abgedunkelten Maske; der Fokus bleibt im Feld, Escape und ein Klick auf die Maske schließen. Das Feld ist ein `combobox` mit `aria-expanded` und `aria-controls`.
- **Abmelden nur mit gültigem Token beim Backend.** `POST /account/logout` verlangt Autorisierung; mit abgelaufenem Token käme ein 401. Deshalb wird der Aufruf bei abgelaufener Sitzung übersprungen, lokal aufgeräumt wird immer. Ein 401 ohne Sitzung — etwa bei falschem Passwort — löst keine Umleitung aus.
- **Adminpflicht nur für die Benutzerverwaltung**, wie im Plan und im Bestand (`[Authorize(Roles = "Admin")]`). Die Übersicht markiert auch Instanz, Module, Datenbank, Speicher und KI als Admin — dort prüft das Backend, die Seiten sind ohnehin noch Hüllen.
- **Minimales Anmeldeformular.** Ohne Formular ließe sich „Anmeldung gegen ein lokal laufendes Backend funktioniert" nicht prüfen. `/Login` hat Benutzername, Passwort, `returnUrl` (nur app-interne Pfade) und den Hinweis bei abgelaufener Sitzung; Schritt 07 portiert die echte Seite. Die Texte, die im Bestand hart codiert waren, haben jetzt Schlüssel.
- **Startseite mit Kacheln.** Das Akzeptanzkriterium „Kacheln erscheinen auf der Startseite" braucht sie; der Rest der Startseite folgt in Schritt 08.
- **Kontextmenü räumt sich selbst auf.** Zusätzlich zum Leeren bei jeder Navigation entfernt `useContextMenu` seine Einträge, wenn die Seite verlassen wird — aber nur, solange es noch die eigenen sind. Die Seiten `/Kitchen/Recipes`, `/Kitchen/MealPlan` und `/Finances` melden ihre Einträge aus dem Bestand an.
- **Kein VueUse.** Für den Breakpoint gibt es `useBreakpointUp()` und `breakpoints` in `@homebook/ui`; ein Test hält die Werte mit der SCSS synchron. Neue Token: `--hb-chrome-z-index`, `--hb-nav-link-icon-size`, `--hb-nav-link-font-size`; neue Klassen `.hb-nav-menu`, `.hb-nav-link` (das „xxl"-Navigationsmenü und die Listen-Eckenrundung aus Schritt 04) und `.hb-visually-hidden`.
- **API-Client in den App-Tests immer gemockt.** `apps/web/src/test/setup.ts` ersetzt `@homebook/api-client` durch `src/test/apiClientMock.ts`. Der echte Client lässt sich unter Vitest mit happy-dom ohnehin nicht laden: die Kiota-Laufzeit zieht über die `module`-Bedingung den ESM-Build von `@opentelemetry/api`, dessen Importe ohne Dateiendung Node nicht auflöst.
- **Setup-Verfügbarkeit im Client.** `client.getSetupAvailability()` liest den Statuscode über einen Kiota-Response-Handler — der offene Punkt aus Schritt 02. `client.staticWallpaperUrl()` kapselt die Kodierung mit `%2E`.
- **Fehlerseite statt Endlosschleife.** Ist das Backend nicht erreichbar oder läuft ein Setup (409), zeigt die App eine übersetzte Fehlerseite mit „Erneut versuchen". Der Bestand blieb in beiden Fällen im Ladezustand hängen.
- **Fehler aus Schritt 02 behoben.** `createBackendClient` ohne eigenes `fetch` schickte keine einzige Anfrage ab (`next middleware is undefined`): Kiota hängt den abschließenden Fetch-Handler nur für eine eigene Fetch-Funktion an. Die Tests übergaben immer eine, die App nie. Aufgefallen erst im Browser; jetzt fällt der Client auf das globale `fetch` zurück, mit Test.
- **Offen — nicht gegen ein eingerichtetes Backend geprüft.** Geprüft im Browser gegen das lokale Backend: `/` leitet im Setup-Zustand (200) nach `/Setup` im Content-only-Layout, bei 375 und 1440 px. Per `curl` durch den Vite-Proxy: falsche Anmeldedaten ergeben 401, `/info/devmode` ist anonym. Eine erfolgreiche Anmeldung, die Shell danach, die Wallpaper-Typen und die Suche mit Treffern brauchen eine eingerichtete Instanz mit Benutzer. Das Setup hätte `/var/lib/homebook` auf dem Entwicklungsrechner beschrieben und ist deshalb nicht gelaufen. Diese Punkte sind durch Unit-Tests abgedeckt, der Praxistest steht aus.
