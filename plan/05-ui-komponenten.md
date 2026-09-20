# 05 — UI-Komponentenbibliothek

**Voraussetzung:** Schritt 04.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Die wiederverwendbaren Präsentationskomponenten des Bestands nach `@homebook/ui` portieren. Nach diesem Schritt steht der Baukasten, aus dem die Seiten-Schritte 07 bis 10 gebaut werden.

---

## Zu portierende Komponenten

### Design-System — Quelle `backend/HomeBook.Frontend.UI/Components/`

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

### App-nahe Komponenten — Quelle `backend/HomeBook.Frontend/Components/`

| Komponente | Zweck |
|---|---|
| `UiSettingsItem` | Icon, Titel, Untertitel und rechtsbündiges Bedienelement. Baustein fast aller Einstellungsseiten. |
| `UiStartMenuItem` | farbige Frosted-Kachel der Startseite, mit großem, transparentem Hintergrund-Icon. Token in `variables/_ui-startmenu-item.scss`: Icon-Größe 140px, Deckkraft 0,25. |
| `UiLicenseDialog` | Dialog mit dem Lizenztext einer Abhängigkeit. Basis: PrimeVue `Dialog`. |
| `UiCountdownAlert` | Hinweis mit ablaufendem Fortschrittsbalken, der nach Ablauf eine Aktion auslöst. Wird im Setup-Assistenten verwendet. |
| `UiWidgetContainer` | Hülle, die ein Widget gemäß seiner Größe dimensioniert |
| `UiWidgetList` | einfacher Container für eine Widget-Liste |

Zugehörige Stile liegen in `backend/HomeBook.Frontend/Styles/components/_ui-*.scss` und wandern als `<style scoped lang="scss">` in die jeweilige Komponente. Token bleiben in `@homebook/ui`.

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

- [x] Alle oben aufgeführten Komponenten existieren in `@homebook/ui` und sind exportiert
- [x] Jede hat eine `.spec.ts` daneben, alle Tests grün
- [ ] Die Komponentengalerie zeigt jede Komponente (erledigt); der Screenshot-Vergleich gegen `/Settings/Developer/Components` im Bestand zeigt keine sichtbaren Abweichungen
- [x] Keine hartkodierten Gestaltungswerte in den Komponenten
- [x] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Kein Layout, keine Seiten, kein Routing
- Keine Datenanbindung — alle Komponenten sind rein präsentational und bekommen ihre Daten über Props

---

## Umsetzungsnotizen

Umgesetzt auf Branch `HB-188`. Abweichungen vom Text oben:

- **i18n-Schlüssel gleich in Endform.** Der Text oben sagt, Keys vorerst in der Blazor-Schreibweise zu notieren und sie in Schritt 06 umzubenennen. Schritt 04 hat aber schon `settings.developer.*` in Endform angelegt, und eine Umbenennung verwirft in Weblate die vorhandenen Übersetzungen. Deshalb direkt `ui.startMenuItem.open`, `ui.licenseDialog.*` und `settings.developer.components.*` — in `frontend/apps/web/src/locales/`, denn `@homebook/ui` hat keinen eigenen Katalog und bekommt auch keinen; der Merge-Mechanismus dafür gehört zu Schritt 06.

- **`UiPageTitle` nimmt ein Prop, keinen Slot.** Das Original bekam ein `RenderFragment`; Text aus einem Vue-Slot zurückzulesen ist unzuverlässig. Die Arbeit macht `usePageTitle()`, ein `watchEffect` auf `document.title`. Keine neue Abhängigkeit: `useHead` wäre für zwölf Zeilen nicht zu rechtfertigen gewesen, und `@unhead/vue` ist im Repo nicht vorhanden. `AppTitle` ist eine Konstante, kein Schlüssel — der Wert ist in allen drei `.resx` wörtlich `HomeBook`.

- **`UiProgressItem` hat vier Slots statt vier `Typo`-Parametern.** `Typo` ist ein MudBlazor-Enum ohne Vue-Entsprechung. Netto 11 Props → 7 Props und 4 Slots. Die Akzentfarbe erreicht die Füllung über `--p-progressbar-value-background`, das auf der Wurzel deklariert wird und vererbt — ohne `!important`, das im Bestand nötig war.

- **`UiDetailListItem` hat einen eigenen Stil.** Das Partial im Bestand war ein leeres Gerüst, die Optik kam aus `mud-list-item mud-list-item-gutters gap-5`. Die Werte stammen aus MudBlazor 9.10.0 und liegen jetzt als Token vor. `mud-list-item-clickable` und `mud-ripple` entfallen: keine Aufrufstelle hängt einen Handler an, und ein nicht-interaktives `<div>` darf nicht klickbar aussehen. Dasselbe gilt sinngemäß für das Layout von `UiSettingsItem`.

- **`UiValueCard`** schreibt nur noch den Akzent inline. Die zweite Inline-Variable des Originals war `Colors.Gray.Darken2`, ein MudBlazor-Hex im Template; sie ist jetzt `--hb-ui-value-card-caption-color`.

- **`UiSettingsItem`** führt `IconColor` (Enum) und `IconHexColor` zu einem `iconColor?: string` zusammen. Jede reale Aufrufstelle übergab ohnehin `var(--hb-settings-color-…)`.

