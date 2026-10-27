# Portal-aware laser prototype handoff

This is an isolated original component for the Rift Runner builder to review and integrate. It is **not in the playable game** and its fifteen passing tests are mathematical/behavioral contracts, not gameplay evidence. It was developed in the parent workspace to avoid touching the crew's active source files.

`portal-beam.ts` has no runtime dependencies. Supply metric origin/direction, portal poses, receivers and a callback that returns the nearest actual physical obstruction in the current world. It returns real-world segments for rendering and a receiver/obstacle/range/hop-limit result. The transform follows the game's `exit * Ry(pi) * inverse(entry)` convention, preserves optical travel distance across teleportation and handles wall/floor/angled portals. The geometric aperture is elliptical; back-facing rays and unpaired portals do not traverse. Every trace is stateless, so moving a cube into the path removes receiver power on the next evaluation.

Tests pass 15/15, covering direct rays, portal transport, handedness, range conservation, real obstruction, host-wall ordering, ellipse edges, back faces, unpaired portals, floor-to-wall mapping, dynamic power removal, genuinely cyclic paths, angled exits, opaque origin contact and invalid numerical inputs. Strict standalone TypeScript compilation passes.

## Integration boundary

- The lead owns runtime integration and tests. Convert the current portal `Vector3` fields to tuples. Use wall radii `.88, 1.53`; the current rendered floor portal scales these to approximately `1.144, 1.102`. If art changes the aperture, pass matching radii.
- Adapt `castObstacle` to the installed Rapier version's nearest real collision raycast. Keep portal host walls, opaque doors, glass if that fixture blocks lasers, and rotated dynamic cubes. Exclude the emitter's own collider and nonblocking sensor/cosmetic fixtures deliberately. Return the measured distance, never a fixture's named expected destination. Portal planes already lie just ahead of their wall surfaces, allowing a valid aperture to beat its host-wall hit.
- Re-evaluate from actual physical poses and current portal positions each simulation update. Receiver flags can drive the existing machine circuits. Clearing a portal, moving a blocker or losing power must clear the receiver flag promptly.
- The art owner renders each returned segment as a continuous laser with coherent endpoint effects and readable physical emitters/receivers. Do not claim the math tests prove rendering, collision integration, control interaction, audio or a complete room.
- This traces a thin optical centerline. A transported walkable bridge would additionally need finite-width clipping, actual colliders, safe rebuild/disposal, grounding/carry behavior and normal-input tests. Do not label it a finished light-bridge system.

Suggested first real chamber: an emitter cannot see a receiver behind an opaque partition; a wall portal pair redirects the beam and powers an actual door. A cube can obstruct that beam and immediately close the circuit. Follow with two visibly distinct receivers described by a concise relative clause or conditional instruction, where routing changes a real platform/door. The English and physical room still need independent authoring and Workbook provenance.

## Inspected visual target

`laser-lift-gameplay-target-v2.png` is the selected built-in-imagegen planning mockup. It uses an actual repaired-core screenshot as its style reference: original compact projector, quiet English HUD, ceramic/graphite enclosed facility, framed glass, real lift tracks, visible receiver conduit and a plainly visible UPPER EXIT plaque beside the door. Room06 is a proposed place in the campaign, not a registered or completed level. The target is not gameplay evidence.

The exact prompts and correction sequence are in `imagegen-prompts.txt`. The first generated variant incorrectly forked the near beam; a targeted correction removed that branch. The final wording is “Keep the beam on the receiver while the lift moves to the gallery.” It uses the explicit while time-clause strand from [Workbook's grade8 connectors lesson](https://english.workbook.co.il/grade-8/chapter-11/connectors-and-time-clauses), whose retrieved source snapshot is in the parent curriculum pack. The earlier until-worded image is a superseded local draft, not the selected target.

The optical source/lens alignment is illustrative and must be computed from actual emitter poses. Reuse the existing original cargo GLB rather than treating the generated cube as a newly acquired model. The same pair should power a real access doorway and lift, with a continuous walkable route onto the lift; otherwise maintaining the beam would conflict with the player's need to relocate portals. Blocking the beam must visibly remove receiver power. Actual collision, boarding, ride, safe interruption and exit still require implementation and normal-input review.

Run in this workspace:

```sh
/Users/acedzn/dev/AceDZN-exp/skyport-inspector/node_modules/.bin/tsx --test reports/rift-portal-beam-prototype/portal-beam.test.ts
```
