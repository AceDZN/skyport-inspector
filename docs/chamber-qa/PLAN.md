# Two-chamber independent QA

Status: waiting for the frozen new build. No new-chamber win claim. The superseded fifty-level candidate has only three earned wins in its final-candidate prefix; all earlier milestone evidence remains historical.

Chamber01: the cube starts in a raised far alcove; retrieve it through linked portals and carry it back to the near-side pressure button. Ordinary walking/jumping must not bypass retrieval. The button must respond to player or cube, and remove pressure when each leaves. Then solve with ordinary mouse look, WASD, jump, left/right portal placement and E cargo handling. Observe the cube pressing the real button and the physical door opening; remove the cube and verify physical closure/reopening. Verify actual linked traversal and an earned exit without extra invisible action chores.

Chamber02: prove a necessary floor-to-wall momentum fling. First demonstrate that ordinary walking/jumping and low-speed wall-to-wall traversal cannot bridge the gap; then enter the floor portal from a real fall, preserve momentum/facing, land beyond the unreachable gap and exit. Record body position/velocity, crossing count and trajectory intermediate captures. Never set body positions or success flags as play evidence.

Controls and physics: ordinary pointer-lock mouse and optional unlocked drag, WASD/strafe/jump, LMB/RMB placement and both portal directions, view continuity, carried cube obstruction/wall/door collisions, no grabbing through solid barriers, dropped cube contact stability, blocked exits, seam re-entry, fall/retry, pause/journal input suppression, resize and saved/replay state. Test touch-equivalent controls separately if retained.

Evidence: new frozen bundle hash, clean save, per-action snapshots with audio state, gameplay and completed captures, page/console errors, all observed failures and recovery. Unit setups must be labelled separately from real-input evidence. No fifty-room completion, physical-device, subjective-fun or learning-gain claim.

## New engine boundary

REAL-PORTAL-RESET.md supersedes both custom AABB chamber attempts and the old campaign. Tests must target the isolated CoreWorld once its API is ready; old passing physics tests are historical. The old-controller elevated-floor/nearest-wall carry regressions are now2/2 passing, but do not establish the new core.

Use real clock input bursts for the primary continuous first-person recording; deterministic stepping remains useful for focused assertions and trajectory samples. Preserve the uncut recording and actual snapshots before editing any shareable clip.

Rapier reference reviewed: [official controller documentation](https://www.rapier.rs/docs/user_guides/javascript/character_controller/). The KCC computes collision-corrected translations; custom gravity and portal transitions still require explicit handling. It does not rotate the character body. Verify bounded aperture filtering rather than disabling whole walls. [Official rigid-body documentation](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/) recommends physical velocity/force motion for dynamic bodies rather than repeatedly teleporting them; held-cube support needs collision-aware control.
