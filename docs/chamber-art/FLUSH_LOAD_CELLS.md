# Flush receiving load cells 13/15 — source implementation

Minimal renderer-only follow-up on the queued note. Runtime file: `src/chamber-scene.ts`. Native receiving cylinders, belt contact, pressure/circuit/audio logic, support query and current cue heights are untouched. No browser, build, image generation or GPU job is launched.

The renderer recognizes a pad coincident with an actual conveyor's physical top and inside its X/Z bounds. It does not inspect the English mission, a success flag or a room-number answer. These cells receive a flat red contact finish, real annular metal finish and eight embedded emissive pressure indicators. They omit buried raised-button bases and peripheral plungers; no false floor recess, snap socket or new collider is created.

| Layer | WorldY for the current cells |
| --- | ---: |
| Physical belt/cell support | 0 |
| Existing visible belt skin | .001 |
| Load-cell paint and annulus | .002 |
| Embedded indicator marks | .0028 |
| Existing native footprint patch | .004 |
| Existing native footprint outline | .007 |

The 2mm paint height is 1mm above the already-biased belt skin, avoiding a new coplanar floor/belt conflict while staying below the cue. Every material retains normal depth testing/writing; no global depth setting or cue lift is used. Pressure still changes the existing `.22`/`2` indicator intensity, and the real receiving flag still drives its original circuits/audio. Standalone raised buttons retain their fixed physical contact plane and peripheral pressure motion.

`tsc --noEmit` passes. `work/art/check-flush-loadcells.ts` consumes actual13/15 builders and checks the four real pad positions, flat geometry at the listed heights, no invented recess/plunger, preserved pressure indicator state, and enabled depth testing. Exact positions are recorded in `FLUSH_LOAD_CELLS_GEOMETRY.json`. The actual standalone-button geometry/state probe also still passes. No large/native suite was rerun for this visual-only edit.

Actual belt/cell decal flicker, pressure readability, cue visibility and physical cargo occlusion remain pending the next frozen-build inspection. The parent's current earned1–10 profile is legitimate replay access for6/8/10; actual13/15 public access additionally requires their frontier to be earned or a separately declared inspection-only arrangement. This source result does not fabricate later progress or claim unplayed rooms complete.
