# Two-chamber core QA — in progress

The rejected fifty-room prototype is historical. This report covers the new isolated Rapier core. It does **not** claim a completed fifty-level game.

## Earned public-UI outcomes

Both chambers were completed in one clean browser context at the public `http://localhost:4261/` root, using ordinary mouse drag-look, LMB/RMB portal shots, WASD and E. The actual save contains completed rooms1 and2. No body position, portal API, save unlock or completion flag was injected.

- Chamber1: two aimed portals; actual raised-alcove traversal; E pickup; cube independently crossed before the player on return; cube dropped on near button; physical door opened; player walked through it and earned the next chamber. Player crossings2, cube crossings1.
- Chamber2: actual floor/high-wall pair; W held through the fall and fling; gallery landing and upper-door exit. Entry and exit speed both11.81765m/s. No artificial launch boost or launch-used unlock check.
- Recorded candidate: `main-tCue42BN.js`, SHA256 `1a9e8e57bde9479146467e26bc229c9e268acc7abcebde92c7c4e6a79550f17b`. The action/state/audio/capture record is `run/manifest.json`; isolated earned save is `run/earned-game-only-storage.json`.
- Page errors0; console errors0. This environment rejected pointer lock, and the new entry caught the rejection and enabled drag-look. This run does not prove native pointer lock on a physical device.

The exploratory record preserves invalid shots and recovery. A shot towards the first cube from spawn was occluded; the successful high portal usedX≈5. A high-wall shot from the well lip was occluded by the receiving ledge; the successful shot was taken from the safe approach. Captures with optimistic attempt names are not counted as wins; the actual result and save are authoritative.

## Independent integration tests

`tests/core-integration.test.ts`: **20/20 pass** on current source; execution retained in `core-integration.txt`. Unit pose/obstacle setup is explicitly separate from browser completion evidence.

Coverage includes grounded spawn, raised-cube support, solid divider, aimed-offset placement and full-aperture rejection, bidirectional traversal and speed, adjacent-wall solidity for character and dynamic cube, player/cube button pressure and hovering negative, safe door closure, opaque grab rejection, genuine low-speed failure, held/released-W flings, ordinary-jump failure, fall reset, independent held crossing/reverse pullback, loose cube orientation/angular velocity, blocked-exit rigid rollback and recovery for loose/player/held bodies, and actual rotated-cube floor clearance.

The early hovering, missed-W-fling, catch-floor and blocked-rigid failures were fixed and retested. A low tilted cube overlapping the destination floor must remain blocked; the recovery test uses an ordinary upward throw before demanding a clear crossing. It does not relax the floor collision assertion.

## Remaining acceptance work

Record the short continuous known-route first-person video on the final frozen build and inspect its carry/button/door/fling frames against the targets. Complete saved-progress reload/replay, pause/help input suppression, keyboard fallback, focus/resize/fullscreen and final audio checks. Re-run affected paths after the pending safe UI/audio/door-housing fixes. Keep original raw recordings under ignored `work/chamber-qa-video/`; only compressed final H264 evidence belongs in published artifacts.
