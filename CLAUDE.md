# ShellPad (Fork von Termix Mobile)

Lies zuerst `HANDOFF.md` (Stand, Entscheidungen, offene Punkte) und halte sie am Ende jeder Arbeitssitzung aktuell.

## Regeln
- Commits als **Claude Code**: `git -c user.name="Claude Code" -c user.email=noreply@anthropic.com commit` (plus `GIT_COMMITTER_NAME/EMAIL`), nie unter dem Namen des Nutzers. Danach auf `origin main` pushen.
- Ziel ist ein Android-Tablet mit Maus, Tastatur und tmux. Änderungen, die die Terminalgröße beim Ein-/Ausblenden von UI verändern, vermeiden (tmux zeichnet sonst neu).
- Upstream-Kompatibilität mit Termix-Servern bewahren: Server-Texte, User-Agent `Termix-Mobile`, Modulnamen `termix-*` nicht umbenennen.
- Neue UI-Texte in `src/i18n/locales/en.json` und `translated/de_DE.json`.
- Keine Nutzungsstatistik/Telemetrie wieder einbauen.

## Bauen & prüfen
Siehe `HANDOFF.md` → „Bauen“. Node 24 liegt unter `~/Android/node/bin`, JDK unter `~/Android/jdk`, SDK unter `~/Android/sdk`.
`npx tsc --noEmit` · `npx jest` · `npx eslint <dateien>` · `npx prettier --check <dateien>`
