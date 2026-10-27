# Exit floor wayfinding — source handoff

The shared `ChamberScene.exitFloorMarks()` renderer paints every authored exit supported by a real floor. It intersects the exit's X/Z bounds with the supporting floor bounds, uses that full footprint, and puts a double stripe across its entrance width with a small EXIT word and subdued perimeter line. The nearest full-height shutter supplies corridor orientation; a floor/spawn fallback handles an exit without a shutter.

The same warm ivory treatment applies to every exit, including alternatives. It does not indicate the requested answer. Paint is a transparent, shallow floor decal, excluded from ray targets and physics. It creates no new goal volume, point target, step, collision, or narrower route. Canvas textures and materials use the scene's existing disposal tracking.

Runtime file touched: `src/chamber-scene.ts`. No engine, fixture, control, or progression files changed. `tsc --noEmit` passed after the edit. No browser, build, or new screenshot was run for this change: actual appearance across rooms 1–15 remains pending the parent's next frozen review. Existing rooms without an authored exit floor are skipped rather than painted over an unsupported area.

## Lift panel facing proposal — deferred

The current lift panel position correctly rides at `device.position + controlOffset`. Its normal is derived from the horizontal offset vector. That can make a panel diagonal or nearly edge-on to a boarding lane even when its position is correct. The existing front and back screens reduce the problem but do not remove edge-on views.

Propose optional authored `DeviceSpec.controlFacing?: XYZ`, interpreted by the renderer as a fixed world-space horizontal outward normal. Normalize X/Z, ignore Y, and retain the current offset-derived fallback when omitted. This is separate from `controlOffset` and from `direction`, which already describes conveyor force or door-facing geometry. It should affect only the visual group; interaction position and physics stay unchanged.

For room 7's straight-X transfer carrier, `[0,0,1]` faces the fixed south hub at both stops, whereas its current offset `[-3,.9,2.2]` points southwest. The south boarding lanes in rooms 8 and 10 also suggest `[0,0,1]`, with the existing rear display readable from the opposite landing. Room 9 should receive a specific authored normal after the actual landing view is inspected. These are source-layout observations, not new visual verification.

No facing metadata or panel rotation changed in this repair checkpoint. Parent requested immediate source freeze, so this optional polish is deferred.
