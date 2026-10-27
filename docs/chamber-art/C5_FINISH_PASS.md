# Chamber 5 target comparison and source finish pass

Source-only follow-up, 28 October 2026. No browser/build was launched. No target-parity claim is made before the next matched capture.

## Frames actually inspected

- Generated design: `docs/chamber-targets/early/chamber-05-target.png`.
- Exact parent's frozen `1nG` frame: `/Users/acedzn/idea-plotter/reports/rift-core-parent-release3/evidence/continuation-5-004-high-return-clears-gallery-lip.png`.
- Same frozen run: `continuation-5-003-one-cube-keeps-two-button-exit-closed.png` and `continuation-5-006-both-real-cubes-maintain-two-input-exit.png` in that read-only evidence folder.
- Older CJ overview/aim frames `docs/chamber-qa/clean-five-run/025-split-height-two-button-chamber.png` and `027-high-portal-aim-clears-real-gallery-lip.png` were also inspected and are not presented as current-build evidence.

The target has warm practical gradients, legible material transitions and a strongly framed raised edge. The exact frozen game represents both retrieval routes and pressure inputs, but its lighting is flatter and cooler. The graphite retaining facade is almost black, with subtle grid lines and a faint top edge; the distant white bay reads more as a flat pale field than an illuminated architectural space. Mechanical representation does not establish visual parity.

## Renderer-only source changes

All changes are restricted to chamber 5 and leave its authored physical fixture unchanged:

- Warmer ceiling practical colours and key light, reduced cool ambient contribution, and two soft practical spot pools for the near floor and full existing upper white bay. Two short-range lights below the real gallery lip reveal the retaining face. New lights cast no additional shadow maps.
- Four full-height graphite retaining panels with subtle existing PBR surface normals, metallic vertical seams and restrained horizontal bands replace the front face's generic grid. These are thin finishes attached to the actual opaque retaining wall; no added volume pretends to be a new collider or passable opening.
- A visible warm line stays below the real raised edge. Eight narrow flat metallic inlays sit 3 mm above the existing walking surface and 10.5 cm behind its front edge. No handrail crosses the verified low-eye shot.
- Slightly smoother, less strongly embossed floor material supports practical-light gradients. White eligibility regions, cargo, projector and all other room materials/layouts remain as authored.

The full eligible high-north bay remains the actual existing white surface; no decorative portal target frame or false white host is added. Existing physical aim blockers remain authoritative. Finish planes add no aiming targets or colliders.

## Preserved shot and source checks

The source-to-high ray is `(4,1.55,13.985) → (5,4.95,-11.985)`. At the gallery's front it is approximately Y3.51 above the real Y3.4 lip. New facade trim stays at/below Y3.38; walking inlays are Y3.403 and set behind the edge.

`work/art/check-c5-finish.ts` builds the actual new finish meshes in Node and tests every world bounding box expanded by 8 cm against that ray. All are clear; no added mesh exceeds the existing edge by more than the 3 mm flat inlay bias, and no new aim target is registered. This is a source geometry check, not a replacement for the already-earned normal route or a new pixel proof. Final `tsc --noEmit` passes.

The earlier button/support correction, held-footprint renderer and control-facing/paused-refresh work remain separately snapshotted. This pass changes only `src/chamber-scene.ts`; no mechanics, English, data or progression changes. Actual warmth, highlight strength, edge readability, footprint visibility and frame cost still require the next frozen inspection.
