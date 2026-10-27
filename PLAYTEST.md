# Rift Runner independent playtest log

Active replacement27 October2026. All desk playtest results are historical and do not verify this game. New scripts/captures/results belong in docs/rift-qa.

First-room physical proof is pending: real aimed portal pair, both crossing directions, carried/loose crate transport, pad→bridge→exit, wrong location/recovery, fall/respawn, keyboard/pointer-lock exit, touch and actual audio. No replacement browser pass is claimed yet.

## First-room integration checks in progress

Independent runner `node docs/rift-qa/first-room.mjs` uses real keyboard aim, portal placement1/2, WASD movement and E carry/drop, with the deterministic time hook; it never assigns world positions or win state. Production preview4261 avoids development hot reload.

Passed during integration: eligible near/far aimed portal placement; real small-diamond pickup; carried A→B crossing; carried reverse B→A and repeated third crossing; exact entry/exit speed conservation in world events; real behind-pad contact and bridge unfold. New captures `first-portals.png`, `first-carried-portal.png`, `first-pad-bridge.png` were inspected.

Blocker found before first full win: player is pinned atx7.72, z≈-4.96, despite behind-east bridge progress1 and correct crate active. This is the bridge’s floor minx8 minus player half-width. The horizontal collision pass treats the adjoining floor as a side wall after gravity penetration and before vertical floor correction. Reported to lead with JSON and a requested mainfloor→bridge→landing walk regression. No full-room pass or nine-room coverage is claimed until fixed and retried.

## First-room checkpoint passed

After lead fixed the adjoining-floor horizontal collision, the final `node docs/rift-qa/first-room.mjs` run on static4261 passed: real unlocked mouse-drag aim and1/2 placement; E pickup; carried A→B, reverse B→A and repeated third crossing; correct behind-pad contact; bridge unfold; normal walk across east bridge and arrival at real exit with languageGoal=true and portalMechanics=true. Then the test restarted the room, walked off an unbridged edge, observed safe fall respawn, and used R for a playable checkpoint. No page errors. Captures: first-win.png, first-retry.png; full JSON first-room-results.json.

This causal checkpoint authorized authoring the remaining eight rooms and three paired variants.101 semantic tests passed for the complete data/rubric. Full campaign/robot history/launch/paired/mistake/recovery/control verification is next; it is not implied by the first room’s pass.
