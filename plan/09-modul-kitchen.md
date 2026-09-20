# 09 — Modul Kitchen: Rezeptverwaltung und Wochen-Speiseplan

**Voraussetzung:** Schritt 06.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

Kann parallel zu den Schritten 08 und 10 laufen.

---

## Ziel

Das Package `@homebook/module-kitchen` mit Rezeptverwaltung, Wochen-Speiseplan, dem Vorratskammer-Platzhalter und der Suchanbindung.

---

## Wichtig vorab: Was echt ist und was nicht

| Bereich | Stand im Bestand |
|---|---|
| **Rezepte** | Vollständig gegen das Backend implementiert. Wird 1:1 portiert. |
| **Wochen-Speiseplan** | **Reine Attrappe.** `source/HomeBook.Frontend.Module.Kitchen/Pages/MealPlan/PlanOverview.razor.cs` erzeugt die Daten im Code (der Kommentar lautet `// Simulate data fetching`) mit fest eingetragenen deutschen Rezeptnamen. Es gibt **keine** Backend-Endpunkte für Speisepläne. |
| **Vorratskammer** | Platzhalter mit einer Überschrift. |

Der Speiseplan wird deshalb als **Attrappe portiert**: gleiche Darstellung, gleiche Interaktion, Daten weiterhin clientseitig. Es wird **kein** Backend dafür gebaut — das wäre ein eigenes Vorhaben und sprengt die Migration.

Zwei Dinge dabei anders machen als im Bestand:
- Die Beispieldaten in eine klar benannte Datei auslagern (etwa `src/mock/mealPlanFixture.ts`) mit einem Kommentar, dass hier später eine echte Anbindung hingehört — nicht mitten in eine Komponente.
- Die fest eingetragenen deutschen Rezeptnamen als Übersetzungsschlüssel führen, damit die Attrappe nicht in einer englischen Oberfläche deutsch spricht.

---

## Aufgaben

### 1. Rezeptübersicht — `/Kitchen/Recipes`

Vorlage `Pages/Recipes/Overview.razor`.

- `GET /api/modules/homebook/kitchen/recipes?searchFilter=` — **`searchFilter` ist Pflicht**, für „alle" einen leeren String senden
- Kartenraster mit Titelbild (`heroMediaId` über `/api/storage/media/{id}`), Name, Beschreibung, Portionen, Dauer und Kalorien
- Dauern über die drei Felder Arbeits-, Koch- und Ruhezeit. Der Bestand formatiert sie über Humanizer; in Vue über `Intl.RelativeTimeFormat` oder eine eigene kleine Hilfsfunktion, jedenfalls lokalisiert.
- Suchfeld auf der Seite, Aktionen anlegen, bearbeiten, ansehen, löschen
- Löschen mit Rückfrage über PrimeVue `ConfirmDialog`
- Kontexteinträge im Menü-Store anmelden

### 2. Rezeptansicht — `/Kitchen/Recipes/{RecipeId}/View`

Vorlage `Pages/Recipes/View.razor`. `GET /api/modules/homebook/kitchen/recipes/{id}` und `/images`. Bildergalerie, Zutatenliste, nummerierte Zubereitungsschritte mit Timerangabe, Metadaten, Kommentare, Quelle.

### 3. Rezept anlegen und bearbeiten — `/Kitchen/Recipes/New` und `/Kitchen/Recipes/{RecipeId}/Edit`

Vorlage `Pages/Recipes/Edit.razor`, im Bestand eine Komponente für beide Routen. Das so beibehalten.

- Felder: Name, Beschreibung, Portionen, Arbeits-, Koch- und Ruhezeit, Kalorien, Kommentare, Quelle
- Zutatenliste — Vorlage `Pages/Recipes/Components/UiRecipeIngredientsList.razor`: Name, Menge, Einheit; hinzufügen, entfernen, umsortieren
- Schritteliste — Vorlage `UiRecipeStepsList.razor`: Beschreibung, Position, optionale Timerdauer in Sekunden
- Bilder: Upload über `POST /api/storage/files` mit base64-Inhalt und Scope `homebook.kitchen.RecipeImages`, Grenze 20 MB vorher clientseitig prüfen. Die zurückgegebene `mediaItemId` kommt in `mediaIds` beziehungsweise `mediaItems` des Rezepts.
- Anlegen über `POST`, Vollaktualisierung über `PUT`. `PATCH` dient ausschließlich dem Umbenennen und wird nur dort verwendet, wo der Bestand es tut.

