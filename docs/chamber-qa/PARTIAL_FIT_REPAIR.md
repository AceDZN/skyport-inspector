# Partial-entry fit-loss repair

**Preserved baseline: fails. Integrated repair: 1/1 strict route passes; affected ceiling/aperture controls: 8/8 pass.** This is a native source regression from the actual authored C16 spawn, not browser play or earned progression. No browser, build or runtime source edit was made by QA.

## Counterexample and repair evidence

The test follows the unchanged original C16 `.9` shallow-floor portal route: walk from the authored spawn to the lip, aim and place the real linked floor/wall pair, then hold ordinary W/Space for four seconds at 120 Hz. At `t=3.991667`, both sources produce the identical candidate capsule pose `[-4.943900,-2.874926,.162275]`. The source still fits, but its transformed upright wall destination does not. The capsule centre remains `.075074 m` in front of the source plane while the leading portion is already inside the host.

| Measurement | Pre-fix source | Integrated repair |
|---|---|---|
| Four-second terminal centre | `[-4.943616,-2.844058,-1.677725]` | `[-4.943096,-21.135344,-11.704902]` |
| Actual grounded support | Reports shallow floor while feet are `-3.694058`, **.694058 m inside** floor top `-3` | Real recovery basin top `-22`; feet `-21.985344`, normal native clearance |
| Crossings before recovery | 0 | 0 |
| Maximum native/proxy disagreement | 0 | `.0000001964 m` over the entire recovery route |
| Recovery | Blocked by strict penetration assertion | Actual bottom opening → basin floor → visible E on RETURN → real lift arrival → observation deck |
| Legitimate source recenter | Not reached | Re-place same shallow portal at Z3.1, ordinary fall crosses once at `11.818629 m/s` before and after; lands on real lower gallery |
| Resets / completion assignment | 0 / none | 0 / none |

The repaired capsule reaches the basin through the genuine bottom opening during the same unchanged four-second movement history. The recovery lift's actual E event occurs at `12.500 s`; arrival is `30.817 s`. Recentered entry occurs at `34.750 s`, with actual full upright destination fit, and the lower floor landing at `36.525 s`. The lower floor is a legitimate physical result under the unchanged base mission; the test correctly requires no campaign completion from it.

The test's only wrapper observes `cross()` immediately before the original method executes. It forwards the original arguments/result unchanged and writes telemetry only. Post-step inspection cannot require an invalid pose to remain visible after a successful rollback. The first post-fix run therefore stopped on that observational precondition, even though its terminal support was already safe. `partial-fit-fixed.txt` preserves this diagnostic failure. The observer correction changes no motion, physical bound or recovery assertion; the final same test still reproduces the baseline penetration exactly.

All subsequent motion uses ordinary step input, camera aim, physically ray-clear eligible portal placement and the real E dispatcher. There are no body/velocity, machine, goal, history, save or reset assignments. Native rays do not prove decorative visibility. No additional wall→floor matrix was run: this focused contract addresses the exact reported floor→wall partial-entry failure; the prior centered/rotated controls were repeated separately.

## Reproduction and identity

| Input | SHA-256 |
|---|---|
| Original baseline `world.ts` | `e8399a5b58db2aca5f1d54ad5c4ee07ee2906f1759f30d1679a9395887b94f7a` |
| Executed baseline snapshot; import paths rewritten only | `42fa6e21021fd2399ca50c77efc7c8e5ee2172114a62ddf571ddef38925ffa2a` |
| Repaired `world.ts` | `5ad2bd6986878a455f8cd30ac5cddfeccbf26fa64e62b569d24b8ce6753b7816` |
| Final partial-entry contract | `f4dd208a872948fc4a18310fafb51935f334555b12ddb35783cb42ee3787d5f2` |

Run serially from the repository root:

```sh
RIFT_PARTIAL_WORLD_SOURCE=/Users/acedzn/dev/AceDZN-exp/skyport-inspector/work/chamber-qa/partial-fit-baseline/world.ts RIFT_PARTIAL_RUN=baseline-observed npx tsx --test --test-concurrency=1 tests/core-partial-fit-loss.test.ts
RIFT_PARTIAL_RUN=fixed-observed npx tsx --test --test-concurrency=1 tests/core-partial-fit-loss.test.ts
RIFT_CONTACT_FIT_RUN=partial-guard npx tsx --test --test-concurrency=1 tests/core-ceiling-exit-fit.test.ts
```

Logs: [baseline](partial-fit-baseline-observed.txt), [fixed](partial-fit-fixed-observed.txt), [affected controls](contact-fit-partial-guard.txt). Full positions, current/next native poses, real contact normals, portal fits and events are in [baseline-observed/](partial-fit/baseline-observed/) and [fixed-observed/](partial-fit/fixed-observed/). The earlier unwrapped baseline and first fixed diagnostic logs remain intact. Snapshot provenance is [partial-fit-baseline-source.json](partial-fit-baseline-source.json).

All native processes exited before the slot was explicitly released to the parent. Broader affected integration, browser routes and later-room geometry acceptance remain separate.
