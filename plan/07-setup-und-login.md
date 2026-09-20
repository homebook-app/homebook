# 07 — Setup-Assistent und Anmeldung

**Voraussetzung:** Schritt 06.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Die beiden Seiten, die eine frische Installation zuerst sieht: den Ersteinrichtungs-Assistenten und die Anmeldung. Beide laufen im `ContentOnlyLayout` mit animiertem Hintergrund.

---

## Referenzen im Bestand

| Was | Wo |
|---|---|
| Anmeldeseite | `source/HomeBook.Frontend/Pages/Account/Login.razor` und `.razor.cs` |
| Assistenten-Hülle | `source/HomeBook.Frontend/Pages/Setup/SetupExperiance.razor` |
| Schrittleiste und Inhalt | `source/HomeBook.Frontend/Pages/Setup/UISetupStepper.razor`, `UISetupContent.razor` |
| Die sieben Schritte | `source/HomeBook.Frontend/Setup/SetupSteps/` |
| Schrittreihenfolge | `source/HomeBook.Frontend/Services/SetupService.cs` |
| Stile | `source/HomeBook.Frontend/Styles/views/_login.scss`, `_setup.scss` |

---

## Aufgaben

### 1. Anmeldung — `/Login`

- `ContentOnlyLayout`, `UiStripeBackground` im Hintergrund, zentrierte Frosted-Karte
- Felder Benutzername und Passwort. Serverseitige Mindestlängen: Benutzername 6, Passwort 5 Zeichen — clientseitig spiegeln.
- Absenden ruft die Anmeldung im Auth-Store auf. Bei Erfolg zur ursprünglich angefragten Route, ersatzweise zur Startseite.
- Bei 401 eine übersetzte Fehlermeldung. **Nicht** den Text des Response-Bodys anzeigen — der ist unübersetzt und inkonsistent.
- Ladezustand am Knopf, Doppelabsenden verhindern
- Absenden per Eingabetaste

### 2. Assistenten-Hülle — `/Setup`

- `ContentOnlyLayout`, animierter Hintergrund, PrimeVue `Stepper` als Ersatz für `MudStepper`
- Zustand des Assistenten in einem eigenen Store: aktueller Schritt, gesammelte Eingaben, Zweig Ersteinrichtung oder Aktualisierung
- Anonym erreichbar. Wer den Assistenten aufruft, obwohl `GET /api/setup/availability` mit 204 antwortet, wird zur Startseite umgeleitet.
- Schrittreihenfolge exakt wie in `SetupService.cs`:
  - **Ersteinrichtung:** Verbindung, Lizenz, Datenbank, Administrator, Konfiguration, Setup-Vorgang
  - **Aktualisierung:** Verbindung, Aktualisierungsvorgang

### 3. Die sieben Schritte

**Verbindung** — prüft, ob das Backend erreichbar ist und ob nicht bereits ein Setup läuft. Ruft `GET /api/setup/availability` und wertet den Statuscode aus, einschließlich 409. Bestimmt, in welchen Zweig der Assistent geht.

**Lizenz** — `GET /api/setup/licenses` liefert das Zustimmungskennzeichen und die Liste der Abhängigkeitslizenzen. Liste mit `UiLicenseDialog` für den Volltext, Zustimmungshaken. Ohne Zustimmung antwortet `POST /api/setup/start` mit 422 — also vorher blockieren.

**Datenbank** — `GET /api/setup/database/configuration` liefert eine per Umgebungsvariablen vorbelegte Konfiguration oder 404. Formular für Anbieter (`POSTGRESQL`, `MYSQL`, `SQLITE`), Host, Port, Datenbankname, Benutzer, Passwort, bei SQLite stattdessen der Dateipfad. Ein Prüfknopf ruft `POST /api/setup/database/check` — 200 zeigt den erkannten Anbieter, 503 meldet „nicht erreichbar". Weiter erst nach erfolgreicher Prüfung.

**Administrator** — `GET /api/setup/user` antwortet nur mit 200 oder 404. Bei 200 ist der Benutzer per Umgebungsvariablen vorbelegt und der Schritt wird übersprungen, mit sichtbarem Hinweis. Sonst Benutzername, Passwort und Wiederholung. Erlaubter Zeichensatz für das Passwort steht in `README.md`; die Regel clientseitig prüfen und bei Verstoß verständlich melden.

**Konfiguration** — `GET /api/setup/configuration` verhält sich analog. Sonst Instanzname und Standardsprache, Sprachliste aus `GET /api/platform/locales`.

**Setup-Vorgang** — schickt alles gesammelt an `POST /api/setup/start`. Fortschritt anzeigen, danach mit `UiCountdownAlert` zur Anmeldung weiterleiten. Fehler nach Statuscode behandeln, 422 bedeutet fehlende Lizenzzustimmung.

**Aktualisierungsvorgang** — ruft `POST /api/update/start`. **Das Backend beendet sich danach selbst** und wird vom Container neu gestartet. Die Oberfläche muss das erwarten: Hinweis anzeigen, in Abständen auf Erreichbarkeit prüfen und nach dem Neustart weiterleiten. Abbrechende Anfragen währenddessen sind normal und dürfen keine Fehlermeldung erzeugen.

---

## Hinweise

- Die Schritte sind eigenständige Komponenten mit einer gemeinsamen Schnittstelle (validieren, absenden, überspringbar) — nicht eine Riesenkomponente mit Fallunterscheidung.
- Formularvalidierung einheitlich lösen: entweder `@primevue/forms` oder VeeValidate mit Zod, aber nur eines von beidem im gesamten Projekt.
- Alle Texte übersetzt, in allen drei Katalogen.
- Der Assistent ist die erste Berührung mit der Anwendung. Fehlerzustände gehören hier besonders sorgfältig behandelt: Backend nicht erreichbar, Datenbank falsch konfiguriert, Setup bereits im Gange.

---

## Akzeptanzkriterien

- [ ] Gegen ein frisches Backend ohne Datenbank läuft der Assistent vollständig bis zur fertigen Installation durch
- [ ] Vorbelegung per Umgebungsvariablen wird erkannt, die betroffenen Schritte werden mit Hinweis übersprungen
- [ ] Die Datenbankprüfung meldet Erfolg und Misserfolg getrennt und verständlich
- [ ] Der Aktualisierungszweig übersteht den Neustart des Backends und leitet danach weiter
- [ ] Anmeldung funktioniert, falsche Zugangsdaten erzeugen eine übersetzte Meldung
- [ ] Screenshot-Vergleich gegen den Bestand zeigt keine sichtbaren Abweichungen
- [ ] Tests für die Schrittlogik und den Assistenten-Store
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Keine Startseite, keine Einstellungen
- Keine Modulseiten
