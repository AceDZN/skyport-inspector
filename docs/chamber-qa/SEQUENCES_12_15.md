# Authored12–15 native route review

**Final current-source batch:19/19 pass.** This includes17 authored-spawn geometry/route/recovery contracts and two pure authored belt delivery/reversal contracts. The tested source has receiving load cells flush atY0, shared authored belt speed3, and C15's corrected22-tread0.60m-deep/0.20m-rise return flight. No fixture or engine edit, build, browser launch, saved unlock or actor/cargo/goal/history assignment was made by QA.

The route driver uses camera aim,120Hz WASD, real native E dispatch and portal placement preceded by physical ray/front-face/full-aperture checks. Every cargo pickup targets its current real position without first pushing or assigning it. These are native source tests, not mouse/browser play or proof of curriculum mastery. Decorative glazing visibility is explicitly not inferred from native rays; the routes use off-centre white targets and still need actual visual/UI review.

## Verified paths

| Room | Actual checks |
|---|---|
|12 · Inspection Pulse|Same hardware under both instructions. Base deliberately misses a window, remains blocked by the closed leaf without reopening it from outside, waits for a real next East opening and crosses. Contrast uses the opposed West window. An actual wrong West crossing returns through the live gates and recovers to East. No jumps or resets.|
|13 · Return Belt|Actual exterior route places a linked pair through the viewing glass and enters the enclosed control booth. Base reverses with visible E before power; the powered opaque cover then rejects both the reverse ray and E. West delivery opens its physical exit. Contrast keeps East and takes the opposite exit. Wrong East delivery recovers through actual stop→cover opening→reverse→restart, with old pressure release. Cargo remains inside its real tunnel; no pickup action is used.|
|14 · Pressure to Light|Actual pickup/drop on POWER energizes the configured beam, powers ACCESS and carries the player on the real lift to Upper under maintained pressure/light. The dark offset pair still transports the player to West Inspection. A separate case allows unlit portal preplacement, then actual pressure; removing the real cube brakes the lift midrail, replacement resumes its own phase and the route completes.|
|15 · Cargo Clearance|A balanced off-centre pair really routes the low beam atX0 and the initial cargo blocks it. Cargo clearing the beam alone cannot depart before receiving pressure. Actual East and West deliveries enable loaded shuttle crossings and their far exits under continuous live conditions. A return-motion reversal removes pressure, brakes midrail, and opposite delivery resumes without a phase jump. A real missed edge falls into the basin and climbs the actual authored return flight without jump or reset.|

Four of the17 contracts compare base/contrast physical geometry and wiring. Catch recovery intentionally leaves the puzzle incomplete. Contract counts are not additional level completions or earned campaign progress. All successful native completion paths assert the actual requested exit and zero respawns.

## Preserved failures and repairs

C15's former0.30m-deep treads failed before any fixture change. A genuine fall landed at approximately[6.965,−3.535,−1.781]; entering the actual low end then pinned the capsule at[9.500,−3.027,−4.214] against `clearance-return-step-2`, with grounded=true, zero jumps/resets and unchanged KCC step height0.23/width0.25. The contact normal was approximately[0,0.688,−0.726]. `sequences-catch-first.txt` and `sequences/catch-first/15-catch-clearance-base.json` preserve this failure.

The lead authored a genuine carpentry revision: the same22 rises now have0.60m depth, beginning under the thin far-bank floor and emerging before head clearance is lost, with the high end still meeting the near bank atZ2. The test approaches the actual low end atZ−11.8 throughX7.5, thenX9.5, and climbs to near-bankZ3. Its original real-fall/grounded/no-jump/no-reset assertions remain. `sequences-catch-deep-treads.txt` records the affected pass. No KCC setting, player Y correction or shortcut replaced the stairs.

The first S14 route used a planned shooting position[5,11]; its native return shot was obstructed, and the authored emitter housing lies along that planned line. Those three first failures are retained in `sequences-plant-first.txt` and `sequences/plant-first/`. Moving only the input route viewpoint to[7,11] cleared the unchanged geometry under the same strict ray/aperture checks; all four S14 checks then passed. This is a test navigation correction, not a fixture/engine repair or relaxed assertion.

## Integrated belt and final pacing

`tests/core-belt-receivers.test.ts` instantiates each original authored definition directly and asserts that no flush geometry substitution occurred. Both real pads must haveY0. Delivery/reversal must preserve all240 of240 native pressure frames during each two-second hold, release the old receiver, and remain inside physical end stops. The earlier raised0.07m and slower1.5-speed data remain in their original directories; `BELT_RECEIVER_DIAGNOSIS.md` explains the native rim/grounded/tilt sequence.

The current speed3 pure authored lab measures peak cargo speed1.921807m/s in13 and1.928219m/s in15, maximum step approximately0.016429m at120Hz and maximum absoluteX7.800364. Both directions preserve240/240 frames and zero resets. Sampled settled arrivals include the deliberate poll and one-second settle, so they are not labelled first-contact times.

The actual S13 route event timestamps give first East pressure18.042s minus real power-on13.617s = **4.425s**. Reversal recovery gives West pressure34.158s minus restart25.825s = **8.333s**. These are observed physical pad events, not timers or completion flags. Both exits still depend on current receiving pressure.

## Evidence and remaining review

- `sequences-final-speed3.txt`: final19/19 serial native run, including affected S13 pacing paths and strict belt2.
- `sequences/final-speed3/`: complete per-route checkpoints, native contacts, events, authored belt speeds and actual carriage observations.
- `belt-receivers/integrated-speed3/`: pure authored delivery/reversal reports, pressure-frame counts and measured speed/displacement/end-stop bounds.
- Earlier scoped passes/failures remain under `pulse-first`, `booth-first`, `plant-first`, `plant-viewpoint7`, `clearance-speed3-first`, `catch-first` and `catch-deep-treads`.

Reproduction: `RIFT_SEQUENCE_RUN=final-speed3 RIFT_BELT_RUN=integrated-speed3 tsx --test --test-concurrency=1 tests/core-sequence-routes.test.ts tests/core-belt-receivers.test.ts`.

Named QA runs retain their explicit evidence directories. Ad-hoc runs without an explicit run ID now write under unique ignored `work/chamber-qa/` directories, protecting the preserved raised-pad, x0-aim and first-failure records from a later broad unit run. This final output-path housekeeping changes no native input, geometry or assertion.

All native jobs finished before the slot was explicitly released to the next parent-authorized probe. No builder browser/build was opened during the ten-room review. Actual decorative visibility, aiming ergonomics, control reading, audio, saved progression and normal-input completion for12–15 still need their own build/browser review. The final fifty-level campaign remains incomplete.
