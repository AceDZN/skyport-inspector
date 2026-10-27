# Flush button contact surface — source implementation

Implemented in `src/chamber-scene.ts` only. The fixed native cylinder, pressure sensor, circuits, existing lamps and audio are unchanged. The earlier proposal and mismatch arithmetic remain in `BUTTON_SUPPORT_ALIGNMENT_REVIEW.md`.

| Visible/physical part | Plane or maximum relative to `p.y` | Typical Y for a `.14` button |
| --- | ---: | ---: |
| Native support cylinder top, radius `.96` | 0 | .140 |
| Fixed red contact disk top, radius `.83` | 0 | .140 |
| Aluminium annulus, radii `.83`–`.96` | 0 | .140 |
| Open tapered rim side top | 0 | .140 |
| Graphite base top | −.010 | .130 |
| Fixed peripheral guide tops | −.015 | .125 |
| Moving peripheral slider caps, idle | −.024 | .116 |
| Moving peripheral slider caps, pressed | −.049 | .091 |
| Native footprint patch / outline bias | +.004 / +.007 | .144 / .147 |

The `.11`-thick red disk is centred at `p.y − .055` and no longer moves through a fixed physical contact plane. The rim has a real ring top and an open tapered side, so no hidden closed aluminium cap overlaps the red contact surface. Their adjacent `.83` boundary avoids a gap in the load-bearing appearance. The original eight outer lamps remain untouched and outside the native support disc.

Four small exposed sliders at radius `1.115` move downward `.025` under actual pressure, inside fixed guides and entirely below the contact plane. They ease rapidly on ordinary updates; reduced motion and a paused dirty update use the direct state. They are visibly peripheral mechanical indicators, not additional load-bearing surfaces or colliders. Existing `.22`/`2` lamp intensity, causal circuit traces, door response and audio are preserved.

`tsc --noEmit` passes. `work/art/check-button-support.ts` calls the actual geometry builder and pressure update without WebGL. It verifies the red/ring/open-rim top planes, fixed cube-contact height during press/release, below-plane 2.5 cm slider travel, reduced-motion state and unchanged lamp intensities. No native mechanics suite was rerun for this renderer-only change.

No browser or build was launched. Static root remains the parent's frozen `1nG` replay. Actual footprint visibility, contact appearance and slider readability still require the next matched normal-input capture; this is source geometry validation only.
