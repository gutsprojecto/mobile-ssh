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

## Offene Punkte

- **Auf dem Tablet testen**: Maus (Rad, Ziehen in tmux, Rechtsklick), Hover-Leiste, Glas-Blur über dem Terminal, Performance.
- Noch nicht umgesetzt aus der Ideenliste: Shift+PgUp/PgDn & Shift+Home/End für Scrollback, Shift+Insert/Ctrl+Insert, Hover/Rechtsklick auf Hosts & Tabs, Tab/Pfeil/Enter-Navigation in Listen.
- Push (eigenes Firebase), eigener Release-Schlüssel statt Debug-Signatur.
- Übersetzungen: neue Texte nur in Englisch + Deutsch; Termix-Übersetzungs-Workflow läuft im Fork nicht.
- OIDC-Login am Termix-Server mit `shellpad://` ungetestet (wird nicht gebraucht).

## Verlauf

- 2026-11-20 (abends): weißer Blitz, zentrierte/animierte Leiste, Terminal-Abstand, neues Logo.
- 2026-11-20 (später): Tablet-Test-Fixes, Server-Oberfläche entfernt, neues Logo.
- 2026-11-20: Fork geklont; Maus/Tastatur-Verbesserungen, einklappbare Leiste, Tastenleisten-Button; Umbenennung in ShellPad; Frosted-Glass-Redesign; Statistik entfernt.
