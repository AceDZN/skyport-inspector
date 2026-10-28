# Unchanged candidate: nine bounded diagnostics

Historical stage; see `../COMPARISONS_NATIVE_ROUTES.md` and `../DESIGN-16-20.md` for the final source checkpoint, later measured physical corrections and current evidence. All raw failures below remain unchanged.

The lead granted a second serial native slot after QA released12–15. The16/17 geometry and runtime were unchanged for this run. Test-only run-up uses the actual z7.65 approach apron; z8.2 would enter the open recovery-lift shaft and was corrected before execution. Command:

```sh
RIFT_MOMENTUM_RUN=advanced-unchanged RIFT_MOMENTUM_ADVANCED=1 RIFT_MOMENTUM_SHORTCUT=1 npx tsx --test --test-concurrency=1 --test-name-pattern='native comparison' tests/core-comparisons-routes.test.ts
```

**7/9 passed,2 strict exclusions failed; process exited1 and native slot was explicitly released.** Raw log and individual JSON are in `advanced-unchanged/`. No geometry/engine edits, build or browser launch followed these measurements. `source-digests.json` is explicitly a mutable-workspace, post-execution digest record rather than a frozen bundle/commit claim.

| Diagnostic | Measured result |
| --- | --- |
|16 uninterrupted running jump | First airborne crossing, no bottom land, upright fit true; lands lower, not high. Exit12.533,4.8,≈0. |
|17 uninterrupted running jump | First airborne crossing, upright fit true; contacts/grounds on the approach east glazing top3.2, centreY4.065, not far. This is a possible staging surface, not proof of safe basin recovery or global exclusion. |
|16 optimized air, no jump | First airborne crossing, upright fit true; exit10.8,8.582,.017; lands lower. |
|17 optimized air, no jump | First airborne crossing, upright fit true; same exit velocity; lands basin. |
|**16 optimized air + jump** | **CONFIRMED bypass:** first airborne crossing, no bottom land, upright fit true; lands high at(14.511,5.889,−6.127). |
|**17 optimized air + jump** | **CONFIRMED bypass:** first airborne crossing, no bottom land, upright fit true; lands far at(23.049,−3.135,5.825). |
|Floor offset−.84 | The first fall lands on the bottom; a later low-speed entry has actual localup+.639 and upright fit true. The requested−.84 anchor is **not** a measured first-airborne lower-boundary case. |
|Floor offset+.84 | First airborne crossing at actual localup+.8391; **upright wall fit false**, but traversal occurs and lands lower. Requires lead review of destination-fit contract. |
|17 ordinary near→far lane jump | This particular grounded jump did not reach far. It does not exclude a later takeoff/optimized air attempt or establish that no lane bypass exists. |

## Genuine optimized-input failures

Both failed cases use normal W/Space plus alternating camera headings. The helper chooses the legal air direction that maximizes the desired component under the actual8m/s² projection-limited input code. No body velocity/pose or machine/goal state is set. The running jump begins on the real apron with actual grounded northward speed>4.5. Both cross on their first uninterrupted fall; no intermediate bottom `land` occurs.

The common shallow entry/exit magnitude is16.32597377m/s. Actual transformed exit velocity is(12.53333333,10.46191494,−.03620615). Exit localup=.64665017 is within the actual upright wall clearance, so neither failure is an aperture-clipping artefact. No respawn occurs. The strict assertions remain failed; baseline8/8 did not establish the intended energy separation.

## Measured ceiling response

Both optimized-jump cases reach the actual13m ceiling; normal≈(0,−1,0). There are53/60 recorded ceiling contacts, with centre held near12.135 while upward velocity remains positive for about.33s. For16, consecutive real contact frames:

- t=.308333: centreY12.13450146, velocityY5.39524827.
- t=.316667: centreY12.13490391, velocityY5.26191494.
- Actual ΔY=.00040245m while velocity×dt=.04384929m.

The native controller clips upward movement; `player.vel.y` is not cleared by that ceiling contact and continues to decay under gravity. The log separately retains contact normals, velocity, actual positions and Rapier applied/remaining deltas. This confirms the source-audit concern on this native path. It is **not** authorization for this author to patch world code or a claim that lowering the ceiling alone repairs the semantic separation. Lead must settle the engine contact response, then replay the same inputs before any bounded carpentry adjustment is accepted.

## Upright output and staging follow-up

At floor-up+.8391, source floor fit allows the traversal but the read-only destination `aperture(player,exit)` returns false immediately after crossing. The complete raw flight is preserved. At−.84 the helper did not obtain the intended first-airborne offset; a stronger negative-boundary recipe must reject prior bottom lands, as the energy probes do. No weak launch or blocked/missed portal may count as an energy bound.

The C17 plain running-jump path grounds at centre(8.217,4.065,5.959), matching the approach glazing's3.2m top plus capsule support. The capsule centre is slightly outside the thin pane's x bound, so the original centre-inside support observer returnsnull; actual grounded/contact state remains retained rather than relabelled as a receiving floor. A rebound/jump from this real surface needs investigation before the far route is accepted. Likewise the ordinary near→far jump used an early takeoff; stronger edge/air attempts remain pending.

16/17 remain unregistered. Preserve all failure evidence; no speed threshold, `usedDeep` flag, pose setter or easier assertion may substitute for repaired physical routes. After engine/fixture review, rerun actual first-crossing offsets, ceiling response, run-up/optimized input, any staging surface, both ordinary destinations and non-reset recovery, then require normal-input visual/audio acceptance on a frozen build.
