# Rift Runner audio

The Portal-style replacement has a new original soundtrack and action palette. The rejected desk audio is recoverable from Git tag `skyport-desk-v1`; none of its paper/stamp/boarding sounds are loaded by the current runtime. All current audio is locally synthesized for Rift Runner. No external sample, commercial-game soundtrack, paid service, account or purchased recording is used. The original assets may be redistributed with this game, without third-party audio attribution.

## “Between Two Courtyards”

92 BPM, 4/4, 32 bars, A A B A′, 83.478 seconds. Airy glass mallets carry a rising E–A–B–C♯ motif and a descending response; soft hollow plucks, breathing harmony, rounded bass and sparse granular percussion support it. Harmonic motion in the A sections follows Aadd9 → F♯m9 → Dmaj9 → Eadd9. The B section moves through C♯m7 → Dmaj9 → Bm7 → Esus, with a contrasting higher melody. The second A changes phrase replies; the final A returns and resolves to A. This is an authored tune with melody, harmony, bass, rhythm and phrase variation.

`public/audio/rift-courtyard.flac` is the complete calm exploration score. `rift-connection.flac` is an aligned counter-arpeggio and light pulse, revealed gradually when a portal pair exists and more fully when a bridge is active. `rift-air.flac` is a 24-second courtyard environment: slow wind, distant ventilation and occasional synthesized birds, without intelligible speech. All loops are lossless FLAC, with equal endpoints and circular musical tails; the connection and score stems start together and share exact duration.

The reproducible seeded source is `scripts/render-rift-audio.py` (Python/numpy + FFmpeg). It also authors all action cues from harmonic/noise synthesis. Short cues use WAV to avoid codec padding.

## Action palette

| Cue | Sound |
|---|---|
| `portalA` | Lower ascending glass/field placement chord |
| `portalB` | Complementary higher glass/field placement chord |
| `invalid` | Quiet, short blocked-surface knock |
| `enter` | Falling suction whoosh |
| `exit` | Rising, expanding release whoosh |
| `pickup` | Magnetic contact with a tiny glass overtone |
| `drop` | Compact cargo impact |
| `contact` | Lighter material contact |
| `pad` | Two-part mechanical latch |
| `bridge` | Gentle geared/servo unfolding with a harmonic opening |
| `jump` | Short upward air motion |
| `land` | Low, soft landing impact |
| `respawn` | Reversing field shimmer resolving into three notes |
| `complete` | Five-note expanding completion figure |
| `error` | Gentle unresolved short interval |

A/B sounds differ without relying on volume or harshness. Enter/exit and pickup/drop have different envelopes. Sound is feedback alongside the physical and textual outcome, and is never the only correctness signal.

## Mixer API and safeguards

`src/audio.ts` exports `RiftAudio`, with `SkyportAudio` retained as a source-compatible class name. Public methods:

- `start(): Promise<void>` — user-gesture creation/resume, local fetch/decode, idempotent loop setup.
- `cue(name, pan=0)` — context action sound; optional stereo pan from −1 to 1.
- `setConnection(paired, bridge=false)` — reveal counter-arpeggio at 42% for a linked pair or 85% for a bridge.
- `setEnergy(bool)` — compatible simple connection-layer switch.
- `setPaused(bool)` — fade/suspend or resume without duplicate loops.
- `settings()`, `setGain(bus, 0..1)`, `state()` — independent master/music/SFX/voice gains, persisted in `rift-audio-v1` localStorage.
- `setDucking(bool)`, `playVoice(url)` — optional local subtitled speech support; music/ambience duck to 24%. This slice contains no speech recordings and makes no listening-assessment claim.

All gain changes ramp. A compressor keeps output headroom; at most eight one-shots run concurrently, finished nodes disconnect, and contact/landing/error cues have short repeat guards. Repeated Start/resume keeps one context and the same three looping sources. Global controls remain the lead's responsibility: menus/input focus suppress movement, and pause/focus handlers call the mixer API.

## Preview and checks

[26-second mixed preview](docs/rift-audio/rift-mixed-preview.wav) ([local player](docs/rift-audio/preview.html)) demonstrates the new tune and courtyard environment; the counter-arpeggio emerges after the two portal sounds. It then includes traversal, pickup/drop/contact, pad/bridge, jump/land, invalid placement, respawn and completion. This is an authored mixed preview, not gameplay audio recording.

Measurements are in `docs/rift-audio/audio-metrics.json`; encoded decode checks and current-browser checks are added below. No subjective human listening session is claimed. Automated decoding/non-silence and a running AudioContext do not establish musical quality; the preview is provided for audition.

### Replacement audio verification — 27 October 2026

- `npx tsc --noEmit --strict --module ESNext --moduleResolution Bundler --target ES2022 --lib ES2022,DOM --skipLibCheck src/audio.ts` passed. A project-wide check during the lead's content/engine rewrite had expected old-main/new-content errors; it is not counted as a final build check.
- All 18 current runtime files decode to finite, non-silent PCM without clipping. Total compressed runtime audio is 8,505,576 bytes. The 26-second preview peaks at −12.993 dBFS with RMS −28.755 dBFS. See `encoded-decoding.json` and `audio-metrics.json` in docs/rift-audio.
- Current Chromium/Metal module lab uses the standard autoplay policy: no audio context before Start; a click loads 18 buffers and three looping sources with zero errors. Measured output RMS is 0.01529. All 15 cues played; the simultaneous cue cap stayed at eight. Pair/bridge gains reached approximately .410/.840 after a one-second ramp toward .42/.85. All four gains, master mute, ducking, persistence, pause/resume and repeated Start passed. Pause suspended/froze the timeline; repeated Start retained three loops. Defaults restored afterward.
- The browser runs at 48 kHz and holds 77,639,616 decoded audio bytes. Browser resampling initially reintroduced small endpoint differences; a 12 ms correction after decoding now gives exactly zero endpoint differences on all three browser loop buffers. This is a numerical seam check, not a human listening claim.
- Native macOS Chrome also played the current module. A real tab blur recorded focused:false, hidden:true, context:suspended, paused:true and three loops; returning recorded running/paused:false, still three loops. The tool read the displayed focus history through native AX; precise values are in `native-focus-observation.json`. Only newly created test tabs were used and then closed. This native check is against the actual module in its lab; integrated game controls are checked separately when the lead's new engine is ready.

Evidence: `docs/rift-audio/module-browser-check.json`, `module-browser.png`, `native-focus-observation.json`, `encoded-decoding.json`, `preview-waveform.png`. The waveform was inspected as a non-silence aid. The audio-lab capture is a test harness, not a gameplay screenshot.

### First actual Rift UI pass

`node docs/rift-audio/check-integrated.mjs` exercised the replacement engine at port 5261 through normal DOM/keyboard actions and the documented deterministic step hook. Start loaded the new 18 buffers and three loops. The four gain sliders, portal sound test, mute, Escape close/pause/resume, keyboard retry during play, full room restart, actual portal placement, pair stem, Space jump and landing all produced the expected current audio state/events. No page errors were observed. The gameplay screenshot was opened and inspected.

Two issues were reported to the lead, without modifying its engine/UI ownership: checkpoint retry from the Pause dialog returned to play while the mixer remained suspended; and the first normal approach to a linked front/rear pair was physically blocked at the exit, so this run does **not** verify actual traversal entry/exit cues. Precise pre-fix evidence is retained in `docs/rift-audio/integrated-pre-fix-check.json` and `integrated-blocked.png`. The lead's fixes and a narrow recheck are pending; this paragraph is not a final integrated pass claim.
