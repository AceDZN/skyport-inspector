# Actual Tripo heroes · source and validation handoff

Both actual user-authorized GLBs are received and copied unchanged. The complete visible first-person gun and all loose/held hero cargo now instantiate those meshes. The old procedural gun/cube builders are removed; there is no primitive loading/failure fallback. C11's small optical insert remains a separate asset and is not used to satisfy the hero requirement.

| Asset | Runtime file | Actual local bytes / triangles / exported vertices | SHA-256 |
| --- | --- | --- | --- |
| Projector, task`5c64d549-c131-4da2-8688-38d6a22ce0a6` | `public/models/hero-projector.glb` |1,049,404 /18,780 /11,877 | `2215cbd530dd2e7b84b16dbc54efa69b9a57b38d92e19b26ef689287cfbde087` |
| Weighted energy cargo, task`b4902fc0-bae7-42b6-8452-fc9b6876ca40` | `public/models/hero-weighted-cargo.glb` |991,240 /18,933 /12,498 | `143129e2a3439cf4b074f57d9b22b9b52b8e008078e1975647a50e88fdf90053` |

Each has one mesh, one PBR material, three embedded JPEG maps and no external resource URI, animation or skin. Parent UI vertex counts11,756/12,446 are recorded separately; no explanation for the exporter difference is invented. Originals and parent cargo-intake record remain under `/Users/acedzn/Documents/Codex/2026-10-28/rift-tripo-models/`. The stable task URLs and exact source notices are beside the runtime models. Root/parent performed the user-authorized H3.1 generations:30 existing credits each,60 total, no new purchase. Art submitted no generation.

## Geometry and behaviour

Gun: the entire original18,780-triangle model is retained, with rigid source−X→view−Z/source+Y→view+Y alignment and uniform view scale. The actual recessed surface was measured by source-space triangle rays near`(-.320448,.29,0)`; source longitudinal axis is−X. Its measured body reference translation is`(-.14,-.22,0)` before the Y rotation. Whole-model recoil responds to valid and invalid shots. The real aperture vertices receive a bounded selected-channel cyan/amber emissive mask driven by current portal state/fire pulse; body PBR colour/maps remain. No fake barrel rig or primitive opaque lens overlay. C1 actual shader/PBR appearance is accepted on immutable D2; broader room/angle coverage remains pending.

Cargo: all18,933 triangles/textures are retained. The final, explicit parent instruction supersedes the earlier uniform/base-only fit. Measured axes normalize independently to canonical`[-.5,.5]`: approximately+10.6%X/+3.1%Y/~0%Z, then the existing native body half-size produces.84/1.10 cubes. This modest anisotropic fit is intentional, gives six-face contact/size-gate correspondence and must not be described as uniform proportions. Native hulls, mass, rotation, connected holding, portal transport and interactions were not altered. Source GLB bytes remain unchanged.

Every cargo ID uses the same actual template at its native size and current physical position/quaternion. Geometry/maps are shared. Body and both portal-copy material sets are independent. The existing portal matrix and projected-hull straddle logic remain; no camera-parented substitute or pad snap is introduced. Root's AA/diagnostics, C11 cap and bounded C25 finish source remain preserved.

## Preload and lifecycle

`ChamberScene.preloadHeroAssets(): Promise<void>` fetches both original GLBs, verifies exact SHA-256, parses geometry and embedded images, and resolves only when both are ready. Unexpected external resources and incomplete image decoding fail readiness. `heroAssetStatus()` returns copied loading/error/ready diagnostics; failed entries retry while valid templates stay cached. Scene construction explicitly requires both ready templates. Root gates normal setup/gameplay and supplies ordinary Hebrew loading/retry text.

The module-resident store in `src/hero-assets.ts` avoids derived-field initialization races from the base constructor's virtual build. Instances clone actual meshes synchronously. Resident geometry/maps stay outside room-owned disposal; each source/view and portal-copy material set disposes independently. Room teardown releases live handles and preserves templates for the next room; explicit final disposal requires no live users. No per-room asynchronous hero attachment can arrive in a stale room.

Existing `assetDiagnostics()` C11 top-level fields remain, with `.heroes` exposing real live mesh IDs/UUIDs/source names, source counts/hashes, normalization, native/copy instance details and measured muzzle/axis in view/world frames. The gun is a separate-FOV viewmodel; these attachment frames do not replace the native camera-reticle portal trace.

