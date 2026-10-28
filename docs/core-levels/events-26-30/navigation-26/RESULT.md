# E26 second candidate: 3/4, bay return waypoint omitted

The assigned replay ran the same four cases and fully exited1. It used the documented test-only south cargo aisle and east cabinet detour. No fixture/engine/assertion/browser/build/save change occurred in this run. Raw output, per-route actual snapshots and as-run digests are preserved alongside this note; first-attempt evidence remains in `../initial-26/`.

Passed again: identical physical alternatives, requested actual A base route and requested actual B contrast route. The revised south aisle also leaves the dropped cube at approximately `(-4.9541,.6899,6.0273)` with zero linear/angular velocity, retaining centred actual MANUAL POWER pressure instead of the earlier diagonal nudge.

The wrong-B recipe failed before reaching the cabinet. It omitted the original first waypoint `(5,2)` through B's own doorway, instead aiming straight for east-aisle `(8.3,2)` from inside the B bay. Native contact correctly identified `test-east-jamb`, with grounded player `(8.2999763,.8649592,-.4948257)`, witnessZ−.2, normal approximately `(0,0,-1)`. The bay's opaque boundary is working. This was the author's navigation mistake, not an authored gap, native collision failure or reason to relax a physical assertion.

The queued recovery is now explicitly `B exit→(5,2) through B→(8.3,2)→(8.3,10)→(6.8,10) cabinet front`. It is **not replayed** by this result. Native process closed; the slot was explicitly released to lead after the four cases. Current acceptance remains3/4 until the corrected recovery actually passes.
