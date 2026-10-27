# Original machinery visuals — API and verification

Runtime ownership is the single new file `src/machinery-visuals.ts`. No lead-owned engine, geometry, scene, input, cargo or curriculum file was edited. The renderer reads the actual `MachineSystems` devices and never changes their state, collision or puzzle outcome.

```ts
import {MachineryVisuals} from './machinery-visuals';
const art = new MachineryVisuals(parentGroup, systems);
art.update(dt); // call after authoritative systems/world stepping
art.controlAnchors.get(deviceId); // optional live E-console world point
art.dispose(); // before replacing the room/system instance
```

Public `root` holds all class-owned visual objects. `controlAnchors` supplies actual console positions for switch, relay, lift and junction. **Lift controls/sign ride the deck:** local offset `[-width/2+.3, .9, depth/2-.2]`; the stored world Vector3 is updated in place every frame. Fixed junction/base consoles use `spec.position + spec.controlOffset` when the optional offset is supplied. The blueprint junction offset`[-1,.9,2]` aligns its rendered control/sign with the authoritative safe-hub interaction point. Without that field the original fallback is`spec.position + [-width/2-.45,.8,depth/2+.35]`. Lift controls continue to ride with their required deck-relative offset and ignore this fixed-console override. Moving ferries have a plain dock sign, without a fake interactive button.

## Implemented forms and authoritative animation

| Kind | Original geometry and visible action |
|---|---|
| Switch | Beveled cabinet/front plate, pivoted physical lever, metal shaft/rubber grip, fasteners and state lamp. Lever follows actual`on`; no correctness inference. |
| Shutter | Separate fixed rails/housing and segmented door with metal seams/safety edge. Door group copies actual`d.position`, preserving collision/travel alignment. |
| Lift | Gridded metal deck, edge details, partial guard rails, guide tracks/cables and riding console. Stop label uses actual selected stop; movement uses actual position/delta. |
| Moving platform | Gridded guarded ferry deck tracks actual movement, with visible path rails and neutral dock identity sign. |
| Conveyor | Real roller meshes, edge frame and direction arrows. Roller angular direction and arrow reversal follow actual direction vector, speed, powered circuit and controls flag. |
| Junction | Turntable collar/ring and deck extending along local+X from0 to`spec.size[0]`. Entire deck uses Three.js`rotation.y=d.angle`:π/2 points north/−Z,π points west. Fixed console remains outside the rotating deck. |
| Relay | Handled gimbal/emitter/prism form, chosen-direction head and thin visible beam to the selected spatial receiver. If blocked, beam stops at half distance with a BLOCKED marker; this is the permitted approximate visual endpoint, not an invented exact hit point. |
| Receiver | Mechanical mount/ring/lens and neutral identity text, facing its referring relay. Only actual powered receiver/flag lights it; no mission answer is consulted. Referenced receivers lacking separate spec rows are rendered once from the actual receiver list. |

Shared ceramic, graphite, aluminum, rubber and restrained amber materials match the campaign targets. Text signs use local CanvasTexture drawing with Heebo/Arial fallback and original neutral diamond outline. Front/back sign faces are readable; no brand or commercial game graphics. Geometry/material caches are local to one class, no model/network/material loader. `dispose()` removes its root and disposes every owned unique geometry, material and texture once. Existing cargo/guide assets are untouched.

## Actual isolated browser proof

`docs/campaign-art/machinery-proof.html` is a separate visual fixture using real MachineSystems state and this actual module. **It is not gameplay, a campaign shortcut or completion evidence.** The art helper opened it in an own Chrome tab via CUA, inspected actual rendered geometry, and used its visible buttons to:

- Flip the real switch and see segmented shutter movement / belt power.
- Select MIDDLE lift stop and see the E anchor move from Y1.05 toY2.70 while the panel/sign remain on the deck.
- Turn the actual junction and reverse conveyor controls; inspect the rotating deck/roller-arrow direction.
- Aim the relay at another actual receiver and add a real Box3 occluder; observe BLOCKED state, shortened beam and no false receiver activation.
- Dispose/rebuild twice. Observed baseline remained72 GPU geometries /13 textures before and after the repeated rebuilds. Hidden objects/materials upload as they become visible, so other views ranged71–74 geometry allocations and13–14 textures. This bounded check is not a long-duration memory profile.

Captures visually reviewed: `machinery-overview.png`, `machinery-shutter-lift.png`, `machinery-relay-blocked.png`. Approximately177 visible draw calls in the ten-device overview; specific views cull many parts. These proof images intentionally use an isolated floor, not the final room architecture. The proof tab was closed afterwards to free GPU capacity for campaign QA.

TypeScript passed with the initial completed module. Later whole-project checks reported concurrent lead-owned physics.ts string-index typing errors (lines58/60 at that revision), with no machinery error. The lead was notified; no unrelated source was edited. The final whole-project TypeScript check subsequently completed successfully after those concurrent edits settled.

## Integration limits and follow-up

Lead owns exact collision/traversal, device placement, safe floors around consoles, lighting, campaign integration and real E interaction. Rendered guard rails/frames are art; add matching collision where their solidity matters. Fixed identity signs do not turn toward the player; place approach paths so their faces are readable. Receiver rear housings are intentionally dark; their functional front points toward the relay. The blocked beam endpoint is approximate until the authoritative schema supplies a hit point.

Review the integrated first-person view for each materially new family against `docs/campaign-targets/`. Isolated state/visual checks do not establish50-level solvability, full progression, player fun or learning gains. No new Tripo generation, rig job or credit spend was used.
