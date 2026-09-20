# 12 — Abschluss: AGENTS.md finalisieren und Dokumentation

**Voraussetzung:** Schritt 11.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Die in Schritt 01 angelegten Regeln mit dem abgleichen, was sich in der Umsetzung tatsächlich ergeben hat, und die Architektur so dokumentieren, dass sie nach Abschluss der Migration nicht nur in den Prompt-Dateien steht.

---

## Aufgaben

### 1. `AGENTS.md` überarbeiten

Schritt 01 hat die Regeln geschrieben, bevor es Code gab. Jetzt gegen die Wirklichkeit prüfen:

- **Stimmen alle Befehle?** Jeden Befehl in `AGENTS.md` einmal ausführen. Was nicht funktioniert oder nicht mehr existiert, korrigieren.
- **Fehlen Regeln?** Alles, worüber während der Umsetzung entschieden werden musste und was in keiner Regel stand, gehört jetzt hinein. Typische Kandidaten: Fehlerbehandlung und Toasts, Ladezustände, Formularvalidierung, Umgang mit optionalen Backend-Feldern, wo Attrappen-Daten liegen dürfen und wie sie gekennzeichnet werden.
- **Sind Regeln überflüssig?** Was nie gegriffen hat oder sich als hinderlich erwiesen hat, streichen. Eine Regel, an die sich niemand hält, schadet mehr als keine.
- Verweise auf `source/HomeBook.Frontend*` entfernen — die Projekte gibt es nicht mehr.
- Die Verbotsliste aktualisieren: „keine Blazor-Dateien anfassen" ist erledigt, „keine Änderung an `nginx.conf`" bleibt.

### 2. Projekteigene Skills nachziehen

Die vier Skills aus Schritt 01 (`homebook-vue-component`, `homebook-testing`, `homebook-api-client`, `homebook-i18n`) wurden geschrieben, bevor der Code existierte. Jetzt mit **echten Beispielen aus dem Repository** füllen statt mit erfundenen. Jedes Codebeispiel muss eine Entsprechung im Repository haben.

`bunx skills update` ausführen und prüfen, ob die installierten Fremd-Skills noch passen. Was nie benutzt wurde, entfernen.

### 3. Architekturdokumentation

`plan/00-uebersicht.md` enthält den vollständigen Backend-Vertrag und die Architektur — Wissen, das nach Abschluss der Migration nicht in einem Ordner mit Arbeitsanweisungen versauern sollte.

Nach `docs/architecture.md` überführen, dabei:

- Alles Migrationsspezifische streichen (Blazor-Referenzen, Schrittfolge, „Vorlage im Bestand")
- Den Backend-Vertrag behalten und aktualisieren — das ist der wertvollste Teil
- Die Modul-Registry und ihre Erweiterungspunkte beschreiben, damit Dritte eigene Module bauen können
- Von `README.md` und `AGENTS.md` darauf verweisen

Der Ordner `plan/` kann danach bleiben oder gehen. Wenn er bleibt, eine Zeile an den Anfang von `00-uebersicht.md`, dass es sich um abgeschlossenes Migrationsmaterial handelt und `docs/architecture.md` die gepflegte Fassung ist.

### 4. Restlücken aufnehmen

Eine Liste dessen, was bewusst offengeblieben ist, als GitHub-Issues oder als Abschnitt in `docs/architecture.md`:

- Platzhalterseiten: `/Settings`, `/Settings/Database`, `/Settings/Ai`, `/Settings/Feedback`, `/Kitchen/Pantry`, `/Finances/Settings`
- Attrappen ohne Backend: Wochen-Speiseplan, Finanzübersicht, `CurrentBudgetWidget`
- Kein Dark Mode, obwohl die Wallpaper bereits helle und dunkle Varianten mitbringen
- Kein Token-Refresh im Backend — nach 60 Minuten wird man abgemeldet
- Kein Service Worker, also kein Offline-Betrieb
- Widget-Raster weiterhin hinter dem Merkmalsschalter
- Der API-Client ist npm-fähig vorbereitet, aber nicht veröffentlicht

### 5. Abschließender Durchlauf

Gegen das im Container laufende Image:

1. Ersteinrichtung von einem leeren Datenverzeichnis aus vollständig durchlaufen
2. Anmelden, Rezept mit Bild anlegen, Speiseplan befüllen, Sparziel anlegen
3. Global suchen, Sprache wechseln, Wallpaper wechseln
4. Als Administrator einen Benutzer anlegen, deaktivieren und löschen
5. Abmelden und erneut anmelden

Jeder Schritt, der hakt, wird entweder behoben oder in der Restlückenliste festgehalten — nicht stillschweigend übergangen.

---

## Akzeptanzkriterien

- [ ] Jeder Befehl in `AGENTS.md` wurde ausgeführt und funktioniert
- [ ] Die projekteigenen Skills enthalten nur Beispiele, die es im Repository wirklich gibt
- [ ] `docs/architecture.md` existiert, `README.md` und `AGENTS.md` verweisen darauf
- [ ] Die Restlücken sind festgehalten
- [ ] Der abschließende Durchlauf gegen das Container-Image ist vollständig erfolgreich
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch
