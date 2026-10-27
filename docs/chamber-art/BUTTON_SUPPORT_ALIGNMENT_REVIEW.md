# Button support alignment — source review and proposed fix

Historical proposal. The approved source correction and exact current planes are recorded in `BUTTON_SUPPORT_ALIGNMENT_IMPLEMENTATION.md`; actual frozen-build inspection remains pending.

Proposal only. No runtime source, pad physics or cue depth settings changed for this review. Actual footprint capture is still required when the parent browser slot is available.

## Source finding

The native button collider in `src/core/world.ts` is a fixed cylinder with half-height `.07`, radius `.96`, and centre at `p.position.y - .07`. Its top is exactly `p.pos.y`, typically `.14` above the room floor. The support query correctly returns that physical plane.

The current `ChamberScene.mechanisms()` stack differs:

| Part | Visible top relative to `p.pos.y` | Typical absolute Y |
| --- | ---: | ---: |
| Graphite base | −.010 | .130 |
| Closed aluminium rim | +.010 | .150 |
| Red cap, idle | +.095 | .235 |
| Red cap, pressed | +.030 | .170 |
| Cue patch / outline | +.004 / +.007 | .144 / .147 |

The red cap is `.11` high, initially centred at `p.y + .04`, and moves down `.065` when pressed. Both cue layers therefore sit below the visible red surface in either state. The rim can obscure the outer portion too. This mismatch also lets a physically resting cube intersect the visible cap by 3 cm while pressed; it is an existing support/art discrepancy, not a problem to solve by lifting the whole cue.

The eight peripheral glow blocks reach `p.y + .0125`, but are centred at radius `1.018`, outside the native support disc. The clipped cue stays inside the native `.96` radius (with the query's additional small inset), so those indicators need not be raised or treated as support.

## Preferred small art-only correction

1. Keep the red disk's current radius and `.11` thickness, but centre it at `p.y - .055`, so its load-bearing top is exactly `p.y`.
2. Keep that contact disk stationary in both pressure states. Existing lamp brightness, circuit traces, door motion and audio provide pressure feedback. Optional future internal collar movement may stay below the fixed contact surface; it is unnecessary for this correction.
3. Finish the outer rim as an actual annular top at `p.y`, with inner radius about `.84` and outer radius `.96`, plus an open tapered side. This avoids placing a closed aluminium cylinder cap coplanar under the red disk. Its lower structure can overlap the current graphite base below the contact plane.

Lowering only the red rest position while retaining the current `.065` travel would create a 6.5 cm visible gap under a physically supported cube when pressed. A stationary top matches the existing fixed collider in both states. If mechanical contact-plate travel is desired later, its actual collider would also need a separately reviewed implementation; this proposal does not request that physics change.

The cue remains at its returned support plane plus the existing 4/7 mm rendering bias. It retains depth testing, native obstruction/portal suppression, height-only opacity and clipped polygon. No pad snap, goal colour or support-specific cue height is introduced.

## Actual review still needed

Inspect a normal held approach above the idle button, an off-centre clipped footprint, a real drop/pressed cube, player pressure/release and a pit-edge comparison. Confirm the red surface and physical resting height agree, the outline remains readable without looking like a correct-answer indicator, and the flush annulus does not flicker. Source arithmetic supports the correction; no pixel or normal-input claim is made here.
