# Frozen core live audio review

Reviewed `http://localhost:4261/` on **main-WoEqkdvS.js** and **audio-BL_bYQ5f.js**, the same frozen build used by the parent and independent QA. Main SHA256: `a7dc70e954adf2b530d8f53107b505baf16b034959df1ce7c0e75876fbe2d2ab`. Audio SHA256: `ac79a8aa77fbdd5717e2c43f911d60ba638f8835f4e42c0b2f07582e1c3ed156`. Each manifest records its fetched URLs/hashes.

This is an **audio replay inspection**, using the genuinely earned profile at `docs/chamber-qa/final-run/earned-game-only-storage.json`. Its completed 1/2 records came from QA's normal-input playthrough; importing it does not establish a fresh progression proof. This review used ordinary mouse/keyboard actions only. It did not set body, portal or completion state. Pause checks also used the documented `advanceTime` read/test hook to confirm that paused physics stays frozen.

## Observed physical sound chains

| Check | Live evidence |
|---|---|
| Walking | Grounded WASD movement emits `footstep` in world/cue histories. `airSpeed:0`, `airActive:false`. The separate source-profile check proves its .15 gain/lower pitch while normal contact remains .88. |
| Portal/cube retrieval | Normal LMB/RMB placement, actual player traversal, raised-alcove E pickup and carried return emit portal/`enter`/`pickup` cues. Player crossing count reaches 2; cube crossing count reaches 1. |
| Cube contact/button/door | Drop on the real button records `drop`, Rapier `contact`, `pad` and `shutter-open`; pad names weighted-cube and door progress reaches 1 at y=5. Re-grabbing and moving the cube away records `pickup`, `button-release`, `shutter-close`; pad clears and the physical door returns to progress 0 at y=1.5. |
| Pause/help/retry | Escape and M help suspend the context, retain three loops and stop physics under movement input. Resume returns running. Pause-menu Retry returns running and includes the real respawn cue. |
| Mute/restore | Normal settings keyboard input mutes master to 0; output samples while the context is running are exactly zero. A subsequent RTL-aware slider check restores and asserts master .8. |
| Real fling air | The exact QA-known C2 route places high-wall/floor portals and physically falls through them. The crossing records incoming/exiting speed 11.8191167, then a real gallery landing and upper-exit replay completion. Nine sampled post-crossing airborne states have flight air active; maximum sampled airSpeed is 14.0156. Grounded updates reduce speed to 0, then the air source disconnects. Final result has airActive false. |
| Stable resources | After decoding, all started playback stages retain 29 decoded buffers, three score/environment loops and no load errors. Page and console errors are empty in all review runs. |

Actual output was measured with a passive WebAudio analyser attached beside the game's destination connection. It adds no sound and changes no game gain/body/portal state. C1's sampled mixed peak was **−10.925 dBFS at master 1**; the exact C2 replay sampled **−16.148 dBFS at default master .8**. No sampled value clipped. These are short-window sample measurements, not a continuous true-peak/loudness certification or a subjective listening judgment. Full module stress/headroom checks remain separately documented.

## Evidence and preserved limits

- `core-playback-cube-cycle/manifest.json`: actual C1 retrieval, button press/open, cube removal/release/close, footsteps, pause/help/Retry, output samples. Gameplay captures 014 and 015 were opened and inspected. The extra second placement missed the button and correctly left the door closed; this run stops there and **does not count as a chamber completion**. Capture 016's queued filename says reopen, but its recorded pad/door state is closed and is not reported as a pass.
- `core-playback-fling/manifest.json`: exact master 0→.8 restoration and C2 walking with no air. An added off-centre approach made the following high-wall placement invalid; that exploratory route stops, with no fake portal or bypass. It is not the successful fling evidence.
- `core-playback-fling-final/manifest.json`: the successful **unchanged known C2 route**, flight sampling, real gallery landing and replay completion, with no blocked actions. Captures 003/006/007 were opened and inspected. The last capture's inherited filename says two-chambers-earned-complete; here it means C2 replay result with already-earned profile, not two new clean completions.
- `core-playback-headless-focus-observation/manifest.json`: an extra headless `bringToFront` tab switch did not synthesize a real native blur. It is preserved as an unsupported focus observation, **not a focus pass or proof that native blur handlers fail**. No focus event was fabricated. Current native focus behavior is outside this review's claims.
- `core-playback-summary.json`: hashes, sample counts, output peaks, mute/air observations and every blocked action across these runs. `check-core-playback.mjs` and the JSONL action files are replayable local test drivers adapted from QA's normal-input helper; QA-owned files were not edited.

QA's `docs/chamber-qa/core-gameplay.mp4` remains a **silent Playwright video**. No soundtrack was overlaid and no recorded-sound claim is made for it. These live cue states/output samples are separate evidence. No human subjective audition, music-quality rating, all-device/browser certification or campaign completion is claimed. No new audio asset, external service or paid generation was used for this review; audio source was unchanged.
