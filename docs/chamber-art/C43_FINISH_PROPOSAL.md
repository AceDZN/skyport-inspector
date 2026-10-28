# C43 measured finish proposal — not implemented

Before source: `45805a6c744ab03b7e18966dfaa7b6d22f3b1c15e36cf0b97cf510dd5c46aee2`,103,301B. Exact dedicated snapshot `work/art/source-snapshots/chamber-scene-before-C43-finish-45805a6c.ts`. The existing final-support snapshot, immutable45/fifty artifacts and actual GLBs remain unchanged. This document is a proposal only; no runtime edit, compiler, native, GPU, browser or build ran.

Actual evidence: parent candidate45 `050-43-actual-archive-lift-boarding.png`, with the same exact hash/provenance in `CANDIDATE45_OFFLINE_REVIEW.json`. Checkpoint player(8.022210,.865100,−5.779981), eyeY1.515100, yaw.0015626, pitch.0000145; the view faces approximately−Z toward the archive mass. The visible defect is overhead floor studs with a concentrated warm streak. The scene is an enclosed optics/lift family; retained laser-lift/reference22 targets supply its construction language, not new geometry/controls.

## Two named floor meshes only

| ID | Physical bounds | Proposed visible group materials |
| --- | --- | --- |
| negative-archive-gallery | X0..14,Y6..6.6,Z−14..−8 | +Y top: existing f.floor; −Y underside: existing f.panelQuiet; four vertical edge faces: existing f.graphite |
| negative-archive-vestibule | X6.4..9.6,Y6..6.6,Z−18.4..−13.8 | Same grouping |

Keep exact floorGeometry vertices, normals, top UVs, transform and12 box triangles. Regroup those exact indices into three material runs: top, sides, underside. Both meshes retain their original `userData.solid` and authoritative aim-target membership; no hidden/missing faces, clipping or aim-bypass change. This is not a new hull or an additional skin. Existing aluminum top-edge strips remain. All other floors, the raised negative-mezzanine, cargo, hosts and controls remain unchanged.

Budget: same2 meshes/geometries, three existing materials, zero new materials/textures. Each box changes from one material draw to three, +4 draws total. No many-prop decoration pass.

## Reallocate the existing three underside practical roles

Current generic receiving-floor selection chooses the archive gallery and archive vestibule. It produces two underside PointLights at(3.5,5.84,−8.18)/(10.5,5.84,−8.18), plus the vestibule PointLight at(8,5.84,−13.98), all warm0xffd19a,power7,range6.5. Each is only.16m below a floor underside atY6. The last is directly ahead of this actual camera and explains the centre-aligned hotspot; the attribution is source/pose reasoning and still needs a matched render after repair.

For C43 and these two selected IDs only, replace those three roles with three backed gallery-front fascia fixtures, reusing the existing warm/graphite plates and the existing landing SpotLight pathway:

| Physical mounting point | Normal | Target on actual floor/boarding area |
| --- | --- | --- |
| (3.5,6.3,−8) | +Z | (3.5,.12,−5) |
| (8,6.3,−8) | +Z | (8,.12,−4.8) |
| (10.5,6.3,−8) | +Z | (10.5,.12,−5) |

Each .60×.045m luminous plate plus its existing .05m backing allowance fits wholly in the real gallery-front fasciaY6..6.6/X0..14. The existing mounting projection remains responsible for bringing the full plate in front of the visible surface. Existing light offset places the source.16m out from the fascia, facing the actual boarding floor rather than up into the slab. Use existing warm color, power62, range9, reach3 with the current soft penumbra.72; no shadows. Cone angle is derived by the same existing landing distance/reach formula. This keeps light off the overhead close-contact surface; it is not a global exposure or white-wall brightening.

Budget: three lights remain three (Point→Spot), six fixture planes remain six, zero new materials/textures. Three non-rendering target Object3Ds are marked for the existing room-light cleanup. Current four area lights, primary key and destination washes are unchanged. No fixture is a control or a collider. No host eligibility, beam pose, pressure or lift circuit changes.

## Bounded verification if approved

CPU-only: actual named floor bounds/full plate backing; top vertices/UVs/triangles identical; complete three-group face coverage and retained solid IDs/aim targets; old/new practical count3, existing colors and cleanup tagging; exact unchanged hero/preload/portal/footprint/circuit blocks. No full compiler/native/GPU/build without Root's serialized permission.

Actual acceptance remains a later matched050 view at the recorded pose and an ordinary boarding/walk view: underside must read as service ceiling/fascia, original top finish must remain, warm gradients must spread over real boarding floor, and gun/cube/optics/white affordance must remain readable. Source numbers cannot establish that result.
