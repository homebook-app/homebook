# 10 — Modul Finances, PlatformInfo und das Widget-Raster

**Voraussetzung:** Schritt 06.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

Kann parallel zu den Schritten 08 und 09 laufen.

---

## Ziel

Die Packages `@homebook/module-finances` und `@homebook/module-platform-info` sowie das Widget-Raster der Startseite.

---

## Wichtig vorab: Was echt ist und was nicht

| Bereich | Stand im Bestand |
|---|---|
| **Sparziele** | Vollständig gegen das Backend implementiert. Wird 1:1 portiert. |
| **Finanzübersicht `/Finances`** | **Attrappe.** `Pages/Overview.razor` enthält fest eingetragene Kennzahlen (viermal `12.547,89 €`, `+2,5%`, `vs letzter Monat`) und unübersetzte deutsche Beschriftungen mit führendem Pluszeichen (`+Finanzen`, `+Gesamtsaldo`, `+Ausgaben`, `+Einnahmen`). Es gibt keine Endpunkte dafür. |
| **Finanzeinstellungen** | Platzhalter. |
| **`CurrentBudgetWidget`** | Platzhalter. |

Die Übersicht wird als **Attrappe portiert** — gleiche Kacheln, gleiche Zahlen, damit das Erscheinungsbild übereinstimmt. Aber:
- Die Werte in eine klar benannte Datei auslagern (etwa `src/mock/financeSummaryFixture.ts`) mit einem Kommentar, dass hier eine echte Anbindung hingehört.
- Die Beschriftungen mit Pluszeichen ordentlich übersetzen — das ist unstrittig ein Versäumnis im Bestand, kein Gestaltungsmerkmal.

---

## Aufgaben

### 1. Finanzübersicht — `/Finances`

Vorlage `Pages/Overview.razor`. Vier `UiValueCard` im Raster, je Kachel Farbe, Icon, Titel, Wert, hervorgehobener Zusatz und Fußnote. Farben und Icons exakt übernehmen: Gesamtsaldo `cerulean` mit `Wallet`, Ausgaben `crimson` mit `CardMagnetic`, Einnahmen `emerald` mit `ChartArrowRise`, die vierte Kachel entsprechend der Vorlage.

Rasterverhalten wie im Bestand: zwei Spalten auf kleinen Geräten, vier ab `md`.

Kontexteintrag zu den Sparzielen anmelden. Die im Bestand auskommentierten Einträge für Konten und Einstellungen bleiben auskommentiert beziehungsweise entfallen.

### 2. Sparziele

| Route | Vorlage | Inhalt |
|---|---|---|
| `/Finances/Savings/Overview` | `Pages/Saving/Overview.razor` | Kartenliste, Vorlage `Components/HbSavingGoalsOverviewList.razor`; je Ziel Name, Icon, Farbe, Fortschritt über `UiProgressItem`, Zielbetrag, aktueller Betrag, Zieldatum |
| `/Finances/Savings/Add` | `Pages/Saving/Add.razor` | Anlegen über `POST /api/modules/homebook/finances/saving-goals` |
| `/Finances/Savings/{SavingGoalId}` | `Pages/Saving/Edit.razor` | Bearbeiten |

Formular — Vorlage `Components/HbSavingGoalEditForm.razor`: Name, Farbe aus der `--hb-color-*`-Palette, Icon aus den Icon-Sätzen, Zielbetrag, aktueller Betrag, monatliche Rate, Zinsoption (`0 = NONE`, `1 = MONTHLY`, `2 = YEARLY`), Zinssatz, Zieldatum.

**Die Aktualisierung erfolgt über vier getrennte PATCH-Endpunkte** — `name`, `appearance`, `amounts`, `info`. Nur die tatsächlich geänderten Bereiche senden, nicht blind alle vier.

Beim Löschen heißt der Routenparameter `id`, nicht `savingGoalId`. Diese Eigenheit gehört in den API-Client aus Schritt 02, nicht in die Seite.

Sparrechner über `POST /api/modules/homebook/finances/calculations/savings` — liefert benötigte Monate, monatliche Rate sowie die Verläufe von Beträgen und Zinsen. Darstellung wie im Bestand.

Die deutschen Klartexte im heutigen Formular werden übersetzt.

### 3. Finanzeinstellungen — `/Finances/Settings`

Platzhalter. Bleibt einer.

### 4. Modulregistrierung Finances

Schlüssel `homebook.finances`, Start-Kachel, Icon und Farbe aus `backend/HomeBook.Frontend.Module.Finances/Module.cs`. Suchergebnis-Komponente registriert unter dem Handler-Namen des Backends für Sparziele; Vorlage `Search/Templates/SavingGoalsSearchHandlerResultTemplate.razor` samt CSS (Radius 14px, Textfarbe über `color-mix`). Übersetzungskatalog migriert aus `Resources/Strings*.resx` (41 Schlüssel).

### 5. Modul PlatformInfo

Schlüssel und Metadaten aus `backend/HomeBook.Frontend.Module.PlatformInfo/Module.cs`. Ein einziges Widget, `VersionWidget`, das die Version aus der Laufzeitkonfiguration zeigt. Stile aus der zugehörigen isolierten CSS-Datei: Flex-Spalte, 4px Abstand, Innenabstand `var(--hb-widget-padding)`. Katalog mit zwei Schlüsseln.

### 6. Widget-Raster

Ersetzt `backend/HomeBook.Frontend/Components/UiWidgetGrid.razor` samt zugehörigem JavaScript.

- Geometrie aus `Styles/components/_ui-widgets.scss`: `--cell-size: 73px`, `--cell-gap: 24px`, Größenklassen `w-2/4/8` und `h-1/2/4`, Widget-Radius 12px
- Verschieben und Größenändern per Zeigereingabe. PrimeVue hat dafür nichts Passendes — VueUse `useSortable` oder eine kleine eigene Lösung auf Basis von Pointer-Events. Keine schwergewichtige Rasterbibliothek.
- `UiWidgetSelector` zum Hinzufügen von Widgets aus der Registry
- Anordnung pro Benutzer in `localStorage` merken
- **Das Ganze bleibt hinter dem Merkmalsschalter `FeatureManagement.WidgetMenu`**, der heute `false` ist. Es ist ein Experiment und wird nicht scharf geschaltet.
- `UiStaticWidgetGrid` ist im Bestand ein Platzhalter und bleibt einer.

---

## Akzeptanzkriterien

- [ ] Sparziele lassen sich anlegen, bearbeiten und löschen; die vier PATCH-Endpunkte werden gezielt und einzeln verwendet
- [ ] Der Sparrechner liefert Ergebnisse und stellt sie dar
- [ ] Die Finanzübersicht sieht aus wie im Bestand, die Werte liegen in einer als Attrappe gekennzeichneten Datei, alle Beschriftungen sind übersetzt
- [ ] Das Versions-Widget zeigt die Version aus `appsettings.json`
- [ ] Das Widget-Raster funktioniert, wenn der Schalter aktiviert wird, und ist bei `false` nicht sichtbar
- [ ] Sparziel-Treffer erscheinen in der globalen Suche
- [ ] Screenshot-Vergleich gegen den Bestand zeigt keine sichtbaren Abweichungen
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Kein Backend für die Finanzübersicht
- Kein Ausbau der Finanzeinstellungen und des Budget-Widgets
- Keine anderen Module