- **`UiStartMenuItem`: `title` und `caption` sind Anzeigetext, keine Schlüssel.** Das Original machte `Loc[Title]` und band damit eine Präsentationskomponente an den Katalogaufbau. Die Modul-Registry löst die Schlüssel auf — **das ist der Vertrag, den Schritt 07 und 10 erfüllen müssen.** Außerdem sitzt das Hintergrund-Icon nicht mehr auf `z-index: -1`: `frosted-base` setzt `position: relative`, ein negativer Index würde das Icon hinter den Frosted-Hintergrund malen. Stattdessen wird der Inhalt angehoben.

- **`UiLicenseDialog` ist ein `Dialog` mit `v-model:visible`, kein `DialogService`.** Der Service bräuchte einen `DynamicDialog`-Host, den es erst mit der App-Shell in Schritt 06 gibt, reicht Props durch einen untypisierten Sack und wäre nicht direkt mountbar. Der Lizenztext bleibt **unsanitisiert**: er entsteht zur Bauzeit aus dem Abhängigkeitsmanifest und wird mitgebündelt — dieselbe Vertrauensstufe wie das Template. Sollte eine spätere Stufe hier HTML aus der API einspeisen, ist das der Moment zum Umdenken.

- **`UiCountdownAlert` läuft über `requestAnimationFrame`.** Die `Task.Delay(100)`-Schleife des Originals driftet, überzieht und bricht beim Entsorgen nie ab. Diese hier rechnet aus `performance.now()` und räumt in `onUnmounted` auf. Bei `prefers-reduced-motion` schreitet der Balken sekundenweise statt bildweise fort — die Restzeit bleibt ablesbar, die Bewegung verschwindet. Das ist eine Produktentscheidung, keine Portierung. Die Optionen werden einmal beim Start gelesen, so wie das Original seine Schleife in `OnInitializedAsync` hatte; ein Neustart heißt neu mounten (`:key`).

- **Korrigierte Fehler des Bestands.** `UiWidgetContainer` bildete die Größe in einem Property-Setter ab, der nur bei *Änderung* lief — ein Widget auf der Default-Größe bekam gar keine Größenklasse; der Fallback-Zweig erzeugte außerdem `w-2 h 2` mit Leerzeichen statt Bindestrich. `UiWidgetList.CanvasCssClass` wurde nie gerendert und ist nicht portiert. Beide Komponenten haben keinen eigenen `<style>`-Block, die Raster-Klassen sind seit Schritt 04 global.

- **Kein doppelter Innenabstand der Card.** Der Verdacht stand im Raum, weil `_primevue.scss` `.p-card-content` polstert und `@primeuix/styles/card` `.p-card-body`. Das Preset setzt `card.body.padding` aber bereits auf `0` — es gibt nichts zu korrigieren.

- **Neue Token:** `--hb-space-1` bis `-8` (die MudBlazor-4px-Leiter), Titel-/Wert-/Caption-Typografie als `--hb-font-*`/`--hb-line-height-*`/`--hb-letter-spacing-*` samt der Klassen `.ui-text-caption`, `.ui-text-title`, `.ui-text-value`, `--hb-progress-size-sm|md|lg`, `--hb-ui-value-card-caption-color`, `--hb-ui-detail-list-item-padding|-gap`, `--hb-ui-settings-item-content-width`, `--hb-ui-startmenu-background-icon-offset`. Kein neues Radius-Token: `--mud-default-borderradius` war `20px` und ist `--hb-border-radius-default`.

- **`componentStyles.spec.ts` schließt eine Lücke.** Nichts im Repository kompilierte die SCSS von `packages/ui`: Vitest schaltet SFC-Styles ab, `vue-tsc` fasst sie nicht an, das Paket hat keinen eigenen Build, und die App schüttelt eine Komponente ab, die sie nicht rendert. `UiSettingsItem` ist ohne eine einzige Regel im Bundle gelandet, ohne dass etwas gemeckert hätte. Die neue Spec kompiliert jeden `<style lang="scss">`-Block des Pakets mit vorangestellten Abstracts. Sie ist die einzige Absicherung — die Entwicklungsseite ist `import.meta.env.DEV`-gated und damit in **jedem** Build toter Code, auch mit `--mode development`.

- **`UiWidgetList` hat trotzdem eine Spec.** `AGENTS.md` sagt, verzweigungsfreies Markup wird nicht getestet; die Akzeptanzkriterien oben verlangen für jede Komponente eine. Die Trivialspec bleibt.

- **`vue-i18n` und `vue-router` sind jetzt in `packages/ui/package.json` deklariert.** Beide stehen schon im Workspace-Catalog und sind Abhängigkeiten von `@homebook/web`; die Deklaration bringt keinen neuen Fremdcode, sie beendet nur das Verlassen auf Hoisting.

- **Offen:** der Screenshot-Vergleich gegen den Bestand. Die Bestands-Galerie `/Settings/Developer/Components` zeigt nur `UiIcon`, `UiProgressItem` und `UiColoredIcon`; für die übrigen neun Komponenten sind die echten Seiten die Referenz — `/` (StartMenuItem), `/Settings/Instance` (SettingsItem), `/Finances` (ValueCard), `/Settings/About` (LicenseDialog), der Setup-Assistent (CountdownAlert). Besonders zu prüfen: `UiDetailListItem` und `UiSettingsItem`, deren Optik aus nicht eingecheckten MudBlazor-Klassen rekonstruiert ist, sowie `UiStartMenuItem` im PrimeVue-`Button`, dessen eigene Polsterung über `--p-button-padding-*` neutralisiert wird.
