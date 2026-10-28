# C4 partial portal drop: read-only review

Status: source/screenshot diagnosis only; no native, compiler, browser, runtime edit, or user-room action. Exact live geometry and build are still required before execution. Root owns user IAB inspection and production physics changes. Screenshot viewed at the original supplied temporary path; it shows the cube overlapping the lower orange opening, not its underlying native pose or build identity.

Read source hashes: World `19db676a53b8111a4220967f0a4d956b61e0c998af60d80bee61b8236afc83e1`; early fixtures `85fbe5b5357d8b3b43a9c45adccd815e297a0446960580f43cb2b8fb17159b2b`; ChamberScene `46bb5b3d01be8d920c84f3e75a9406d151e723223bc0b48c1b3aacd5d0ae98ad`. These current sources do not establish which immutable bundle the user's room runs.

## Static findings

1. `grabbableCube()` filters native cube centres by eye distance <3.1 and forward dot >.65. It never considers the mapped visible copy. ChamberScene `syncCratePieces()` explicitly renders such a clipped copy while the oriented cube intersects a portal plane. A cube whose centre crossed first can therefore be visually near the player while its native centre is in the other room and excluded before any ray check.
2. For a selected local centre, pickup occlusion uses full `activeSolids()` AABBs without aperture or connected-ray handling. The cube-half-width margin sometimes permits a centre near a visible face, so a full-host rejection is not automatic for every straddler; record the actual blocking segment and point.
3. Pickup always resets `holdMap` to identity. A future proxy-aware selection must carry its player-space→native-cube-space transform into the hold target; selecting the remote cube alone is insufficient.
4. Partial drop clears `holdMap` then assigns native cube velocity from untransformed player velocity plus forward*.5. A 90-degree wall pair can release in the player's axis rather than the cube's connected space. This is a static concern awaiting measured release telemetry, not an established cause.
5. `exitClear()` correctly treats an unheld destination cube as a solid blocker. Unreachable pickup plus blocked destination can therefore prevent both E retrieval and walking traversal without implying that exit collision should be disabled.

Existing `core-integration` partial-cross test keeps the cube held while pulling it back; it uses direct unit placement/pose setup. Loose/blocked-cube tests likewise use explicit unit setup. Held-velocity drop/regrab occurs away from portals. Low-wall actual-C1 tests carry fully through before dropping on the button. The authored C4 positive carries fully through before normal placement. None covers authored-spawn carry→centre-only crossing→drop→visible-copy E recovery.

## Proposed bounded authored C4 regression (UNEXECUTED)

Use actual authored spawn, real maintenance-button pressure and opaque ACCESS opening to ray-check the remote shot, actual source shot and normal walking pair. Retrieve the original cube using ordinary E. Approach the return portal with ordinary W until the cube naturally crosses while the player remains on the source side; retain measured oriented support and portal-plane overlap. Neutral input may brake normally; no pose, velocity, portal-array, body, clock, machine, history, goal or save assignments.

Drop with ordinary E at that real partial state. Aim at the actual visible local representation (the same portal transform used by the renderer; camera input only), and attempt ordinary E. Require real reacquisition with the correct connected carry space, then ordinary pullback/recentred traversal and actual maintenance-button/physical exit completion with the same pair. Preserve first failure. No R, Space, new portal workaround, nudge or collider exclusion is a recovery substitute.

Record every relevant step: dt/input/look; player native/proxy pose/velocity/crossings; cube native current/queued pose/quaternion/linear/angular velocity and crossing count; hold transform before/drop/regrab; both portal poses and IDs; signed plane distance/oriented supports, source and mapped-exit fits; visible local pose/reach/dot; actual pickup hint and ray obstruction; native contacts and blocked/invalid/enter/drop/pickup events. Distinguish failed visibility selection from physical fit loss and legitimate solid exit blockage.

Exact live portal coordinates, cube/player native pose and bundle should select the one bounded geometry first. A second pre-centre/other-direction case should be added only if that diagnosis requires it. This plan is not executed proof.
