# Authored control facing and paused portal refresh

Source-only follow-up on 28 October 2026. The root `1nG` review build remains unchanged. No browser or build was launched, and the held-cargo footprint is still only a proposal.

`DeviceSpec.controlFacing?: XYZ` is a renderer-only panel normal, separate from `controlOffset` and `direction`. The renderer ignores its Y component, normalizes X/Z and uses +Z for a degenerate normal. When omitted, lift controls retain their current offset-derived facing and other machine controls retain their existing direction/default. It changes no machine state, control point, collider, transport or interaction range.

Only three authored specs in `src/core/levels/permissions.ts` opt in with `[0,0,1]`:

| Draft room / device | Source-layout reason |
| --- | --- |
| 7 / transfer-deck | Both stopped alignments border the fixed hub to the south. The panel remains at offset `[-3,.9,2.2]` on the same deck; only its visual normal changes from southwest to south. |
| 8 / freight-lift | The lower boarding floor is south of the lift. The upper landing arm is north; the existing rear display remains available there. Offset `[1.3,.9,1.3]` is unchanged. |
| 10 / service-lift | The lower approach is south. Offset `[-2.2,.9,1.3]`, the upper deck bridge and both real landings remain unchanged. |

Room 9 has no override pending actual landing-view review. These decisions are based on authored floor bounds, not a new screenshot claim. The earlier EXIT_WAYFINDING proposal is historical; this source follow-up implements only the approved facing portion.

The shared `ChamberScene` now flags linked views for refresh on `resize()` and every `update(0)`. That flag is consumed by the next linked render. Thus a sole paused dirty frame cannot be discarded by the software every-third-frame throttle. Positive-delta software frames retain their cadence, and hardware frames remain unthrottled.

Validation: `tsc --noEmit` passed. `work/art/check-render-refresh.ts` exercises the actual subclass update/render hook with a mocked base render: repeated zero-delta frames, a resize followed by positive delta, ordinary software cadence and hardware cadence all pass. It creates no WebGL renderer or browser; actual portal pixels and panel composition remain for the next frozen capture.

Runtime files touched: `src/systems.ts` (optional interface field only), `src/chamber-scene.ts`, and `src/core/levels/permissions.ts` (three metadata additions only). No physics/control positions changed.
