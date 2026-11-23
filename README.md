<div align="center">

<img src="./assets/brand/logo.svg" width="120" alt="ShellPad logo" />

<h1>ShellPad</h1>

<p>A tablet first SSH client for Android, made for a mouse, a hardware keyboard and tmux</p>

<p>
  <img src="https://img.shields.io/badge/platform-Android-F39044?style=flat&labelColor=1a1a1a" />
  <img src="https://img.shields.io/badge/fork%20of-Termix%20Mobile-F39044?style=flat&labelColor=1a1a1a" />
  <img src="https://img.shields.io/badge/license-Apache%202.0-F39044?style=flat&labelColor=1a1a1a" />
</p>

</div>

<br />

## Overview

ShellPad is a fork of [Termix Mobile](https://github.com/Termix-SSH/Mobile), tuned for working on an Android tablet like on a laptop: a Bluetooth keyboard, a mouse or trackpad, and long running tmux sessions on your own servers.

It connects straight from the tablet, with no server needed. Hosts, keys and snippets stay in an encrypted database on the device. The parts of Termix Mobile that only make sense with a Termix server are removed from the app, and so is the usage statistics.

> ShellPad is an independent fork and is not affiliated with or supported by the Termix project. Please do not send ShellPad issues to the Termix repos.

<br />

## Thank you, Termix

ShellPad would not exist without the work of the [Termix](https://github.com/Termix-SSH) team. Termix Mobile brought the native terminal built on Ghostty, the SFTP file manager, the host tools and almost everything else this app is made of, all open source under Apache 2.0. ShellPad only changes how it feels on a tablet.

If you like the app, please give [Termix Mobile](https://github.com/Termix-SSH/Mobile) a star and consider [supporting Termix](https://donate.termix.site/).

<br />

## What ShellPad adds

### Mouse and trackpad

- Wheel scrolling, drag to select (also into the scrollback, with auto scroll at the edge), double click for a word, triple click for a line, Shift+click to extend the selection.
- Right click menu with copy, paste and open link at the pointer, middle click pastes.
- tmux, vim and other programs get press, drag and release of every button, so pane borders, selections and scrollbars work. Shift+click always selects in the app, even while a program uses the mouse.
- Text and hand pointers, and the touchpad counts as a mouse.

### Hardware keyboard

- Dead keys and accents: for example AltGr+2, then u types ü, on layouts that type the accent as a dead key or as a plain character.
- AltGr types the symbols of your layout, Left Alt stays Alt for the shell.
- Keyboard shortcuts for tabs and font size, and the on screen key row can be hidden with one tap.

### Links

- A plain mouse click opens a link (can be turned off), Ctrl+click and the right click menu work too.
- Long addresses that wrap over several lines are found as a whole, without joining tmux panes.
- Inside programs that use the mouse, like Claude Code, Shift+click opens the link.

### Made for tmux

- The terminal never changes size when app UI shows or hides, so tmux does not redraw. The navigation rail floats over the terminal as a frosted glass pill and hides itself again.
- The host list slides over the terminal and the text reflows only once.
- Clipboard writes from programs (OSC 52) are guarded: the same text is ignored, nothing overwrites what you just copied, and a switch turns them off.

### Look and feel

- Frosted glass design with rounded corners and the Inter font.
- A centered "Copied" message, smooth transitions and no white flash between screens.
- A new icon.

### Lean

- No usage statistics or telemetry.
- No Termix server sign in, linking, sync, plugins or server actions in the app.
- arm64 only, about 94 MB instead of 145 MB.

### Fixes

- A session tab no longer stays "selected" and ignores clicks until it is touched with a finger.

<br />

## Kept from Termix Mobile

- Native terminal with themes, fonts, ligatures, pinch to zoom, find, history search, tmux attach, password and sudo fill.
- Tabs you can rename, drag and split, sessions that keep running in the background and reconnect.
- SFTP file manager with transfers, a code editor and previews.
- Host metrics, Docker, systemd and OpenRC services, tunnels and snippets for many hosts at once.
- RDP, VNC and Telnet.
- Hosts with folders, jump hosts, import from SSH config, Wake-on-LAN and Tailscale.
- Ed25519 and ECDSA key generation, PuTTY key conversion.
- App lock with fingerprint and PIN, home screen widgets and many languages.

<br />

## Installation

There is no release yet. Until then, build it yourself:

```sh
npm ci --ignore-scripts
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease
# android/app/build/outputs/apk/release/app-release.apk
```

You need Node 24, JDK 21 and the Android SDK. ShellPad uses its own package name (`io.github.gutsprojecto.shellpad`), so it installs next to Termix Mobile.

<br />

## License

Apache License 2.0, like Termix Mobile. See [LICENSE](LICENSE). Changes compared to Termix Mobile are in the git history of this repo.