### 4. Wochen-Speiseplan — `/Kitchen/MealPlan`

Vorlagen `Pages/MealPlan/PlanOverview.razor`, `Components/UiMealDay.razor`, `Components/UiMealCard.razor`, `Dialogs/MealSelectDialog.razor`.

- Sieben Tage ab heute, Kalenderwoche als Überschrift. Die Wochenberechnung ist im Bestand `FirstFourDayWeek` mit Montag als erstem Tag — dieselbe Regel verwenden, lokalisiert formatiert.
- Je Tag eine Karte mit den Mahlzeiten Frühstück, Mittag- und Abendessen (`MealType`), jede mit Rezeptname, Zutatenkurzfassung, Dauer und Kalorien
- Farbakzent je Tag aus der `--hb-color-*`-Palette wie im Bestand
- `MealSelectDialog` zum Zuordnen eines Rezepts zu einem Mahlzeitenplatz — lädt echte Rezepte aus dem Backend, auch wenn der Plan selbst nicht persistiert wird
- Kontexteintrag zurück zu den Rezepten

### 5. Vorratskammer — `/Kitchen/Pantry`

Platzhalter. Route und Start-Kachel bleiben, damit Navigation und Verlinkung unverändert sind.

### 6. Modulregistrierung

Vorlage `source/HomeBook.Frontend.Module.Kitchen/Module.cs`.

- Schlüssel `homebook.kitchen`, Name und Beschreibung aus dem Modul-Katalog, Icon `glass-morphism/Tableware`
- Drei Start-Kacheln, Farben und Icons exakt wie im Bestand:

| Kachel | Ziel | Icon | Farbe |
|---|---|---|---|
| Rezepte | `/Kitchen/Recipes` | `windows11-filled/CookBook` | `var(--hb-color-amber)` |
| Vorratskammer | `/Kitchen/Pantry` | `windows11-filled/GroceryShelf` | `var(--hb-color-teal)` |
| Speiseplan | `/Kitchen/MealPlan` | `windows11-filled/RestaurantMenu` | `var(--hb-color-cerulean)` |

- Suchergebnis-Komponente registriert unter dem Handler-Namen `HomeBook.Backend.Module.Kitchen.Module.RecipeSearchHandler`. Vorlage `Search/Templates/RecipesSearchHandlerResultTemplate.razor` samt zugehöriger CSS — ein responsives Raster mit 3, 4, 3 und 2 Spalten an den Breakpoints 1279.98, 959.98 und 599.98 Pixel.
- Übersetzungskatalog des Moduls, migriert aus `Resources/Strings*.resx` (53 Schlüssel)

---

## Akzeptanzkriterien

- [ ] Rezepte lassen sich anlegen, ansehen, bearbeiten und löschen; Bilder werden hochgeladen und angezeigt
- [ ] Die Rezeptsuche funktioniert, der leere Filter liefert alle Rezepte
- [ ] Ein Upload über 20 MB wird clientseitig abgewiesen, mit verständlicher Meldung
- [ ] Der Speiseplan sieht aus wie im Bestand, die Beispieldaten liegen in einer eigenen, als Attrappe gekennzeichneten Datei und sind übersetzt
- [ ] Die drei Start-Kacheln erscheinen mit den richtigen Farben und Icons
- [ ] Rezepttreffer erscheinen in der globalen Suche
- [ ] Screenshot-Vergleich gegen den Bestand zeigt keine sichtbaren Abweichungen
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch

## Nicht in diesem Schritt

- Kein Backend für den Speiseplan
- Kein Ausbau der Vorratskammer
- Keine anderen Module
