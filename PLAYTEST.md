# Current Rapier core: affected five-chamber repair verified

The recorded intended-route1→5 pass remains valid on its original build. The later no-portal ACCESS trap in Chamber4 was repaired and independently retested on frozen1nG:77 realtime UI commands verify blocked no-portal sprint/jump, two resets and the intended portal/cube/button/exit recovery, with zero command/page/console errors. The replay imports only a genuinely earned three-room profile and preserves the new earned4 export. The unfinished carrier seam remains separate and open.

Fresh public-root intended-route1→5 passed on one frozen build, one new browser/save,194commands and zero command/page/console errors. The128.52s continuous H264 recording and independent reports are in [the current five-chamber report](docs/chamber-qa/FIVE_CHAMBERS.md). Same-world third-room meaning-change/recovery and save provenance also passed. The repaired registered source now passes84 physics/interaction and29 save/progression contracts (113total), after restoring native player nudge to close a traced vertical-jitter/held-velocity regression. The unfinished four-case carrier-seam suite remains separately open and is excluded. Direct test setup is never counted as a public-input win.

This is an early batch, not the complete fifty-level request. The current report records the corrected settings-audio retest and remaining platform limits. All earlier desk, first Rift and50-layout factory results below are historical and do not verify the rebuilt core.

---

# Historical first Rift prototype log

Active replacement27 October2026. All desk playtest results are historical and do not verify this game. New scripts/captures/results belong in docs/rift-qa.

First-room physical proof is pending: real aimed portal pair, both crossing directions, carried/loose crate transport, pad→bridge→exit, wrong location/recovery, fall/respawn, keyboard/pointer-lock exit, touch and actual audio. No replacement browser pass is claimed yet.

## First-room integration checks in progress

Independent runner `node docs/rift-qa/first-room.mjs` uses real keyboard aim, portal placement1/2, WASD movement and E carry/drop, with the deterministic time hook; it never assigns world positions or win state. Production preview4261 avoids development hot reload.

Passed during integration: eligible near/far aimed portal placement; real small-diamond pickup; carried A→B crossing; carried reverse B→A and repeated third crossing; exact entry/exit speed conservation in world events; real behind-pad contact and bridge unfold. New captures `first-portals.png`, `first-carried-portal.png`, `first-pad-bridge.png` were inspected.

Blocker found before first full win: player is pinned atx7.72, z≈-4.96, despite behind-east bridge progress1 and correct crate active. This is the bridge’s floor minx8 minus player half-width. The horizontal collision pass treats the adjoining floor as a side wall after gravity penetration and before vertical floor correction. Reported to lead with JSON and a requested mainfloor→bridge→landing walk regression. No full-room pass or nine-room coverage is claimed until fixed and retried.

## First-room checkpoint passed

After lead fixed the adjoining-floor horizontal collision, the final `node docs/rift-qa/first-room.mjs` run on static4261 passed: real unlocked mouse-drag aim and1/2 placement; E pickup; carried A→B, reverse B→A and repeated third crossing; correct behind-pad contact; bridge unfold; normal walk across east bridge and arrival at real exit with languageGoal=true and portalMechanics=true. Then the test restarted the room, walked off an unbridged edge, observed safe fall respawn, and used R for a playable checkpoint. No page errors. Captures: first-win.png, first-retry.png; full JSON first-room-results.json.

This causal checkpoint authorized authoring the remaining eight rooms and three paired variants.101 semantic tests passed for the complete data/rubric. Full campaign/robot history/launch/paired/mistake/recovery/control verification is next; it is not implied by the first room’s pass.
