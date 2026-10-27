# Native Chrome focus observation — 27 October 2026

The automated Chromium tab-switch checks kept reporting `document.hasFocus() === true`, so they were not counted as proof of real blur. A native macOS Chrome check was therefore run through `mcp__cua_repl` using only newly created test tabs.

Procedure:

1. Open the local audio harness in a new Chrome task tab; inspect its UI.
2. Open a separate native tab through Chrome's New Tab action at `http://localhost:5261/docs/audio/audio-check.html?native=1`. This tab was not claimed through extension DOM control, avoiding that surface's focus emulation.
3. Click Start through native AX. The UI showed `context: running`, `loadedBuffers: 16`, `loopCount: 3`, and zero load errors. Chrome marked the tab as “Audio playing”.
4. Select a newly created blank tab using native Chrome AX, then return to the harness tab.
5. Read the harness's displayed focus history and inspect the native screenshot. The recorded blur event had `focused: false`, `hidden: true`, `context: suspended`, `paused: true`, `loopCount: 3`, zero active SFX, 16 loaded buffers, no errors, and timeline `4.562666666666667`.
6. The subsequent focus event showed `focused: true`, `hidden: false`, `context: running`, `paused: false`; the live timeline resumed (first observed at `4.8613333333333335`).
7. Close only the two native test tabs and the extension-created test tab. The previously focused user tab was restored, without navigating or changing it.

This verifies real native focus events against the actual SkyportAudio module's fade/suspend/resume behavior. The harness is an instrumented module test, not a gameplay capture. Integrated game Start/settings/mute/pause/resume/restart were separately verified in `integrated-audio-check.json`; main.ts calls the same `setPaused` API for its window blur/focus handlers. No subjective human audition is claimed. The tool displayed the native screenshot during the check; that screenshot was not copied into the repository because it included unrelated browser chrome.
