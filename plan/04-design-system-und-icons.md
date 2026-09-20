# 04 — Design-System: Token, PrimeVue-Preset, Hintergründe, Icons

**Voraussetzung:** Schritt 03.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Das Package `@homebook/ui` mit der kompletten visuellen Grundlage: Design-Token, PrimeVue-Preset, die portierten Hintergründe und ein Icon-System, das die bestehenden Icons8-Sätze aus dem C#-Code übernimmt.

Dieser Schritt entscheidet darüber, ob die App am Ende aussieht wie vorher. Er ist Fleißarbeit und soll genau sein.

---

## Referenzen im Bestand

| Was | Wo |
|---|---|
| Farbthema, Radius, Typografie | `source/HomeBook.Frontend/Themes/HomebookTheme.cs` |
| Alle SCSS-Quellen (45 Partials) | `source/HomeBook.Frontend/Styles/` |
| Einstiegspunkt | `source/HomeBook.Frontend/Styles/app.scss` |
| Kompiliertes Ergebnis zum Abgleich | `source/HomeBook.Frontend/wwwroot/css/app.css` |
| Icons als C#-Konstanten | `source/HomeBook.Frontend.Core/Icons/` |
| Dynamische Wallpaper | `source/HomeBook.Frontend/wwwroot/wallpaper/` |

---

## Aufgaben

### 1. Token portieren nach `packages/ui/src/styles/`

Eins zu eins aus den bestehenden Partials. Farbwerte, Alphastufen und Winkel **exakt** übernehmen, nicht „aufräumen".

| Neue Datei | Quelle | Inhalt |
|---|---|---|
| `_variables.scss` | `variables/_breakpoints.scss`, `_border-radius.scss`, `_ui-colored-icon.scss`, `_ui-startmenu-item.scss`, `_frosted-ui.scss` | Breakpoints 0/600/960/1280/1920/2560/3840/5120, Radien, Frosted-Parameter |
| `_color-palette.scss` | `styles/_color-palette.scss` | alle 44 Farben, je `--hb-color-<n>`, `-rgb`, `-dark`, `-dark-rgb`; Klassen `.ui-color-*`, `.ui-color-bg-*`, `.ui-color-bg-gradient-*`; Textfarbe automatisch schwarz bei HSL-Helligkeit über 60, sonst weiß |
| `_frosted.scss` | `styles/_frosted.scss` | Mixins plus `.frosted-b1..b10` und `.frosted-bg-b1..b10`; Alpha ab 0,05 in Schritten von 0,05, `blur(6px)`, Gradient bei 160°, radialer Glanz oben, weißer Innenschatten über `::before`, Modifier `.no-backdrop-blur` |
| `_colors.scss` | `styles/_colors.scss` | GitHub, Docker, Ubuntu |
| `_settings-colors.scss` | `styles/_settings-colors.scss` | vier semantische Farben für die Einstellungen |
| `_typography.scss` | `styles/_typography.scss` | `.text-dark` |
| `_layout.scss` | `components/_ui-layout.scss` | `hb-drawer`, `hb-header-appbar`, `hb-footer-appbar`, `hb-main-content` — Radius 12px, 8px Rand, Breitenberechnung relativ zur Drawer-Breite |
| `_widgets.scss` | `components/_ui-widgets.scss` | `--cell-size: 73px`, `--cell-gap: 24px`, Größenklassen `w-2/4/8` und `h-1/2/4`. Hinweis: im Original ist `--cell-size` doppelt deklariert, der zweite Wert (73px) gewinnt — den übernehmen und die Dublette weglassen. |
| `_wallpaper.scss` | `components/_ui-wallpaper.scss` | bildschirmfüllende Ebene hinter allem |
| `_utilities.scss` | `utilities/_width.scss`, `_float.scss` | `.w-*` inklusive der Breakpoint-Varianten bis `w-xxxxl-*` |

Die Komponentenstile aus `components/_ui-*.scss` wandern zu ihren Komponenten in Schritt 05 und werden dort scoped. Die MudBlazor-Überschreibungen aus `components/_mud-*.scss` werden **nicht** portiert — sie korrigierten MudBlazor-Eigenheiten, die es nicht mehr gibt. Sie sind aber eine gute Quelle dafür, welche Abweichung vom Framework-Standard jeweils gewollt war; bitte durchsehen und das gewollte Ergebnis im PrimeVue-Preset abbilden.

Die Views aus `views/_login.scss`, `_setup.scss` und `_about.scss` gehören zu Schritt 07 und 08.

### 2. PrimeVue-Preset

`packages/ui/src/theme/preset.ts` mit `definePreset(Aura, …)`:

- Primärpalette abgeleitet von `#382960` (Tonwerte 50 bis 950 erzeugen, 500 entspricht der Markenfarbe)
- Sekundär `#5A9690`, Tertiär `#373f31` als eigene Token
- Oberflächenfarben auf Hintergrund `#F5F5F5`
- Textfarben `#080606` und dieselbe Farbe 40 Prozent aufgehellt
- Border-Radius `20px` als Standard
- Schrift Roboto, Caption `.8rem`
- Nur helles Schema, kein Dark Mode

### 3. Schrift lokal einbinden

Der Bestand lädt Roboto von Google Fonts. Für eine selbst gehostete Anwendung ist ein externer Font-Request unpassend und bricht in abgeschotteten Netzen. Roboto in den Gewichten 300, 400, 500 und 700 lokal einbinden (`@fontsource/roboto` oder gleichwertig) und im Preset referenzieren.

