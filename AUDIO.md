# Rift Runner audio

Current scope: the single 50-level campaign in CAMPAIGN-50.md. The original exploration score is retained, with new machinery cues and subtle chapter/intensity variations. Audio assets and module playback are verified below; actual new-machine integration is marked separately. Earlier nine-room checks are historical evidence.

The Portal-style replacement has a new original soundtrack and action palette. The rejected desk audio is recoverable from Git tag `skyport-desk-v1`; none of its paper/stamp/boarding sounds are loaded by the current runtime. All current audio is locally synthesized for Rift Runner. No external sample, commercial-game soundtrack, paid service, account or purchased recording is used. The original assets may be redistributed with this game, without third-party audio attribution.

## “Between Two Courtyards”

92 BPM, 4/4, 32 bars, A A B A′, 83.478 seconds. Airy glass mallets carry a rising E–A–B–C♯ motif and a descending response; soft hollow plucks, breathing harmony, rounded bass and sparse granular percussion support it. Harmonic motion in the A sections follows A → F♯ minor → D → E, with add9 and major-seventh colours. The B section moves through C♯ minor → D → B minor → Esus, with a contrasting higher melody. The second A changes phrase replies; the final A returns and resolves to A. This is an authored tune with melody, harmony, bass, rhythm and phrase variation.

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

### Historical nine-room Rift UI and static verification

The replacement game was exercised at dev 5261 and the rebuilt static 4261 through normal DOM/keyboard actions, drag-look, and the documented deterministic step hook. Start loads the new 18 buffers and three loops. All four gain sliders, the portal sound test, master mute, Escape close/pause/resume, keyboard retry, full room restart, actual A/B placement, linked-pair stem, Space jump and landing passed. The capture was opened and inspected. No page errors were observed.

The final `node docs/rift-audio/check-portal-retry.mjs` run on rebuilt static 4261 passed explicit assertions: ordinary drag-look and movement placed A/B, walked through the linked pair, recorded one physical crossing and actual `enter`/`exit` events, and increased the cue count 3 → 5. Escape suspended the context; checkpoint retry returned to play, resumed the context, and played the respawn cue (count 5 → 6). Escape resume also returned to running. All stages retained exactly three loops and 18 loaded buffers with zero load errors; the original look preference was restored. This checks audio in the first actual room of the nine-room build; the English/physics owner separately verifies all room goals.

Integration found and resolved a UI checkpoint-pause omission and a small mixer race: `AudioContext.resume()` is asynchronous, so the respawn cue could be dropped before its state changed to running. The mixer now permits scheduling during a requested resume while rejecting all cues during an intentional pause. A dedicated browser check proves paused cues are rejected and an immediate resume+respawn is played. Source-compatible API is unchanged. Historical pre-fix artifacts remain explicitly labeled; they are superseded by the final static checks.

Final evidence: `docs/rift-audio/portal-retry-check.json` (nine observed stages, zero errors), `integrated-traversal.png` (actual game capture), `resume-race-check.json`, plus the broader settings/restart observations in `integrated-browser-check.json`. The earlier approach that missed the portal used a drifting key-held aiming helper; the final traversal uses the actual unlocked drag-look control and sidesteps the crate. No injected position, completion or world action was used as a playtest.

## Fifty-level campaign machinery extension

Eleven additional original cues are authored in `scripts/render-rift-machinery.py`. They use friction/noise textures, damped material impacts, gear pulses, motor harmonics and glass overtones. They are distinct mechanical responses rather than eleven pitched UI beeps. Their finite fade envelopes prevent stuck motor notes.

| Canonical cue | Context and character |
|---|---|
| `switch-toggle` | Double-contact click, bright lever then lower latch |
| `shutter-open` | Light sliding friction and geared release |
| `shutter-close` | Lower slide ending in a rubber/metal stop |
| `lift-motor` | 2.4-second soft motor acceleration/travel/deceleration texture |
| `lift-arrival` | Motor stop, latch contact and gentle glass arrival overtone |
| `conveyor-clutch` | Five clutch/tooth contacts with rising timbre and a low engagement body |
| `platform-move` | Longer rolling/bearing texture with spaced wheel contacts |
| `junction-rotate` | Three ratchet steps, servo friction and a final detent |
| `relay-align` | Field/focusing texture resolving into two glass overtones |
| `beam-blocked` | Brief soft grain and interrupted field pulse |
| `receiver-power` | Low charge body and a four-note harmonic opening |

`cue(name, pan)` accepts these canonical names. Aliases include switch/switchToggle, door-open/door-close, shutterOpen/shutterClose, lift/lift-start, lift-arrive/lift-stop, conveyor, platform/moving-platform, junction, relay/relay-aligned, receiver/power. Canonical names are preferable when an event has direction. Per-cue repeat guards and the eight-source cap prevent mechanical chatter. `state().recentCues` exposes the last twelve canonical names for local QA; no events are transmitted.

### One coherent score across five chapters

The new optional `setChapter(1..5, intensity=0)` and `setIntensity(0..1)` methods reuse the existing 32-bar tune and synchronized counter-arpeggio. Chapter 1 with intensity zero preserves the original base blend. Later chapters gently reveal more of the existing counter-line and tilt the upper harmonics; portal/bridge action can still raise the stem. Gains ramp over 0.8 seconds and colour over 1.4 seconds, with no source restart or new unrelated track.

| Chapter | Quiet connection-stem floor | Upper shelf at 2.4 kHz |
|---|---:|---:|
| 1 | 0 | 0 dB |
| 2 | .035 | −1 dB |
| 3 | .070 | +.5 dB |
| 4 | .105 | −.5 dB |
| 5 | .140 | +1 dB |

Intensity adds up to .18 to the stem and .8 dB to the shelf. The action/chapter/intensity sum is capped at .92. These are musical arrangement controls, not difficulty or grade selectors. The same motif, harmony, bass and ambience continue through the campaign.

### New preview and verified scope

[New 26-second machinery mix](docs/rift-audio/rift-machinery-preview.wav) ([local player](docs/rift-audio/machinery-preview.html)) includes all eleven new machines over the existing score, with the connection stem gradually emerging. The earlier portal preview remains unchanged at `rift-mixed-preview.wav`; its preserved SHA-256 is recorded in `machinery-metrics.json`.

Current runtime audio: **10,079,180 bytes**, 29 local buffers (26 action cues and three loops). Every file decodes to finite, non-silent PCM with no clipping. New preview duration is 26.000 seconds, peak −13.604 dBFS, RMS −29.026 dBFS. `campaign-decoding.json` records all file checks, and `machinery-metrics.json` records source measurements and historical preservation. Isolated strict TypeScript compilation passed.

`node docs/rift-audio/check-machinery.mjs` passed the actual current audio module in Chromium with standard autoplay policy: no pre-gesture context, 29 buffers, three loops, all eleven distinct machinery cues in the canonical event history, five chapter/intensity changes without loop restart, pause/suspend, immediate resume cue, repeated Start, mute ramp and restored defaults. No page errors or load errors occurred. The lab is a module test, not a campaign completion claim. Evidence: `machinery-browser-check.json` and inspected `machinery-browser.png`; the waveform PNG is only a non-silence aid.

Actual new-machinery events in the campaign await the lead's engine integration and will be verified separately. No subjective human audition has been claimed. No external service, payment or third-party sample was used.
