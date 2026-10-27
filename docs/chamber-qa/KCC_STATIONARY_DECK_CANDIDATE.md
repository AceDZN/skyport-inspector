# Stationary deck investigation — guarded source validated natively

Latest result: the lead integrated the guarded query-only variant and pure integrated validation passes145/145. `STATIONARY_DECK_AUDIT.md` documents the exact behavior, failed earlier variants, unchanged physical assertions and metrics-only integrated check. New-build normal-input machinery proof remains outstanding. The experiment descriptions below retain their chronological scope; persistent Fixed-at-rest remains rejected.

The frozen1nGVIpqC five-room review build is unchanged. This candidate was applied only in an isolated wrapper around the generic native lift fixture. No source-engine edits or browser play claim.

## Same-pose isolation

`seam-body-type-probe.ts/.json/.txt` first reproduces the ordinary lower-edge walking stall using the native default nudge0.0001. At exactly the same player and collider pose, the ordinary query reports zero motion and20 time-zero loading-floor hits. Changing only the stationary freight deck's rigid-body type to Fixed allows the full requested0.04m horizontal delta, one loading-floor contact and0.0001m native vertical nudge. The capsule and colliders are not relocated and neither query result is applied.

Inference: the KCC's contact response to a nearby stationary kinematic deck contributes to this stall; this is not a diagnosis based only on the reported floor hit. Current upstream source explicitly adjusts remaining movement for kinematic contact velocity. See [Rapier controller source](https://docs.rs/rapier3d/latest/src/rapier3d/control/character_controller.rs.html), `detect_grounded_status_and_apply_friction`. Upstream latest is explanatory context, not a claim that the installed JS0.21 build is byte-identical.

## Four unchanged histories

`lift-stationary-deck-type.test.ts/.txt` copies all four original generic seam scenarios and assertions unchanged. Its isolated wrapper makes a deck Fixed only when its actual per-step displacement is zero; on moving steps it restores KinematicPositionBased and the original next translation. It never moves the player or changes deck geometry, controller parameters, assertions or walking history. All4pass, including the actual interior up/down rider and the captured-pose regression. Native nudge stays default.

This is a candidate, not yet accepted engine behavior. Dynamic cargo startup/arrival, power-loss braking, arbitrary stopped rail positions, horizontal carriers, collision bounds, and registered gameplay regressions still require independent checks. The original runtime seam tests remain open until an audited integration passes them.

## Independent audit: candidate rejected for integration

The independent audit in `STATIONARY_DECK_AUDIT.md` now records all existing machinery8/optics4 passing, strict active vertical/horizontal jump detachment passing, and four new cargo bounds failing. Actual oriented cube penetration reaches0.0528–0.0828m versus about0.0006m for the baseline loose histories. Native/current/next deck positions agree with planned positions; the worst loose failures occur during initial Fixed dwell before travel. Calling type setters only on transitions and separately skipping the stationary kinematic setter both retain identical failing maxima. Original seam4 pass under transition-only treatment, but that does not compensate for the cargo regression. Runtime integration remains blocked; all tests are isolated and all failed evidence is retained.

## Independent follow-up

Persistent Fixed-at-rest is rejected: four added cargo histories sink/tilt by0.0528–0.0828m where baseline stays below1mm. Transition-only setters and skipping stationary kinematic target calls do not remove that regression. No runtime integration was made.

Temporary Fixed only during the character movement query removes the friction stall while leaving collision geometry in the native query. A first variant reset residual native velocity on arrival/brake and was rejected by exact-state checks. The guarded variant changes only a carrier whose actual planned delta and native linear/angular velocities are already zero; first-stop residual-velocity frames use the baseline query. Original native types are restored in finally before held queries or physics. Its first9 tests pass with all prior physical bounds, exact current/next/velocity invariants and original seam histories unchanged. Loose cargo penetration remains0.00062–0.00070m. Full independent audit remains pending until its log completes.
