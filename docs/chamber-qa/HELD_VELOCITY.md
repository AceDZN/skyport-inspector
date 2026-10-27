# Held-cube velocity investigation

Status: corrected by the engine owner and independently retested. This is a unit fixture investigation, separate from normal-input play evidence.

The wrong-side-drop browser recovery succeeded physically, but recorded a held-cube portal entry speed399.9968m/s. The clean final recording recorded3.48845m/s. No arbitrary clamp, renamed event or assertion relaxation should hide the difference.

`held-velocity-probe.ts` isolates it **without portals**. A cube is picked up in the actual first-chamber Rapier world. After settling and aiming horizontally, the actor simply walks forward. The same run is repeated after dropping, settling and picking the cube up again.

| Physics-step schedule | Peak held velocity | With/without regrab |
|---|---:|---|
| steady1/120s |4.795m/s|identical|
| alternating1/120s +0.001s|39.800m/s|identical|
| alternating1/120s +0.0001s|397.101m/s|identical|
| standalone native Rapier kinematic control, correct current-step target, same short schedule|4.801m/s|no game carry logic|

The before-fix numeric console summary is preserved in `held-velocity-before-summary.json`, and the original ordinary-input400m/s event remains in `wrong-side-recovery/manifest.json`. `held-velocity-probe.json` now contains the full after-fix positions, native rigid velocities, displacement/current-dt and native baseline. The game player's speed stays below4.81m/s. The anomaly is neither specific to regrab nor caused only by portal teleportation.

Source inspection suggests a one-step target lag: `step()` computes the character's next KCC pose, then `updateHeld()` reads the previous `player.pos`. After a normal step, the cube catches up with that preceding displacement during a tiny final remainder step. Rapier correctly derives a high kinematic velocity for the late displacement divided by the current dt. This diagnosis was an inference from source and the controlled schedule; the correction and affected ordinary-input route were then independently verified.

`tests/core-held-velocity.test.ts` retains a normal native control and two focused game regressions (with and without regrab). The game assertions require an ordinary horizontal held walk to stay below8m/s, while verifying player speed<4.81 and zero portal crossings. Their velocity bound remains unchanged after the engine correction. The combined24 integration contracts plus these3focused tests all pass27/27 in `core-physics-current.txt`.

The engine owner changed the carry target to the current proposed capsule pose and bounded carry movement by18m/s×dt. The independent probe now peaks5.9120m/s for the0.0001s remainder and4.8447m/s for the0.001s remainder, with identical regrabtrue/false results; steady stepping remains4.7950m/s. Existing wall collision, partial/reverse carry, rotated clearance and genuine fling contracts still pass. The actual public-input wrong-side-drop/regrab/carry/button/door route also passes on `main-CuBWdJum.js`, with cube entry3.48836m/s and zero browser errors (`wrong-side-recovery-current/manifest.json`). These solver-derived held velocities are not evidence of conserved free-body momentum.
