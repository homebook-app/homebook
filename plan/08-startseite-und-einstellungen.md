# 08 — Startseite und Einstellungen

**Voraussetzung:** Schritt 06.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

Kann parallel zu den Schritten 09 und 10 laufen.

---

## Ziel

Die Startseite und alle 15 Einstellungsrouten. Das ist der größte Block an Seiten, aber inhaltlich geradeaus.

---

## Aufgaben

### 1. Startseite — `/`

Vorlage `source/HomeBook.Frontend/Pages/Start.razor`.

- Kachelraster aus den `startMenuItems` aller registrierten Module, gerendert mit `UiStartMenuItem`
- Die Kacheln sind datengetrieben: Titel, Untertitel, Ziel-URL, Icon und Farbe kommen aus der Modul-Registrierung, nicht aus der Seite
- Das Widget-Raster bleibt hinter dem Merkmalsschalter `FeatureManagement.WidgetMenu` aus `appsettings.json`, heute `false`. Umsetzung des Rasters selbst gehört zu Schritt 10; hier nur der Schalter und die Einbindung.

### 2. Einstellungsnavigation

Vorlage `source/HomeBook.Frontend/Pages/Settings/SettingsNavMenu.razor`.

Im Bestand wird sie in jeder Einstellungsseite einzeln eingebunden. In Vue besser als **verschachteltes Layout** unter `/Settings` lösen, damit sie einmal existiert.

Reihenfolge der Einträge: Über, Allgemein, Darstellung, Sprache — dann nur für Administratoren Benutzer, Instanz, Module, Datenbank, Speicher, KI — dann bei aktivem Entwicklermodus die Entwicklereinträge — zuletzt Rückmeldung.

Mehrere Beschriftungen sind im Bestand unübersetzte Platzhalter mit führendem Pluszeichen (`+General`, `+Database`, `+AI Configuration`). Diese Gelegenheit nutzen und sie ordentlich übersetzen.

### 3. Die Einstellungsseiten

Alle bauen auf `UiSettingsItem` auf.

| Route | Vorlage | Inhalt |
|---|---|---|
| `/Settings` | `Pages/Settings/Overview.razor` | **Platzhalter.** Bleibt einer. |
| `/Settings/About` | `Pages/Settings/About.razor` | Version, .NET-Laufzeit, Datenbankanbieter, Bereitstellungsart aus `GET /api/system/instance/info`; Projektlinks; eigene Stile in `Styles/views/_about.scss` |
| `/Settings/Appearance` | `Pages/Settings/Appearance/Overview.razor` | siehe unten |
| `/Settings/Localization` | `Pages/Settings/Localization.razor` | Sprachwahl aus `GET /api/platform/locales`, gesichert über `POST /api/user/preferences/locale` |
| `/Settings/Instance` | `Pages/Settings/Instance/Overview.razor` | Instanzname und Standardsprache ändern (Administrator) |
| `/Settings/Modules` | `Pages/Settings/Modules.razor` | Liste der registrierten Module mit Name, Beschreibung, Version, Autor, Icon |
| `/Settings/Database` | `Pages/Settings/Database.razor` | **Platzhalter.** Bleibt einer. |
| `/Settings/Storage` | `Pages/Settings/Storage/Overview.razor` | Belegung von Cache, Protokollen, temporären Dateien und Modul-Medien aus `GET /api/system/storage/info`, dargestellt mit `UiProgressItem`. Hinweis: das Antwortfeld heißt `StorgeKey` — Schreibfehler im Backend, nicht korrigieren. |
| `/Settings/Ai` | `Pages/Settings/Ai.razor` | **Platzhalter.** Bleibt einer. |
| `/Settings/Feedback` | `Pages/Settings/Feedback.razor` | **Platzhalter.** Bleibt einer. |
| `/Settings/Users` | `Pages/Settings/User/Overview.razor` | Benutzerliste mit Seitennavigation und Namensfilter über `GET /api/system/users`; Aktionen aktivieren, deaktivieren, löschen. **Nur Administrator.** |
| `/Settings/Users/Add` | `Pages/Settings/User/UserAdd.razor` | Benutzer anlegen. **Nur Administrator.** |
| `/Settings/Users/{UserId}` | `Pages/Settings/User/UserEdit.razor` | Benutzername, Passwort und Adminrechte ändern. **Nur Administrator.** |

**Darstellung** ist die aufwendigste Seite: Auswahl aus den System-Wallpapern (`GET /api/system/wallpaper`), den bereits hochgeladenen und den drei dynamischen. Upload eigener Bilder über `POST /api/storage/files` mit base64-Inhalt und Scope `homebook.core.wallpaper.UserWallpaper`, Grenze 20 MB vorher prüfen. Auswahl sichern über `POST /api/user/preferences/wallpaper` — die Konfiguration wird als **serialisierter String** im Feld `wallpaperConfiguration` übertragen. Vorschaubilder für die dynamischen Wallpaper liegen unter `/img/dynwallpaper_thumbs/`. Nach dem Wechsel muss das Hintergrundbild im Layout sofort aktualisiert werden.

**Benutzerverwaltung:** Das Backend verweigert mit 400, wenn man sich selbst löschen, deaktivieren oder die eigenen Adminrechte ändern will. Diese Aktionen in der Oberfläche für die eigene Zeile gar nicht erst anbieten.

### 4. Entwicklerbereich

Sichtbar nur, wenn `GET /api/info/devmode` aktiv meldet. Vier Seiten unter `Pages/Settings/Developer/`:

| Route | Inhalt |
|---|---|
| `/Settings/Developer` | Übersicht |
| `/Settings/Developer/Components` | Galerie aller `Ui*`-Komponenten — die Nachweisseite aus Schritt 05 wird hierher überführt |
| `/Settings/Developer/Colors` | die komplette 44-Farben-Palette als Kachelraster |
| `/Settings/Developer/Icons` | alle Icons aller Sätze, Klick kopiert den Bezeichner in die Zwischenablage (im Bestand `UiIconsList.razor.cs`) |

Die Entwicklungsroute aus Schritt 04 und 05 wird durch diese Seiten ersetzt, nicht zusätzlich behalten.

---

## Hinweise

- Seiten melden ihre Kontexteinträge beim Menü-Store an, wo der Bestand das über `MenuService.UpdateMenuItems` tut.
- Für Tabellen PrimeVue `DataTable`, für Dialoge `Dialog`, für Rückmeldungen `Toast`.
- Platzhalterseiten bekommen dieselbe leere Darstellung wie heute — sie existieren, damit Navigation und Verlinkung unverändert bleiben.

---

## Akzeptanzkriterien

- [ ] Alle 15 Einstellungsrouten und die Startseite sind erreichbar und verhalten sich wie im Bestand
- [ ] Die Einstellungsnavigation zeigt Admin- und Entwicklereinträge nur unter den richtigen Bedingungen
- [ ] Ein Nicht-Administrator, der `/Settings/Users` direkt aufruft, wird abgewiesen
- [ ] Wallpaper lassen sich wählen, hochladen und wirken sofort; alle drei Typen funktionieren
- [ ] Benutzer lassen sich anlegen, bearbeiten, aktivieren, deaktivieren und löschen; die verbotenen Aktionen auf den eigenen Zugang werden nicht angeboten
- [ ] Kein sichtbarer Text ohne Übersetzung, keine Platzhalter mit Pluszeichen mehr
- [ ] Screenshot-Vergleich gegen den Bestand zeigt keine sichtbaren Abweichungen
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Kein Ausbau der Platzhalterseiten
- Keine Modulseiten
- Kein Widget-Raster
