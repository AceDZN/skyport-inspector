# Two-chamber Rapier core QA

The two new chambers passed a clean public-root playthrough. The rejected fifty-room prototype remains a historical draft; this is not a fifty-level completion claim.

## Continuous ordinary-input proof

`final-run/manifest.json` records a fresh browser context at `http://localhost:4261/`, normal mouse drag-look, actual LMB/RMB portal shots, WASD and E. It earned both completions and exported the resulting game-only save. No body position, portal API, unlock, or completion state was injected. All assertions passed; page and console errors were zero.

- Chamber1: aimed wall portals; live destination approached on foot; raised-alcove traversal; E pickup; cube crossed independently before the player on return; cube rested on the near pressure button; physical door opened and the player walked through it. Player crossings2, cube crossings1.
- Chamber2: actual floor/high-wall pair; W held through the fall and fling; landing on the gallery across the gap; upper exit physically reached. Entry and exit speed both11.89177867m/s. No added launch energy or launch-used completion predicate.
- Frozen bundle: `main-WoEqkdvS.js`, SHA256 `a7dc70e954adf2b530d8f53107b505baf16b034959df1ce7c0e75876fbe2d2ab`. Exact loaded script hashes are in the manifest.
- `core-gameplay.mp4` is the entire uninterrupted final recording:41.84s,1280×800 H264,4,935,562bytes. This Playwright capture is **silent**; no soundtrack was added or dubbed. Actual audio states and cue events are retained separately in the manifest.
- `video-metadata.json` records original and encoded hashes. Original raw video remains under ignored `work/chamber-qa-video/`; the compressed copy is the review artifact.

The final contact sheet and captures003,005,007,013 were visually inspected. They show the live destination, visible held cube through the portal, cube/button contact and gallery landing. The front-on partial-crossing frame does not establish clipping quality from every side angle. Door traversal is shown later in the continuous recording; capture007 primarily shows the cube and button.

## Controls, support and saved progress

`control-replay/manifest.json` imports the **unaltered save genuinely earned above**. This is a normal replay and continuation check, separate from the clean progression proof.

Verified: Continue resumes chamber2; reload preserves completed1,2; chamber1 replay remains available; J/I keyboard look changes orientation; Hebrew help, pause and settings stop the player even with W held and an explicit time step; audio pauses with those overlays and resumes after retry; master gain changes0→1→.8 through native range keyboard controls; buffers load29/29 without errors; settings sound preview works; restart resets room state; R retries while retaining earned progression; standing on the button opens the door and leaving releases it; Space jumps;960×540 help remains legible and its return button visible. No page or console errors occurred.

`placement-fall-replay/manifest.json` also verifies actual door-edge and dark-rib shot rejection, an accepted aimed offset on the white wall, and walking off the approach without portals followed by an automatic safe respawn. The door-edge ray hit the dark frame; the full-aperture fit geometry is covered separately by the independent integration tests. All assertions and browser-error checks passed.

A separate ordinary-input wrong-side-drop run is retained in `wrong-side-recovery/`: the cube was left in the far alcove, the near button stayed unpressed and no completion occurred; it was picked up again, returned through the pair and used to finish the actual physical puzzle.

## Independent integration tests

`tests/core-integration.test.ts` and `tests/core-held-velocity.test.ts`: **27/27 pass** on the corrected source; combined output is `core-physics-current.txt` (the earlier24-test output remains `core-integration.txt`). Unit pose/obstacle setup is explicitly separate from browser play evidence.

Coverage includes grounded spawn, raised-cube support, solid divider, aimed-offset placement and full-aperture rejection, bidirectional traversal and conserved speed, adjacent-wall solidity for character and dynamic cube, player/cube button pressure and hovering negative, safe door closure, opaque grab rejection, genuine low-speed failure, held/released-W flings, ordinary-jump failure, fall reset, independent held crossing/reverse pullback, loose cube orientation/angular velocity, blocked-exit actual-rigid rollback and recovery for loose/player/held bodies, rotated-cube floor clearance and successful conserved fling/landing at30/60/120physics steps per second.

The hovering, missed-W-fling, catch-floor and blocked-rigid failures were fixed and retested. A low tilted cube overlapping the destination floor must remain blocked. The positive recovery uses an ordinary upward throw after obstruction removal; the exact one-cross assertion was retained.

## Open and bounded checks

The environment rejected pointer lock and correctly fell back to ordinary drag-look. Native pointer lock and OS focus cannot be claimed: native CUA reported that the Mac is locked. Headless and headed Playwright tab activation did not produce a reliable physical blur; those failed probes are preserved under `drafts/`.

The fullscreen defect was corrected and retested on `main-CuBWdJum.js`: F enters, a second F exits, F re-enters and Escape exits while pausing the puzzle. `fullscreen-retest/manifest.json` passes with no browser errors. It also confirms that the genuinely earned legacy1/2 save migrates and presents Continue3. The continuous two-chamber video retains its original earlier bundle hash; current carry recovery is separately verified below.

The held-cube399.9968m/s anomaly was independently reproduced without regrab or portals under uneven substeps, corrected by the engine owner and retested. The native mixed-step peak fell397.10→5.91m/s, while the current actual wrong-side-drop/regrab/carry/button/door route records3.48836m/s at cube entry. `HELD_VELOCITY.md`, `core-physics-current.txt` and `wrong-side-recovery-current/manifest.json` retain the diagnosis and passing evidence. The original anomalous event remains preserved and is not used as ordinary momentum evidence.

The audio checks verify actual mixer state, loaded buffers, cue events and controls; they do not claim subjective human audition. No physical-device, touchscreen or screen-reader session is claimed. The eventual authored fifty-level campaign and its clean sequential playthrough remain outstanding.

## Third chamber and next authored drafts

`LEVEL3.md` records actual chamber3 wrong-route recovery, base behind/north win and changed front/south instruction on the same world. This run legitimately imports the earned1/2 save; a separate fresh1→3 run remains planned. Direction labels were obscured in the Cu candidate and require the renderer correction before visual acceptance. Four independent fixture/circuit/contrast tests pass.

Nine native draft4/5 tests pass in `core-early-drafts.txt`, including full retrieval routes, opaque access, actual replacement pressure, two-button AND with either assignment, removal/two-on-one negatives and ordinary bypass attempts. They use definition overrides and unit portal calls; neither draft has public-input completion evidence yet.

An additional boundary probe found character/cube frame overhang accepted by the current aperture support factors; it has been reported separately with `aperture-boundary-probe.json`. It is not covered by the centered-route success claims.