### 4. Hintergründe portieren

- `UiStripeBackground.vue` — Canvas mit animiertem Gradient. Logik aus `source/HomeBook.Frontend/Components/UiStripeBackground.razor.js`, die drei Farbschemata (Noctara, Nerion, Frosted) aus `Styles/components/_ui-stripe-background.scss`. Das JS-Interop-Muster mit `init`/`disconnect` wird zu `onMounted`/`onUnmounted`.
- `UiWaveBackground.vue` — reines CSS aus `Styles/components/_ui-wave-background.scss`: Gradient-Animation über 150 s, drei gestapelte Wellen mit 30/54/60 s Dauer, Deckkraft 0,8/0,8/0,9, `border-radius: 1000% 1000% 0 0`.
- Die drei dynamischen Wallpaper aus `source/HomeBook.Frontend/wwwroot/wallpaper/{ember_lines,ocean_waves,tide_cells}/` **unverändert** nach `frontend/apps/web/public/wallpaper/` kopieren. Es ist eigenständiges Vanilla-JS in einem iframe; die Layout-Logik in Schritt 06 erwartet genau die Pfade `/wallpaper/<name>/index.html`. Ebenso die Vorschaubilder aus `wwwroot/img/dynwallpaper_thumbs/`.
- Statische Hintergrundbilder aus `wwwroot/img/bg/` übernehmen.

### 5. Icons extrahieren

`scripts/extract-icons.ts`, einmalig auszuführen, Ergebnis wird eingecheckt:

- Parst die Dateien in `source/HomeBook.Frontend.Core/Icons/` und zieht je Konstante das SVG-Markup heraus
- Schreibt nach `frontend/packages/ui/src/icons/<set>/<Name>.svg` mit den Set-Bezeichnern `windows11-outline`, `windows11-filled`, `windows11-colored`, `glass-morphism`, `liquid-glass-color`, `logos`
- Dateinamen entsprechen exakt den C#-Konstantennamen, damit die Zuordnung nachvollziehbar bleibt
- Normalisiert das Markup: `viewBox="0 0 48 48"` beibehalten, feste `width`/`height` entfernen, bei den einfarbigen Sätzen (`windows11-outline`, `windows11-filled`) Füllfarben auf `currentColor` setzen. Die farbigen Sätze behalten ihre Farben.
- Gibt am Ende eine Zusammenfassung aus: Anzahl je Satz, übersprungene Einträge mit Grund

Ab jetzt sind die `.svg`-Dateien die Quelle der Wahrheit. Das Skript bleibt im Repository, damit die Extraktion nachvollziehbar ist, wird aber nicht im Build ausgeführt.

### 6. Icon-Komponente

`UiIcon.vue` mit den Props `set`, `name`, `size` und `color`.

Umsetzung: ein Vite-Plugin bündelt je Satz ein SVG-Sprite; `UiIcon` lädt das Sprite des angeforderten Satzes **beim ersten Bedarf** und rendert dann `<svg><use href="…" /></svg>` mit `currentColor`.

Warum nicht Tree-Shaking über einzelne Importe: Icons werden an vielen Stellen **dynamisch** referenziert — Start-Menü-Kacheln, Kontext-Menüeinträge und Modul-Icons kommen zur Laufzeit als Zeichenkette aus der Modul-Registrierung. Ein rein statischer Ansatz würde diese Fälle nicht abdecken. Das satzweise Nachladen ist trotzdem deutlich sparsamer als heute, wo alle rund 1,1 MB fest in der Auslieferung stecken.

Verhalten bei unbekanntem Namen: nichts rendern und im Entwicklungsmodus eine Warnung ausgeben, nicht die Anwendung abbrechen.

Zusätzlich `UiColoredIcon.vue` — Icon in einem getönten, abgerundeten Rahmen. Token aus `variables/_ui-colored-icon.scss`: Hintergrunddeckkraft 75 Prozent, Radius 8px, Größe 1.5em.

### 7. Nachweisseite

Eine Entwicklungsroute, die die komplette Palette, alle zehn Frosted-Stufen und ein Raster aller Icons je Satz zeigt. Sie ist der visuelle Abgleich gegen `/Settings/Developer/Colors` und `/Settings/Developer/Icons` im Bestand und wird in Schritt 08 zu genau diesen beiden Seiten ausgebaut.

---

## Akzeptanzkriterien

- [ ] Alle Token sind portiert, kein Wert weicht vom Bestand ab
- [ ] Die Nachweisseite zeigt Palette, Frosted-Stufen und Icons; ein Screenshot-Vergleich gegen die Blazor-Entwicklerseiten zeigt keine sichtbaren Abweichungen
- [ ] `frontend/packages/ui/src/icons/` enthält alle Sätze als Einzeldateien, Anzahl passt zur Anzahl der C#-Konstanten
- [ ] `UiIcon` lädt Sprites satzweise nach; im Netzwerk-Tab ist erkennbar, dass ungenutzte Sätze nicht geladen werden
- [ ] Roboto kommt lokal, kein Request an fonts.googleapis.com
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Keine Anwendungskomponenten, kein Layout, keine Seiten
- Kein Dark Mode
- Keine MudBlazor-Überschreibungen portieren
