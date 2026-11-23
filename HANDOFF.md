# ShellPad – Handoff

Stand: 2026-11-20 · Fork von [Termix-SSH/Mobile](https://github.com/Termix-SSH/Mobile) 2.1.0 · Repo `github.com/gutsprojecto/mobile-ssh`, Branch `main` · Paket `io.github.gutsprojecto.shellpad` · Expo 57 / React Native 0.86, natives Ghostty-Terminal (Kotlin + JNI)

## Wofür

SSH-Client für ein **Android-Tablet mit Maus und Tastatur**, Hauptnutzung: Verbindungen zu eigenen Servern, viel **tmux**. Anmeldung an einem Termix-Server wird nicht gebraucht, Push kann später kommen, Nutzungsstatistik ist entfernt.

## Was gegenüber Termix geändert ist

### Tablet & Maus

- **Navigationsleiste (Home, Hosts, Sessions …)**: im Sessions-Tab nur ein 6-px-Streifen links. Hover oder Tippen → schwebt als Glas-Pille über dem Terminal; schließt 5 s nachdem der Mauszeiger weg ist. Auf anderen Tabs normal sichtbar. Sie liegt über den Screens (Screens polstern selbst), damit sich das Terminal nie in der Größe ändert (sonst zeichnet tmux neu).
  `src/screens/shell/SideBar.tsx` (`AutoHideSideBar`, `sidebarScenePadding`), `app/(tabs)/_layout.tsx`
- **Tastenleiste (Esc, Tab, Pfeile …) ein/aus**: Button neben dem Hostlisten-Button im Tab-Dock, Einstellung bleibt gespeichert.
  `src/features/terminal/keys/keyRowShown.ts`, `Sessions.tsx`, `navigation/TabBar.tsx`
- **Maus im Terminal** (`modules/termix-terminal/android/.../GhosttyTerminalView.kt`, `handleMouseTouch`, `onGenericMotionEvent`):
  Mausrad scrollt (bei tmux-Mausmodus an tmux), Ziehen markiert, Doppel-/Dreifachklick Wort/Zeile, Shift+Klick erweitert, Rechtsklick = Menü (Kopieren/Einfügen/Link öffnen), Mittelklick fügt ein, Ctrl+Klick öffnet Link, I-Beam/Hand-Cursor.
  tmux/vim bekommen Drücken, **Ziehen** und Loslassen aller Tasten (JNI-Fix in `ghostty_jni.cpp`: Motion mit gedrückter Taste zählt als „pressed“). Shift erzwingt App-Markierung.
  Maus-Events laufen nicht mehr durch die Touch-Gesten (das war vermutlich die Ursache für „Maus hängt, erst Touch-Tippen hilft“: langes Klicken startete die Touch-Markierung).

### Name

- App-Name **ShellPad**, Paket/Bundle `io.github.gutsprojecto.shellpad`, Link-Schema `shellpad://` → lässt sich neben dem Original installieren.
- Texte, in denen die App sich selbst nennt, heißen ShellPad (alle Sprachen). **Bewusst unverändert**: Texte über den Termix-_Server_, User-Agent `Termix-Mobile/…`, Modulnamen `termix-*`, Terminal-Themes „Termix …“.
- Upstreams `google-services.json` wird nicht mehr gelesen (gehört zum Original-Paket) → kein Push, bis ein eigenes Firebase-Projekt per `GOOGLE_SERVICES_JSON` kommt.
- Achtung: Es gibt bereits eine kleine Play-Store-App „ShellPad – SSH & Telnet Client“ (`com.shellpad.app`). Für Eigennutzung egal, vor Veröffentlichung Namen prüfen.

### Design (Frosted Glass)

- `src/ui/Glass.tsx`: Glasfläche mit `expo-blur`. Android 12+ blurt das registrierte Ziel (die Terminal-Bühne in `Sessions.tsx`, `GlassBackdrop` + `glassTarget`), sonst halbtransparente Tönung.
- Glas: schwebende Navigationsleiste, Tab-Dock, Tastenleiste (runde Tasten).
- Schrift: **Inter** für die Oberfläche, JetBrains Mono nur mit `font-mono` (`src/ui/Text.tsx`, `src/constants/fonts.ts`).
- Runde Ecken: Radius-Tokens in `tailwind.config.js` (vorher überall 0), Button/Input/Badge/Card/Sheet/Menü/Toast angepasst; leichter Akzent-Schimmer hinter jedem `Screen`.
- Design-Vorschau (Canvas): https://claude.ai/artifact/B23bwyoX6JX63e5QhjQ9Uy

### Erster Tablet-Test (2026-11-20)

- Maus-Markierung arbeitet in Scrollback-Zeilen (`nativeSetScreenSelection`), wächst über den Bildschirm hinaus, scrollt beim Ziehen über den Rand automatisch, bleibt beim Wegscrollen; keine Touch-Griffe. Touchpad (SOURCE_MOUSE ohne Gesten-Klassifizierung) zählt als Maus.
- Leiste: Hintergrund daneben im Theme (war weiß), Wartestreifen dezent grau, Leiste füllt die ganze Höhe; Tabs ohne Terminal (Files, Tools) halten sie fest daneben (`useSessionsRailInset`).
- Kein Termix-Server in der Oberfläche: kein Willkommensbildschirm, Kopf zeigt „ShellPad“ statt Konto-Umschalter, keine „Server verknüpfen“-Knöpfe, Einstellungen „Konten“/„Plugins“ und Palette-Befehle entfernt (Server-Code bleibt im Hintergrund).
- Neues Logo `assets/brand/logo.svg` (Tablet mit `>_`), Icons per `npm run icons`.

### Zweite Runde (2026-11-20)

- Kein weißer Blitz mehr beim ersten Öffnen eines Screens: Navigationsthema und Szenen-Hintergrund nutzen die App-Farben (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`).
- Leiste: Symbole vertikal zentriert (passend zur Öffnungslinie), schwebende Leiste gleitet weich herein/heraus (Reanimated, respektiert „Bewegung reduzieren“), Klick/Tippen ins Terminal blendet sie sofort aus (`dismissFloatingRail`).
- Terminal hat links/rechts 10 px Abstand (`TerminalView.tsx`).
- Logo neu: Glasfläche mit Verlauf-Prompt `>_` (`assets/brand/logo.svg`), Icons mit Akzentverlauf und Schimmer, adaptives Icon mit eigenem Hintergrundbild (`adaptive-background.png`); `npm run icons` erzeugt alles.

### Dritte Runde (2026-11-20)

- Leiste: kein Federn mehr, nur kurzes weiches Ein-/Ausblenden (180 ms, Fade mit leichter Bewegung); feste Leiste neben Files blendet weich ein; Tastenleiste blendet weich ein/aus.
- Hostliste eingeblendet + feste Leiste (Files): die Leiste sitzt vor der Liste, die Liste gibt den Platz ab (Bühne/Terminals behalten ihre Breite), keine Lücke mehr neben Files.
- Sheets (Popups unten) sind schwebende Karten: rundum abgerundet, 10 px Abstand, nie unter der Android-Navigationsleiste.
- Icon: helles Feld (`BRAND.iconTile` #fbf8f3) mit orangem Verlauf-„S_“, wie aktuelle Google-App-Icons; Startbild bleibt dunkel.
- Offen/analysiert: türkiser Android-Griff oben links → siehe „Offene Punkte“.

### Vierte Runde (2026-11-21)

- **Nur noch arm64**: `plugins/withArm64Only.js` setzt `reactNativeArchitectures=arm64-v8a`, das Ghostty-Modul baut nur noch die angefragten ABIs. APK ca. 145 → ~95 MB. Emulator-APK: `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64`.
- **Termix-Server-Oberfläche gelöscht** (war seit Runde 1 schon unsichtbar): Features Sitzungen teilen, Homepage, Aktionen/Freigaben, Plugin-Webview (+ 0,75-MB-Plugin-Host), Plugin-Hostfelder; Screens Server verknüpfen, Konten-Umschalter, Proxy-Anmeldung, Plugins, „Update nötig“, Willkommen, `shellpad://open`-Server-Links, OIDC-Callback; Einstellungen Sync, Aktive Sitzungen, API-Schlüssel, Freigaben, Ausführungsverlauf, Server-Aktionen, Plugins, Server-Alarme, Server-Statistik.
  **Bewusst geblieben**: `src/core/api`, `core/accounts`, `core/sync`, `core/plugins` (Host-Daten, Konto „Dieses Gerät“ und Feature-Registry hängen daran), Tailscale-Feature (in Hostliste/Editor verdrahtet), Remote-Desktop.
- **Hostliste in der Session ein/aus weich**: gleitet als Ebene über die Bühne (220 ms), erst danach gibt die Bühne Platz ab; beim Schließen bekommt die Bühne den Platz sofort zurück, die Liste gleitet darüber hinaus. Das Terminal ändert die Breite also nur einmal, kurzes Abblenden kaschiert das Umbrechen des Textes (`Sessions.tsx`, `paneSettled`/`paneSlide`/`stageFade`).
- **Bug „Session-Tab hängt ausgewählt, reagiert erst nach Fingertipp“** (auch im Original): Halten startet nach 250 ms das Verschieben; wurde die Geste abgebrochen statt beendet, blieben `justDropped`/`dragging` gesetzt und jeder Klick wurde ignoriert. Jetzt Aufräumen in `onFinalize`, und ein langsamer Klick ohne Bewegung zählt als Klick (`TabStrip.tsx`).
- **Icon neu**: weißes Feld, kleines gefaltetes `>_` (Orange → Koralle) mittig, wie Google Play/Proton Pass. Symbol mit eigenen Verläufen in `assets/brand/logo.svg`, Größe über `TILE_SYMBOL` in `scripts/icon-spec.cjs`; `npm run icons`. Vorlage: Screenshot in `~/shellpad/`.

### Fünfte Runde (2026-11-22)

- **Navigationsleiste überall als Glas-Pille**: Home/Hosts/Tools/Einstellungen und die feste Leiste neben Files zeigen dieselbe schwebende Pille (10 px Abstand, gleiche Breite/Position) wie ausgeklappt über dem Terminal; ein einziges Element, das beim Tabwechsel nicht neu gemountet wird → kein Springen mehr. Bildschirme polstern `railRoom()` (Leiste + 2×10 px). Außerhalb von Sessions nur Tönung ohne Blur (`Glass blur={false}`), weil Android sonst die Terminal-Bühne verwischt.
- **Ungewolltes Kopieren (OSC 52)**: Ursache auf dem Heimserver: tmux mit `set-clipboard external` (Maus aus) reicht Kopier-Befehle von Programmen (z. B. Claude Code) ans Terminal durch, ShellPad hat jede sofort übernommen. Jetzt: gleicher Text wird ignoriert, 3 s nach eigenem Kopieren darf kein Programm die Zwischenablage überschreiben (`USER_COPY_GUARD_MS`), und Schalter **Einstellungen → Terminal → „Programme dürfen kopieren“** (`programClipboard`, Standard an).
- **„Kopiert“ als Glas-HUD mittig** statt Toast oben (`src/ui/CopiedHud.tsx`, `showCopied`), 1,2 s, weiches Ein-/Ausblenden.

### Sechste Runde (2026-11-23)

- **Tote Tasten / Akzente**: AltGr+2 dann u → ü (und jede andere Tot-Taste des Layouts). `handleKeyEvent` merkt sich den Akzent (`pendingAccent`, `KeyCharacterMap.COMBINING_ACCENT`) und setzt ihn mit `getDeadChar` auf den nächsten Buchstaben; ohne passenden Buchstaben kommt der Akzent einzeln, dann die Taste. Linkes Alt bleibt Alt/Meta für die Shell.
- **Links per Mausklick**: einfacher Klick ohne Ziehen öffnet einen Link (Schalter **Einstellungen → Terminal → „Mausklick öffnet Links“**, `mouseClickLinks`, Standard an; aus = nur Strg+Klick/Rechtsklick-Menü). Hand-Mauszeiger gab es schon.
- **Umgebrochene Links**: `LinkFinder.findWrapped` verbindet Zeilen, wenn eine bis zur letzten Spalte voll ist und die nächste ohne Leerzeichen weitergeht (max. 8 Zeilen); Zeilen mit tmux-Fensterrand `│` werden nie verbunden.
- Nicht in der App lösbar: tmux entfernt OSC-8-Links ohne `set -as terminal-features ",xterm*:hyperlinks"` (Server-Einstellung, Hinweis für Nutzer). Offen: prüfen, ob tmux ShellPad per XTVERSION automatisch als link-fähig erkennt.
- Links in Claude Code (in tmux): Claude Code schaltet Maus-Tracking ein, tmux mit `mouse off` reicht das ans Terminal durch → Klicks gehen ans Programm, Link-Erkennung aus. **Umschalt+Klick** öffnet den Link, Umschalt+Rechtsklick zeigt das Menü. Dem Nutzer reicht das; „Klick auf Link hat Vorrang vor Programm-Maus“ bewusst nicht gebaut.
- **Tot-Tasten, zweiter Anlauf (funktioniert, bestätigt 2026-11-23)** (Test 2026-11-23, Layout „UK PC“, AltGr wird vor dem Buchstaben losgelassen): ¨ erschien sofort und blieb als „¨u“, also kommt das ¨ als fertiges Zeichen (nicht als Android-Tot-Taste). In anderen Apps ersetzt das Textfeld ¨+u durch ü. Jetzt in `sendBytes`/`accentAfterTyping`: nach einem einzeln getippten ¨ oder ´ ersetzt der nächste passende Buchstabe es (Backspace + ü), egal ob über Tastatur-App oder Taste. ` ^ ~ bleiben unverändert (Shell). Zusammensetzen in `DeadKeys.kt` (Normalizer, mit Tests).
- **Lange gedrückt → Umlaut-Auswahl der Tastatur-App**: Hardware-Buchstaben landen jetzt im IME-Kontext (`ime.commit` statt `ime.reset`). Test 2026-11-23: **funktioniert noch nicht** → siehe „Vor dem Release“.

### Entfernt

- Nutzungsstatistik (PostHog, Zustimmungsdialog, Einstellungen, Zähler) samt `posthog-react-native`.

## Bauen

```sh
export PATH=~/Android/node/bin:$PATH JAVA_HOME=~/Android/jdk ANDROID_HOME=~/Android/sdk
npm ci --ignore-scripts          # better-sqlite3 (nur Tests) braucht sonst einen C-Compiler
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64 \
  -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
# → android/app/build/outputs/apk/release/app-release.apk (debug-signiert), ~13–21 min
```

Prüfen: `npx tsc --noEmit`, `npx jest`, `npx eslint <dateien>`, `npx prettier --check <dateien>`.

## Upstream übernehmen

Remote `upstream` = `github.com/Termix-SSH/Mobile`. Prüfen: `git fetch upstream && git log --oneline HEAD..upstream/main`, Probe: `git merge-tree --write-tree HEAD upstream/main`. Zuletzt übernommen 2026-11-23 (bis `1244705`, nur Plugin-Katalog).

## Offene Punkte

### Vor dem Release (Pflicht)

- **Langes Halten einer Taste → Umlaut-Auswahl der Tastatur-App**: Auswahl erscheint, die gedrückte Zahl wird nicht übernommen (Stand 2026-11-23, auch nach `ime.commit` der Hardware-Buchstaben). Tot-Tasten (AltGr+2 loslassen, dann u → ü) funktionieren dagegen. Nächster Schritt: Funk-Debugging (adb pair) + Log-Build, sehen was die Tastatur-App schickt (deleteSurroundingText? Tastendruck? setComposingRegion?), dann gezielt reparieren.
- **Eigener Release-Schlüssel** statt Debug-Signatur (sicher aufbewahren; ohne ihn keine Updates mehr).
- **Name prüfen**: „ShellPad“ gibt es schon im Play Store (`com.shellpad.app`).
- **Mausklick-Hänger bei Session-Tabs** (siehe „Weitere“) beheben.
- **Neuer Name** (ShellPad ist im Play Store vergeben): Favoriten Caretty, Folia, Folioterm, Tessera – noch zu prüfen (Play, F-Droid, GitHub, EUIPO/DPMA). Store-Titel mit Zusatz, z. B. „Caretty – SSH & Terminal“ (max. 30 Zeichen). Dabei Paketnamen und Repo `mobile-ssh` (Kollision mit der App „Mobile SSH“) mit umbenennen.
- **Lizenz**: Upstream ist Apache-2.0 → LICENSE behalten, NOTICE/Hinweis „Fork von Termix Mobile“ und eigene Änderungen kennzeichnen.


### Für die nächste Runde (Rückmeldung vom Tablet-Test 2026-11-20)

- ~~Kopiert von selbst~~ → erledigt in Runde 5. Alte Analyse: **Kopiert manchmal von selbst nach dem Kopieren, vielleicht wegen tmux.** Vermutete Ursache: tmux mit Mausmodus markiert beim Ziehen selbst (Copy-Mode) und schickt die Auswahl beim Loslassen per **OSC 52** ans Terminal (`set-clipboard on`/`external`). ShellPad übernimmt jede OSC-52-Nachricht sofort in die Zwischenablage und zeigt „Kopiert“ (`GhosttyTerminalView.kt`, `nativeTakeClipboard` → `setClipboard` + `onCopied`). Auf dem Server prüfen: `tmux show -g set-clipboard`, `tmux show -g mouse`, Bindings für `MouseDragEnd1Pane`. Mögliche Lösung: OSC-52-Schreiben als Einstellung (an / fragen / aus) oder nur nach eigener Mausaktion, Hinweis „von tmux kopiert“ statt still kopieren.
- ~~Navigationsleiste überall wie die ausgeklappte Session-Leiste~~ → erledigt in Runde 5: das schwebende Glas-Design (Pille mit Abstand, zentrierte Symbole) auch auf Home/Hosts/Tools/Einstellungen verwenden. Wirkt einheitlich und verhindert, dass die Leiste beim Wechsel zwischen normalem Screen und Session leicht springt. Dabei Breite/Position beider Zustände exakt gleich halten (`AutoHideSideBar`, `sidebarScenePadding` in `src/screens/shell/SideBar.tsx`).
- **Mausklicks hängen manchmal (Touch geht)** – weiterhin da (Rückmeldung 2026-11-23): Session-Tabs lassen sich manchmal nicht anklicken, erst ein Fingertipp löst es. **Ohne vorherigen Rechtsklick**, der Verdacht „Rechtsklick-Menü schluckt das Loslassen“ erklärt es also nicht (allein). Der `onFinalize`-Fix in `TabStrip.tsx` (Runde 4) hat es nicht vollständig behoben. Weitere Verdachte: (1) RN-Responder bleibt hängen, wenn ein Maus-UP verloren geht (z. B. Hover-/Pointer-Events, schwebende Leiste/Overlay, das beim Klick ein-/ausblendet); (2) Gesture-Handler-Pan mit `activateAfterLongPress` bleibt nach einem Maus-Klick in BEGAN; (3) Fokus/Hover-Zustand der nativen Terminal-View fängt das erste Event. Nicht reproduzierbar, passiert zufällig. **Beschlossener nächster Schritt (2026-11-23, noch nicht gebaut):** Eingabe-Protokoll in der App – Schalter Einstellungen → Diagnose → „Eingabe-Protokoll“ (Standard aus), Ringpuffer nur im Speicher mit Zeit, Quelle (Maus/Finger), Down/Up/Cancel, Position, Responder-/Ziel-Element und Gesture-Handler-Zustand von TabStrip; **keine Tasten, Texte oder Terminal-Inhalte**. „Protokoll speichern“ → Datei, Nutzer lädt sie per SFTP auf den Server. Vor dem Release wieder entfernen oder ausgeblendet lassen. Funk-Debugging nur als Ausweichweg. Vor dem Release beheben.
- **Speicher weiter sparen (ohne Funktionsverlust)**: nur genutzte Inter/JetBrains-Gewichte importieren (Subpfade statt Paket-Index, ~3,7 MB), Terminal-Schriften auf JetBrains Mono NF reduzieren (~10 MB), nur Englisch + Deutsch bündeln (~6–7 MB). Optional: QR-Scanner/expo-camera (~6 MB), Remote-Desktop (~1 MB).

### Weitere

- **Türkiser Punkt oben links (Systemgriff)**: wahrscheinlich zeichnet die Tastatur/Android ihren Cursor-Griff an Position 0,0, weil sich das Terminal als Texteingabe meldet (`onCheckIsTextEditor`), aber nie mitteilt, wo der Cursor steht (kein `requestCursorUpdates`/`CursorAnchorInfo` in `GhosttyTerminalView`). Lösung: Cursor-Position per `CursorAnchorInfo` melden bzw. Handschrift/Griffe abschalten.

- **Auf dem Tablet testen**: neue Hostlisten-Animation (auch mit fester Leiste neben Files), langsamer Klick auf Tabs, Maus (Rad, Ziehen in tmux, Rechtsklick), Hover-Leiste, Glas-Blur über dem Terminal, Performance.
- Noch nicht umgesetzt aus der Ideenliste: Shift+PgUp/PgDn & Shift+Home/End für Scrollback, Shift+Insert/Ctrl+Insert, Hover/Rechtsklick auf Hosts & Tabs, Tab/Pfeil/Enter-Navigation in Listen.
- Push (eigenes Firebase), eigener Release-Schlüssel statt Debug-Signatur.
- Übersetzungen: neue Texte nur in Englisch + Deutsch; Termix-Übersetzungs-Workflow läuft im Fork nicht.
- OIDC-Login am Termix-Server mit `shellpad://` ungetestet (wird nicht gebraucht).

## Verlauf

- 2026-11-23 (abends): README auf ShellPad umgeschrieben, Upstream bis `1244705` übernommen.
- 2026-11-23: Tot-Tasten (AltGr+2 → ü), Links per Mausklick, umgebrochene Links.
- 2026-11-22: Glas-Leiste auf allen Tabs, OSC-52-Schutz + Schalter, „Kopiert“-HUD mittig.
- 2026-11-21: nur arm64, Termix-Server-Oberfläche gelöscht, weiche Hostliste, Tab-Hänger behoben, weißes `>_`-Icon.
- 2026-11-20 (spät): weiche Übergänge, Hostliste/Leiste, Sheet-Karten, helles S-Icon.
- 2026-11-20 (abends): weißer Blitz, zentrierte/animierte Leiste, Terminal-Abstand, neues Logo.
- 2026-11-20 (später): Tablet-Test-Fixes, Server-Oberfläche entfernt, neues Logo.
- 2026-11-20: Fork geklont; Maus/Tastatur-Verbesserungen, einklappbare Leiste, Tastenleisten-Button; Umbenennung in ShellPad; Frosted-Glass-Redesign; Statistik entfernt.
