# Enclosed chamber art direction — proposal pending targets

The current open blue-void stages do not meet the requested test-chamber quality. Preserve them as an unverified campaign draft; use the new two-room build to establish an actual enclosed environment and a reliable portal loop before expanding again.

## Construction language

Use a continuous floor slab, thick perimeter walls, a readable ceiling and actual entry/exit vestibules. Build structural graphite bays at a consistent2m rhythm. Warm ivory ceramic infill has narrow shadow joints, small bevel highlights and restrained surface variation. The lower60cm is impact-resistant dark service material, with a continuous cove line and occasional ventilation grille. Portal-eligible panels occupy deliberate full-height wall bays, inset in a contrasting frame; non-eligible metal is visually distinct without adding a label to every tile.

Ceiling soffits and lateral service ducts give scale and close the silhouette. Their bottom faces, recesses and supports must be finished, because the camera and linked portals will expose them. Door frames are solid architectural assemblies with a recessed leaf/threshold, header light and short corridor behind. The room remains spatially credible when seen backward through a portal.

The two chambers should share this construction kit while differing in physical topology: first a compact offset chamber teaching a complete pair/cargo/door loop; second a taller enclosed gallery with a genuine elevation or relay dependency. Avoid repeating a flat symmetrical court. Geometry coordinates and apertures must come from the authoritative chamber collision layout, not inferred from the mission.

## Materials and light

Use physically rough ceramic, satin graphite, brushed aluminum and rubber in a narrow value range. Generate original small roughness/normal variation locally; do not stretch a large floor grid across all surfaces. Finish panel edges with geometry rather than drawing every seam as dark flat lines. Use a few purposefully visible screws, conduits and access hatches, not uniform greeble noise.

Lighting is interior-led: long recessed cool-white ceiling fixtures and restrained warm service coves, with a soft shadowed key/fill arrangement. Remove the old strong outdoor sun and cyan sky contribution from enclosed chamber lighting. Preserve sufficient midtone contrast for the dark cargo, clear receiver state and visible portal color. Practical light meshes must correspond to actual scene lighting. Use restrained emissive accents; avoid whole-wall glow and unmotivated colored lights.

A small botanical or service observation alcove can give depth if present in the inspected target. It should be behind framed glass or integrated into a wall niche. Floor edges, barriers and ceiling junctions should explain the room's construction rather than leave floating planes against a blank backdrop.

## Original handheld instrument

Design a compact, asymmetrical split-coil instrument: rounded rectangular ceramic rear shell, open machined frame around two offset emitter rails, aluminum fasteners, graphite grip, recessed A/B status windows and a short protected lens. It must have an original silhouette. Keep it at lower right with enough depth/normal variation to read as a real held object, while preserving the reticle, nearest portal and carried module.

A separate viewmodel scene can render the instrument after the world pass with a depth clear. That keeps it out of linked portal camera renders and prevents it casting an oversized world shadow. State changes should come from actual A/B placement and current held-cargo status; no fake successful shot. Small recoil/settle and idle sway can be rigid transforms. If hands are represented by authored rigid glove geometry, document that precisely; do not claim a hand rig.

## Integration boundary

Art owns new `src/chamber-scene.ts`, original device geometry/source and art provenance. Lead owns collision/controller/chamber state, public UI, portal traversal and integration. Proposed scene API is `constructor(canvas, world)`, `setWorld(world)`, `aim()`, `update(dt)` and existing renderer/camera access, retaining the tested portal/cargo rendering path. Final API and physical dimensions wait for the inspected targets and lead's chamber specification.

Verification must compare actual game captures with the specific inspected targets, including a near device/cargo view and a linked destination view. Mark visually inspected, mechanically tested and actually completed separately. No generated frame is a gameplay screenshot; no seeded room access is earned campaign progression.
