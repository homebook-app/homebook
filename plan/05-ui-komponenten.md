# 05 — UI-Komponentenbibliothek

**Voraussetzung:** Schritt 04.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Die wiederverwendbaren Präsentationskomponenten des Bestands nach `@homebook/ui` portieren. Nach diesem Schritt steht der Baukasten, aus dem die Seiten-Schritte 07 bis 10 gebaut werden.

---

## Zu portierende Komponenten

### Design-System — Quelle `source/HomeBook.Frontend.UI/Components/`

Jede liegt als `.razor` plus `.razor.cs` vor. Die Logik steht in der `.cs`, das Markup in der `.razor`.

| Komponente | Zweck |
|---|---|
| `UiPageTitle` | Setzt den Dokumenttitel auf `"<Inhalt> - HomeBook"`. In Vue über `useHead` oder ein eigenes Composable, kein Paket nur dafür. |
| `UiIcon` | bereits in Schritt 04 erstellt |
| `UiColoredIcon` | bereits in Schritt 04 erstellt |
| `UiDetailCard` | Karte mit Kopf-, Inhalts- und Akzentfarb-Slot |
| `UiDetailListItem` | Zeile aus Icon, Titel und Wert |
| `UiValueCard` | Kennzahlkarte, baut auf `UiDetailCard` auf. Wird auf `/Finances` verwendet. |
| `UiProgressItem` | beschrifteter Fortschrittsbalken mit Akzentfarbe. Verwendet bei Speicherbelegung und Sparzielen. |
| `UiNumericGroup` | numerisches Eingabefeld mit Minus- und Plus-Schaltfläche. Im Original generisch über `T` — in TypeScript als `number` mit optionalen `min`, `max`, `step`. |

### App-nahe Komponenten — Quelle `source/HomeBook.Frontend/Components/`

| Komponente | Zweck |
|---|---|
| `UiSettingsItem` | Icon, Titel, Untertitel und rechtsbündiges Bedienelement. Baustein fast aller Einstellungsseiten. |
| `UiStartMenuItem` | farbige Frosted-Kachel der Startseite, mit großem, transparentem Hintergrund-Icon. Token in `variables/_ui-startmenu-item.scss`: Icon-Größe 140px, Deckkraft 0,25. |
| `UiLicenseDialog` | Dialog mit dem Lizenztext einer Abhängigkeit. Basis: PrimeVue `Dialog`. |
| `UiCountdownAlert` | Hinweis mit ablaufendem Fortschrittsbalken, der nach Ablauf eine Aktion auslöst. Wird im Setup-Assistenten verwendet. |
| `UiWidgetContainer` | Hülle, die ein Widget gemäß seiner Größe dimensioniert |
| `UiWidgetList` | einfacher Container für eine Widget-Liste |

Zugehörige Stile liegen in `source/HomeBook.Frontend/Styles/components/_ui-*.scss` und wandern als `<style scoped lang="scss">` in die jeweilige Komponente. Token bleiben in `@homebook/ui`.

### Was bewusst nicht portiert wird

- `UiStaticWidgetGrid` — im Bestand ein Platzhalter mit einer Überschrift. Bleibt einer.
- `UiWidgetGrid` und `UiWidgetSelector` — gehören zum Widget-Raster und kommen in Schritt 10, weil sie Drag-and-drop und die Modul-Registry brauchen.
- `UiSearchComponent` — braucht Store und Modul-Registry, kommt in Schritt 06.

---

## Vorgehen je Komponente

1. Die `.razor` und die zugehörige `.razor.cs` lesen und verstehen, was Parameter, was Zustand und was Slot ist.
2. Vue-Komponente mit typisierten Props und Emits schreiben. Blazor-`RenderFragment` wird zu einem benannten Slot.
3. Stile aus dem passenden SCSS-Partial übernehmen, scoped. Keine Farbe, kein Abstand und kein Radius hartkodiert.
4. Sichtbare Texte über `t()`. Kommen im Original Texte aus `LocalizationStrings`, den Key vorerst in der bisherigen Schreibweise notieren — Schritt 06 führt die Umbenennung aller Keys automatisiert durch.
5. Testdatei daneben: Rendern mit typischen Props, bedingte Zweige, ausgelöste Events, berechnete Werte.

---

## Nachweisseite erweitern

Die Entwicklungsroute aus Schritt 04 um eine Komponentengalerie ergänzen: jede Komponente in ihren wesentlichen Varianten. Das ist die Vorlage für `/Settings/Developer/Components` in Schritt 08 und gleichzeitig der visuelle Abgleich gegen den Bestand.

---

## Akzeptanzkriterien

- [ ] Alle oben aufgeführten Komponenten existieren in `@homebook/ui` und sind exportiert
- [ ] Jede hat eine `.spec.ts` daneben, alle Tests grün
- [ ] Die Komponentengalerie zeigt jede Komponente; Screenshot-Vergleich gegen `/Settings/Developer/Components` im Bestand zeigt keine sichtbaren Abweichungen
- [ ] Keine hartkodierten Gestaltungswerte in den Komponenten
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Kein Layout, keine Seiten, kein Routing
- Keine Datenanbindung — alle Komponenten sind rein präsentational und bekommen ihre Daten über Props
