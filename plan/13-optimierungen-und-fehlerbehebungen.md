# 13 — Optimierungen und Fehlerbehebungen

**Voraussetzung:** Schritt 12.
**Kontext:** Lies zuerst `plan/00-uebersicht.md` und `AGENTS.md`.

---

## Ziel

Sammelstelle für Punkte, die während der Migration aufgefallen sind, aber bewusst nicht im jeweiligen Schritt erledigt wurden: Optimierungen ohne Einfluss auf die Funktion und kleinere Fehler. Jeder Punkt nennt, wo er aufgefallen ist, was zu tun ist und woran man erkennt, dass er erledigt ist. Neue Punkte werden unten als weiterer Abschnitt unter „Aufgaben“ angehängt.

---

## Aufgaben

### 1. PrimeVue-Chunk aufteilen

**Aufgefallen in:** Schritt 07, siehe Umsetzungsnotizen in `plan/07-setup-und-login.md`.

**Problem:** `frontend/apps/web/vite.config.ts` fasst über eine `codeSplitting`-Gruppe jedes Modul aus `primevue`, `@primevue` und `@primeuix` in einem Chunk zusammen:

```ts
{ name: 'primevue', test: /node_modules[\\/](primevue|@primevue|@primeuix)[\\/]/ },
```

Dieser Chunk wird beim Start geladen, auch mit Komponenten, die nur lazy geladene Seiten brauchen, etwa Stepper, Select, InputNumber und `@primevue/forms` für `/Setup`. Nach Schritt 07 ist er 524 kB groß (gzip 108 kB). Vite warnt deshalb beim Build über „Some chunks are larger than 500 kB“, und mit jeder weiteren Seite wächst er weiter.

**Empfehlung:** Die Gruppe auf den PrimeVue-Kern beschränken, statt `chunkSizeWarningLimit` anzuheben:

```ts
{ name: 'primevue', test: /node_modules[\\/](@primevue[\\/]core|@primeuix)[\\/]/ },
```

Laufzeit und Theme bleiben ein eigener, stabiler und gut cachebarer Vendor-Chunk; diesen Zweck hatte die Gruppe laut `plan/03-projekt-setup.md`. Die einzelnen Komponenten landen bei den Seiten, die sie nutzen. `chunkSizeWarningLimit` hochzusetzen blendet nur die Meldung aus und ändert nichts am Laden beim Start.

**Messung nach Schritt 07** (Probe-Build, danach zurückgenommen):

| | Vorher | Mit Kern-Gruppe |
|---|---|---|
| `primevue`-Chunk | 524 kB (gzip 108) | 274 kB (gzip 46) |
| Beim Start geladen (primevue + index + shared) | ca. 755 kB (gzip ca. 162) | ca. 662 kB (gzip ca. 144) |
| Nur für `/Setup` | — | Select 58 kB, Datenbankschritt 37 kB, Forms/Validierung 16 kB |
| Warnung über 500 kB | ja | nein |

`index` wächst dabei von 231 auf 292 kB: Das sind die PrimeVue-Komponenten, die die Shell ohnehin beim Start braucht (Toast, Dialog, Button). Unterm Strich lädt der Start trotzdem weniger.

**Vorgehen:**

- Die Messung wiederholen, denn die Schritte 08 bis 10 bringen weitere PrimeVue-Komponenten mit. Vorher und nachher `bun run build` und die Chunk-Liste vergleichen.
- Prüfen, dass kein PrimeVue-Modul doppelt in mehreren Chunks landet (rolldown legt gemeinsam genutzte Module in einen geteilten Chunk).
- Im Browser prüfen, dass Startseite, `/Login`, `/Setup` und die Modulseiten ohne Fehler laden und die Theme-Stile greifen, besonders die CSS-Layer-Reihenfolge `primevue, hb`.
- Die Notiz „Größerer PrimeVue-Chunk“ in `plan/07-setup-und-login.md` um einen Verweis auf die Erledigung ergänzen.

---

## Akzeptanzkriterien

- [ ] `bun run build` meldet keine Chunks über 500 kB, ohne dass `chunkSizeWarningLimit` angehoben wurde
- [ ] Komponenten, die nur lazy geladene Seiten brauchen, liegen nicht mehr im beim Start geladenen Chunk
- [ ] Startseite, `/Login`, `/Setup` und Modulseiten laden im Browser ohne Fehler, die Stile stimmen
- [ ] `bun run lint && bun run typecheck && bun run test && bun run build` läuft durch
