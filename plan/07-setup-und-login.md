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
| Anmeldeseite | `backend/HomeBook.Frontend/Pages/Account/Login.razor` und `.razor.cs` |
| Assistenten-Hülle | `backend/HomeBook.Frontend/Pages/Setup/SetupExperiance.razor` |
| Schrittleiste und Inhalt | `backend/HomeBook.Frontend/Pages/Setup/UISetupStepper.razor`, `UISetupContent.razor` |
| Die sieben Schritte | `backend/HomeBook.Frontend/Setup/SetupSteps/` |
| Schrittreihenfolge | `backend/HomeBook.Frontend/Services/SetupService.cs` |
| Stile | `backend/HomeBook.Frontend/Styles/views/_login.scss`, `_setup.scss` |

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

---

## Umsetzungsnotizen

Umgesetzt auf Branch `HB-188`. Abweichungen vom Text oben, die meisten wegen des tatsächlichen Backend-Vertrags:

- **Kein 409 bei `GET /setup/availability`.** Das Backend antwortet nur mit 200 (Setup nötig), 201 (Update nötig), 204 (bereit) oder 500. Der 409-Zweig im Bestand konnte nie greifen. Verbindungsschritt und Bootstrap-Store behandeln 409 trotzdem weiter, als Absicherung.
- **Mindestlängen beim Login 5/5 statt 6/5, mit dem Nutzer abgestimmt.** Das Backend erzwingt keine davon, weil `AddValidation()` fehlt; zu kurze Eingaben enden in 401. Beim Anlegen erlaubt der `UserValidator` Benutzernamen ab 5 Zeichen, bei 6 wäre so ein Konto ausgesperrt.
- **Administrator-Passwort: mindestens 8 Zeichen plus Zeichensatz aus der `README.md`, mit dem Nutzer abgestimmt.** Das Backend prüft beim Setup gar nichts. Die Meldung nennt die unzulässigen Zeichen. Der Benutzername wird clientseitig wie im `UserValidator` geprüft (5–20, `^[a-zA-Z0-9_-]+$`), denn das Backend prüft ihn erst, nachdem Datenbankkonfiguration und Migration schon gelaufen sind.
- **SQLite nur im Entwicklermodus, mit dem Nutzer abgestimmt.** SQLite ist nur für Tests gedacht. Im Entwicklermodus gibt es statt Host und Port ein Dateipfadfeld und keine Prüfung, denn `POST /setup/database/check` kennt kein SQLite. Der Bestand hat SQLite faktisch nicht beherrscht (es fehlte `databaseFile`).
- **Der Anbieter kommt von der Prüfung.** `POST /setup/database/check` hat kein Anbieterfeld, probiert alle durch und meldet den, der antwortet. Der gemeldete Wert geht an `POST /setup/start`, die Auswahl im Formular setzt nur den Standardport (5432/3306).
- **Formularvalidierung mit `@primevue/forms`, mit dem Nutzer abgestimmt.** Neue Abhängigkeit, im Catalog auf 4.5.5 wie PrimeVue. Die Regeln sind eigene Resolver-Funktionen in `apps/web/src/setup/validation.ts`, ohne Zod. Die Fehlermeldungen bleiben Katalogschlüssel, bis `HbFormField` sie rendert.
- **Setup und Update beenden den Prozess.** Danach wird `GET /setup/availability` gepollt: 10 s Wartezeit, dann alle 5 s, höchstens 5 Minuten (`waitForBackendRestart`). Nach dem Setup gelten 201 und 204, nach dem Update nur 204. Abgebrochene Anfragen und 502–504 von nginx sind dabei normal und erzeugen keine Meldung, nur Antworten des Backends selbst (400, 409, 422, 500). `POST /update/start` antwortet mit 200 und bleibt oben, wenn nichts zu migrieren ist; das Polling sieht dann sofort 204.
- **Schrittschnittstelle.** Jeder Schritt ist eine eigene Komponente unter `apps/web/src/pages/setup/steps/` und nutzt `useSetupStep(key)`: `run` (mit Mindestanzeigedauer), `fail`, `succeed` (Countdown, danach weiter) und `complete` (sofort weiter). „Überspringbar“ heißt: `succeed(…, { skipped: true })` mit sichtbarem Hinweis. Der Zustand liegt im Store `stores/setup.ts`. `startRequest` lässt leere Werte weg, damit das Backend auf seine Umgebungsvariablen zurückfällt.
- **Ein Stepper statt zwei.** Der Bestand hat die Schrittleiste auf kleinen Bildschirmen doppelt gerendert. Jetzt gibt es einen PrimeVue-`Stepper`, ab 960 px senkrecht neben dem Schritt, darunter quer und scrollbar; der aktive Schritt wird ins Bild gescrollt. Anklicken lässt er sich nicht (`linear`).
- **`/Setup` auf einer eingerichteten Instanz** leitet der Guard zur Startseite. Nach Setup oder Update läuft die Startsequenz neu (`bootstrap.retry()`), dann öffnet sich `/Login`. Davor spielt die Abschlussanimation des Bestands, bei `prefers-reduced-motion` nicht.
- **Nicht übernommen:** der ungeprüfte `returnUrl` (offene Weiterleitung), jeder Fehler als „falsche Zugangsdaten“, doppeltes `StepSuccess` beim Zustimmen im Lizenzdialog.
- **Vier Kataloge statt drei.** Neue Schlüssel stehen in `en`, `de`, `fr` und `ru`, alle gefüllt. Neu ist unter anderem die Gruppe `validation.*`. Der Standard-Instanzname („My HomeBook“) ist jetzt übersetzbar.
- **Neue Token:** `--hb-content-only-offset` (der Abstand oben und unten von Login und Setup) und `--hb-setup-tile-glow` (Kacheln der Abschlussanimation).
- **Größerer PrimeVue-Chunk.** Stepper, Select, InputNumber, Forms und der Lizenzdialog heben den `primevue`-Chunk von 367 auf 524 kB. Das löst die Vite-Warnung über 500 kB aus. Ursache ist die `codeSplitting`-Gruppe in `vite.config.ts`, die alles von PrimeVue in einen Chunk legt, auch was nur lazy geladene Seiten brauchen. Nicht geändert.
- **Im Browser geprüft** gegen das lokale Backend im Setup-Zustand, bei 1440 und 375 px: Verbindungsschritt, übersprungener Lizenzschritt (die Lizenzen waren per Umgebung akzeptiert), Vorbelegung der Datenbank aus der Umgebung, Prüfung mit 503 und Markierung im Stepper. Die Anmeldeseite mit abgefangenen Antworten (204, 401): Mindestlängen, Absenden per Eingabetaste, übersetzte 401-Meldung.
- **Offen — Ende-zu-Ende.** Ein vollständiger Durchlauf bis zur fertigen Installation, der Update-Zweig mit echtem Neustart und eine echte Anmeldung stehen aus. Das Setup hätte die Konfiguration nach `/var/lib/homebook` geschrieben (hier `E:\var\lib\homebook`) und braucht eine erreichbare Datenbank. Der Screenshot-Vergleich gegen den Blazor-Bestand steht ebenfalls aus.
