# Enclosed-chamber audio checkpoint

The original 29 audio buffers are reused. The only new sound is continuous velocity-driven unpitched flight air, synthesized in memory with no new network asset. Default ambience filters the courtyard bed into low ventilation, suppressing bird harmonics. See `AUDIO.md` for API and physical-event mappings.

`module-check.json` is the successful stable current-module lab run: one navigation, 13 observed stages, no errors. The browser screenshot `module.png` was opened and inspected; it shows the reused machinery lab fixture, **not a new chamber gameplay capture**. The test blocks development HMR to avoid unrelated source edits resetting its instrumented nodes. `module-hmr-interrupted.json` is a preserved unsuccessful early attempt in which the meter reference was lost during concurrent development; it is not pass evidence.

Strict isolated TypeScript compilation passed. Current tests prove walking silence, velocity ramp, source reuse, landing teardown, pause/suspend, immediate resume cue, three-loop idempotence, aliases, mute and sampled headroom. They do not prove the chamber physics, event integration, completion, subjective sound quality or human listening. Actual frozen-core gameplay audio review is now documented in `CORE-PLAYBACK.md`; the module screenshot itself remains only a lab fixture.

The fifty-level prototype was stopped after direct human rejection. Its earlier evidence remains under `docs/campaign-audio/` and is historical draft only.

## Quiet Rapier profiles

`quiet-profiles.json` and `check-quiet-profiles.mjs` verify footstep gain .15/lower pitch on the contact buffer, button-release gain .24/lower pitch on the pad buffer, unchanged regular impact/press gain .88, separate event histories/repeat guards, paused silence and resumed playback. Still 29 assets. `quiet-profiles-guard-observation.json` preserves an early incorrect harness expectation about a repeat inside the .26-second guard; the corrected test passes without source changes.

## Frozen core normal-play review

Read `CORE-PLAYBACK.md` and `core-playback-summary.json` for exact bundle hashes, actual physical cue chains, live output/mute samples, true C2 airborne wind/replay completion and clearly separated unsuccessful exploratory attempts. QA's film stays silent. This review imports a legitimately earned profile and is not a clean progression proof or human subjective audition.
