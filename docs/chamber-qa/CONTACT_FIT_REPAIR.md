# Ceiling and destination-aperture repair

The unchanged focused contracts reproduce **4 failures out of 8** against the preserved pre-fix source and pass **8/8** against the integrated repair. These are isolated Rapier fixture tests at 120 Hz, not browser routes, earned progress, or proof of the eventual 50-room campaign. The served DiK build was not changed by this work.

## Source identity and commands

| Input | SHA-256 |
|---|---|
| Original pre-fix `src/core/world.ts` | `74f41c1b06d498db4677e4494c2c29ef6573c782234ea690dce80cfaf435e505` |
| Executed pre-fix snapshot (imports rewritten to absolute paths only) | `0ce660610e8eaf04d3d2aabe4039f28f7fc0003a4fe5c36eb97b9cc744cb3870` |
| Repaired `src/core/world.ts` | `e8399a5b58db2aca5f1d54ad5c4ee07ee2906f1759f30d1679a9395887b94f7a` |
| Unchanged focused test source for both runs | `a5234d09355ec1bd75dc6b36ca9e9e367e2227beed53f0e0f89ad65f03cbf195` |

Run from the repository root, serially:

```sh
RIFT_CONTACT_WORLD_SOURCE=/Users/acedzn/dev/AceDZN-exp/skyport-inspector/work/chamber-qa/contact-fit-baseline/world.ts RIFT_CONTACT_FIT_RUN=baseline npx tsx --test --test-concurrency=1 tests/core-ceiling-exit-fit.test.ts > docs/chamber-qa/contact-fit-baseline.txt 2>&1
RIFT_CONTACT_FIT_RUN=fixed npx tsx --test --test-concurrency=1 tests/core-ceiling-exit-fit.test.ts > docs/chamber-qa/contact-fit-fixed.txt 2>&1
```

The first command exits 1 with the four expected counterexamples; the second exits 0. The snapshot manifest is [contact-fit-baseline-source.json](contact-fit-baseline-source.json). Raw traces, native contact normals, full snapshots and events are retained in [baseline/](contact-fit/baseline/) and [fixed/](contact-fit/fixed/).

## What the fixtures prove

| Contract | Pre-fix | Repaired telemetry |
|---|---|---|
| Jump strikes a horizontal ceiling with actual KCC normal `(0,-1,0)` | Stored upward speed remains `4.533333 m/s` | At `t=.341667`, Y=`1.334930`, stored Y speed becomes `0`. Next step Y=`1.333819`, speed=`-.133333`; all eight subsequent steps fall. |
| Ordinary jump; vertical sidewall while rising | Both pass | Normal jump remains within the unchanged `1.05–1.17 m` height bound; a vertical wall does not erase legitimate upward velocity. |
| Floor-valid capsule at local offset `+.839` maps to a wall aperture it cannot fit | Crosses once | Source remains solid, crossing count remains 0. Legitimate portal placement under the stationary capsule then permits one gravity crossing, speed `5.066667 m/s` before and after. |
| Floor-valid cube, initial yaw 45°, horizontal offset `.3` | Crosses once despite destination support overflow | Actual projected half-width is `.777817 m`; `.3 + .777817 > .915 m` permitted width. Source remains solid. Recentered portal recovers one crossing at `4.068213 m/s`, conserved. |
| Same-dt centered capsule and rotated cube | Both pass | Capsule crossing conserves `11.2 m/s`; rotated cube conserves `11.592077 m/s`. |
| Combined floor-valid corner maps outside wall clearance | Crosses once | No crossing, grounded on source floor at Y=`-2.135076`. This is a combined-corner case, not adjacent-host coverage. |

The fixtures author the initial airborne spawns. The cube's initial yaw is set once and declared as lab setup. Subsequent falls, contacts and recoveries use `step()` and eligible `place()` calls; no body recovery pose, velocity, completion, history or save writes occur. The required fit is the existing full projected rectangular clearance envelope with `.015 m` solver tolerance, not a claim about an exact elliptic hull.

The `geometry` value in a `first-crossing` raw trace projects the **already transferred** body through the source transform again; it is not the actual destination-pose check. The explicit test assertion immediately after crossing checks the body against the destination aperture at its real pose. Precondition geometry, snapshots and the `enter` event provide the corresponding positions and energy telemetry.

Native slot was explicitly released after both processes exited. Unchanged advanced 16/17 routes and broader affected integration remain separate follow-up checks; no 16/17 geometry change was made to satisfy these contracts.

Follow-up: the later partial-entry rollback extension and its exact authored C16 counterexample are recorded separately in [PARTIAL_FIT_REPAIR.md](PARTIAL_FIT_REPAIR.md). The original eight focused contracts also pass against that extension; the source hashes above identify this earlier repair checkpoint.