## Frozen source, build and honest limits

Runtime files only: `src/chamber-scene.ts`96,349B, SHA-256 `c99c3ffd02392d0ce40b75494fdc36a066ff1a5998eb1d3a44d83077bba65e29`; new `src/hero-assets.ts`10,441B, SHA-256 `91ab46ceb21286b69bef4d18638af54e8d68318be08c4799f96abea5ec0ec9e5`. Exact before/after snapshots and own delta are recorded in `TRIPO_HERO_SOURCE.json` /`.diff`. Runtime remains frozen.

The bounded actual-GLB CPU probe passes hashes/counts, both sizes with12 canonical resting orientations, shared geometry/maps, independent source/copy materials, portal-copy matrix, actual gun-vertex projection at wide/931×861/portrait aspects, resident reuse, room/final cleanup and503 retry. `TRIPO_HERO_ACTUAL_GLB_PROBE.json` preserves results. Its local fetch and bitmap decoder are mocked: this is not real HTTP, material/GPU/shader, gameplay, all-angle seam or pixel acceptance. The earlier pending-cargo probe is historical pre-acquisition evidence; its script is not the current combined test.

Root's single integrated `npm build` completed successfully, including full TypeScript and Vite, with unchanged source-before/after hashes. Immutable combined candidate: `/hero-repair/`, `main-D2DMbgrH.js`, SHA-256 `48cb251e7280e8ce8d6589c87e161e20f00da08d10259ac4369cc71f5d689761`; archive `work/frozen-builds/main-D2DMbgrH`. Original root35 and engineering bench were preserved. Art launched no GPU/browser/build for this combined candidate.

### Actual C1 closure · immutable D2

The C1 actual hero/repair/asset-lifecycle gate now PASSES. Primary parent record: `/Users/acedzn/idea-plotter/reports/rift-tripo-hero-repair/COMBINED-VERIFIED.json`, same immutable D2 bundle SHA above, now promoted by parent. Both actual GLB requests return200 with exact hashes, real materials decode/render, and loose/held cargo plus complete gun meshes are visible. The actual partial straddle is numerically evidenced by signed centre distance.159344635 below projected half-support.550000924, with an actual18,933-triangle Tripo copy visible; ordinary S withdrawal hides the copy. This is real browser/physics/render evidence, separate from the earlier CPU fixture.

Parent records74 actions/17 captures/0 normal command/page/console errors, trusted W-only standing crossings in both directions and held return,0 jump events/0 respawns, physical pressure/exit and reload, portrait/wide layouts, and restart with1 live instance per asset. Separate intentional503 tests for each GLB pass ordinary Retry with no World before Retry; those expected negative-test console errors are not hidden inside the zero-normal-error count. The measured backend is ANGLE Metal Apple M2 Max. A short real-RAF sample is about16.7ms mean, not a sustained campaign performance guarantee.

Art independently viewed these actual parent frames offline: `combined-evidence/007-1-actual-tripo-cargo-held.png` (textured armor body held in the actual room), `009-1-tripo-cargo-ordinary-reverse-at-seam.png` (cyan front/metal/copper model at the linked aperture after reversal), and `016-1-tripo-wide-layout.png` (actual gun, clear centre reticle and real distant cargo at wide layout). Their location is under the parent report folder above. No Art browser/GPU or screenshot fabrication was used for this inspection.

Input scope remains precise: ordinary movement/coarse look in parts of the parent run used synthetic standard DOM keyboard events with real timers/RAFs; fine mouse/clicks and explicitly trusted-key segments used Playwright UI input. It is not an all-trusted-input run. Genuine earlier earned1–25 storage was imported, so this is not a fresh-campaign completion. All-room, all-angle and full50-level acceptance remain OPEN. C11/C25 finish parity is not closed by C1 hero acceptance. No runtime, original GLB or immutable archive changed for this documentation closure.

## Acquisition recovery attribution

Art's exact completed-task CUA calls timed out; native DOM scripting was disabled and left unchanged, and AX discovery timed out. Only authorized exact export metadata/local folders were checked; no cookie/token/history extraction, debugger cancellation or duplicate generation occurred. Parent subsequently reported the lock-screen issue fixed, retried the existing export and handed off verified cargo bytes. This is parent acquisition, not an invented successful Art browser download. No signed download URL is published. The earlier orphan-policy suggestion was unproven and is not retained as a cause.
