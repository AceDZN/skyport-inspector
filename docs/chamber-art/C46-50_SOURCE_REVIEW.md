# C46–50 architecture and readability review

Status: offline source and fixture review. This is not a gameplay, native-route or actual-render acceptance receipt. Default accepted D2, its GLBs and all served/static builds are unchanged by this review. No browser, GPU, compiler, build or native job ran for this handoff. The approved font/floor and slab changes below were implemented; a later approved source-only support patch is recorded in the final addendum. Data-coordinate corrections belong to QA/Audio.

## Evidence and family references

Reviewed `src/core/levels/reported-46-48.ts`, `reported-49-50.ts`, their actual fixture coordinates and the corresponding generic rendering methods in `src/chamber-scene.ts`. C48 arrived during the review and is included here. Re-viewed the existing inspected twin-shaft v2, two-height optics C20 and transfer C07 targets; reused the existing C19 size/partition and C25 service-freight inspection records. Those targets establish construction/material language; their illustrated railings, optical poses and hero props are not authoritative runtime geometry. The current actual Tripo gun/cargo remain authoritative.

Parent actual D2 images also establish the cropped-label defect in C33 POWERED EXIT and C35 CONTROL GALLERY: `reports/rift-core-parent-release8/continuation33-evidence/005-33-supported-powered-gallery.png` and `015-35-actual-control-gallery-with-both-supplies.png` in the read-only Idea Plotter repo. The capstone findings otherwise concern source geometry, not observed pixels.

## Approved source changes, frozen

### Blueprint marks and floor orientation

Immutable intermediate Scene SHA `a4c67e035fcc57c6aa38f5239ef4a9ed292b4d9aca2dab9380fe0ea20b00f423` (97,132B) is preserved in `work/art/source-snapshots/chamber-scene-font-floor-a4c67e03.ts`; Root copied it into the separate 45 candidate. `fittedBlueprintMark()` is used only at the `b.marks` call site. It derives the existing canvas height from width/height, budgets font height by line count, then measures every line against a 920px width budget. All inherited `label()` callers, device displays and hero code remain unchanged.

The existing C33 1.9×.25m mark makes a 1024×135px canvas; the old font220 is clipped. The helper chooses97px (actual Arial Bold ink72px). C35 2.6×.25m makes a 1024×98px canvas; the helper chooses70px (ink52px). Both are blueprint marks and therefore covered. The eight-case CPU probe includes these actual labels, capstone prose, multiline and width pressure; it also checks finite ±Y orientation. It does not establish reading distance or actual browser font pixels. See `CAPSTONE_FONT_PROBE.json` and `CAPSTONE_FONT_SOURCE.{json,diff}`.

For normal ±Y, the sign uses nonparallel in-plane up `(0,0,-1)`. QA's C46 lip labels now use centreY.004, normal+Y, Z6.7. Their Z extent6.565..6.835 lies within the actual approach floor6..8 at topY0, away from the shaft cladding front6.2375. No floating plaque or physics change was introduced.

### C46/C50 supported ceiling hardware

Final working Scene SHA `ed926005145a5d89fdabc6a7896b29bf3a257609eb6a0f2f86aaef07b1ff60aa` (100,618B), snapshot `work/art/source-snapshots/chamber-scene-capstone-hardware-ed926005.ts`. This adds only conditional46/50 slab-derived coffer/luminaire coverage, preserving the font intermediate and all existing hero/C11/C25/portal diagnostics blocks.

Named slabs: C46 `twin-shaft-ceiling`; C50 `vault-roof` and `transfer-roof`. Hardware starts .45m inside actual slab bounds and subtracts the .06m-expanded footprint of full-height opaque/glazed partitions. Disjoint clear zones prevent duplicate coverage; tiny regions are retained for support math but do not generate narrow coffer fragments. Existing material/geometry instance batches are reused, with zero new materials/textures. Captured `staticPart` instances:290 for46,541 for50; these are batched instances, not that many draw calls.

Four existing RectAreaLight slots, downward atY12.55, are reallocated to actual supported roof fixtures:

| Room | Roof | X,Z |
| --- | --- | --- |
| 46 | twin-shaft-ceiling | (3,7), (1,−6), (18.5,−6), (26.5,−6) |
| 50 | vault-roof | (1,7), (23,−6) |
| 50 | transfer-roof | (3.5,24), (8.5,36) |

The complete3.88×1.18m mounting envelope must have clear slab support, including across artificial zone splits. Clips touch the actual undersideY13; housing/lens are immediately below it. The software path remains zero area lights. The existing bounded receiving-practical selection additionally recognizes C50 `retrieval-vault`; no global light count/intensity increase. CPU fixture math passed: all four mounts per room supported, every emitted footprint clear of full-height partitions, disjoint zones, unchanged blueprint JSON and preserved font/hero/C11/C25/AA code. See `CAPSTONE_HARDWARE_SOURCE.{json,diff}` and `CAPSTONE_HARDWARE_PROBE.json`. Full compile and actual pixels remain pending Root integration.

## Data marks: fixes and remaining blockers

| Room | Concrete source finding | Smallest action/status |
| --- | --- | --- |
| 46 | South cards atZ13.975 lie behind the cladding front13.9625; east destination labels atX30 lie behind the inward cladding front29.9625. Lip labels atY−.15 were buried below the approach floor. | QA applied southZ13.94, eastX29.94 and the approved +Y floor paint atY.004/Z6.7. Text/hosts/colliders unchanged; actual readability pending. |
| 47 | Row cardsZ.625 lie behind the front.6375. A related stair header also needs its own forward plane. | QA applied rowZ.66 and stair headerZ7.26, preserving words and fixtures; actual readability pending. |
| 48 | CONTROL source lines atX0/Z13.94 overlap the usable `question-source` white host X±2.5/Y0..3.5. An actual portal visual can occupy that same plane, obscuring instructions. | Recommended west observation wall X−2.94/Z11.2/normal+X, Y2.4/1.95/1.5, unchanged width4.8. Wall innerX−3, cladding front−2.9625, so cards clear by22.5mm and fit its backed Z8.2..14.2 span. QA awaiting Root release/approval. |
| 48 | SERVICE · CROSSING atX5.96/Y3.35 is embedded in the near-dock retraction surround. Exact-text auto relocation does not run because the machine label is only CROSSING. | Final recommended mount X5.68/Y3.53/Z−4/normal−X, same2.8×.25m. Surround baseX6.012; pocket-rib frontX5.7025, leaving22.5mm clearance. Side rails atZ±2.2 are outside the card spanZ±1.4. Earlier X5.50 proposal superseded by this tighter backed mount. QA awaiting Root release. |
| 49 | Previous source/copy cards overhung jamb edges and sat very high relative to the gallery operator. | Audio's approved marks-only correction is applied and snapshotted under `docs/core-levels/reported-49-50/marks-49-layout/`. LOADING original atZ−12.8; GALLERY original on north neutral stripX9.25/Z−13.94, clear of white endingX7.5. Both report cards on east jambsX10.94, Z−12.8/−7.1, include COPY AT GALLERY heading; fixed wording preserved. Actual readability pending. |
| 50 | East source cards atX14.94/Z23.3 are backed/in front of cladding, but first groupY5.3..4.18 is several metres above a ground-level operator; .18m-high lines may require a steep reading angle. | Audio applied the Root-approved metadata-only correction: unchanged words at two backed east-wall cards, centreZ21.6/24.5, firstY2.8 with .28m line spacing (lastY1.68/1.40). See `docs/core-levels/reported-49-50/marks-50-layout/`. Actual reading-distance proof remains pending. |

## Other source concerns at the ed926005 review checkpoint

1. **Receiver visible/physical envelope disagreement (49/50).** `opticalProps()` draws a real sphere radius.34 around each authoritative receiver point; analytic beam receivers are not separate Rapier sphere colliders. The dedicated authored body proxies are substantially behind those visible heads. C49 receiver centresZ−7.5 give visiblefront−7.84, while receiver-bodyfront is−7.42: .42m discrepancy. C50 freight centreX−4/normal−X gives visiblefront−4.34 versus bodyfront−3.8: .54m. C50 archive centreZ17.3 gives visiblefront16.96 versus bodyfront17.5: .54m. A close operator/cargo may enter visible head before meeting its proxy. Data owner should align a dedicated head proxy just behind the true beam-sphere hit, or review a renderer-only envelope correction that preserves the exact ray pose; native interruption/approach routes must be rerun for a physical change. This is a source measurement, not an observed collision bug.

2. **Circuit traces need support-aware routing.** `mechanisms()` currently draws a direct Manhattan tube at padY−.122. C50 freight-store→freight-final-door runs nearX−2.65/Z19..40 atY.018, crossing the real wellZ20..36 without support. Archive-store→archive-final-door similarly crosses nearX9.35. These can look like unsupported illuminated conduits or misleading paths over the pit. Route along real roof/walls or omit unsupported sections; do not add a physical bridge. C47 flush FREIGHT pad atY0 yields traceY−.122, burying its trace below floor0. Pressure/cue support itself is unchanged and correct; this is a distinct generic trace renderer issue.

3. **C48 coffer extent is still generic.** Its actual roof centre is(2,12.2,2), size32.8×.4×24.8, enclosingX−14..18/Z−10..14. The generic centre0/halfWidth16 ceiling loop extends west/north and misses some east coverage. The approved slab helper deliberately remains scoped46/50. If actual C48 composition shows this, opt it into measured slab coverage in a separate bounded source pass, not a global fill through walls/pits.

## Machinery/route extent checks

Visible native decks continue to derive directly from `spec.size`: C48 service deck6.6×.4×4 and C50 final-bridge4×.4×10. No target-inspired rail spans a portal/flight corridor or converts a well into a walkway. C48 docking lips end .05m above a deck top0; that visible5cm step is authored physical geometry and is not claimed flush.

C48 freight console faces+X toward its lower boarding side; service-deck console faces−X toward its near bank. Fixed call posts exist at the return sides; the renderer follows actual moving position+controlOffset for lift controls. C50 archive bridge's panel offset(1.3,.9,−4), facing−Z, remains inside its10m deck; its HOME/PARK control points are(4.3,.7,27)/(10.3,.7,27). Fixed park-bridge control(12.8,1.25,24.5), facing−X, addresses the backed operator region near(11.5,.865,24.5). Recovery panels and fixed BASIN calls use actual existing machine state/targets, not fictional controls. Device display fonts already scale to their own canvas height; the blueprint font220 defect should not be asserted at that distinct call site without actual evidence.

## Acceptance boundary

C1 actual Tripo hero/loading/clip acceptance remains documented in `TRIPO_HERO_INTEGRATION.md`; this pass does not extend it to every room. Source/native receipts for late rooms do not prove reported text can be read in game, slab lighting matches a target, receiver envelopes feel correct, or the full50 campaign is complete. Required next evidence: the exact next frozen build hash, normal approach views of the corrected boards/floor paint, C46 east gallery and C50 annex roof/receiver views, live-portal white-host legibility, and ordinary controller routes. No generated raster or CPU RGB/math result substitutes for those captures.

## Final approved support-source addendum

Root subsequently approved the two smallest renderer fixes for the measured trace and C48 roof findings. Final Scene SHA `45805a6c744ab03b7e18966dfaa7b6d22f3b1c15e36cf0b97cf510dd5c46aee2` (103,301B), with immutable before snapshot `ed926005`. This supersedes the unpatched status of items2/3 above; receiver/proxy envelopes remain unchanged for later actual review.

C47/50 circuit traces now use depth-tested3.6cm paint at actual static floorTop+.004, with unsupported spans and vertical stubs omitted. The helper requires the full width to have same-height static support, excludes catch-floor heights and moving decks, merges touching supported intervals only, and insets exposed support edges. Current circuit color/material and dynamic intensity updates remain identical. All5 C47 pairs and3 C50 pairs produce one merged paint geometry each; C50's actual supported archive arm remains painted while its open-well gaps stay empty.

C48 `question-roof` now uses the same measured slab helper, full-height-partition exclusions and four actual roof fixtures/lights at(X,Z)=(0,11),(−11,−4),(2,−4),(15,−4), undersideY12/lightY11.55. Its246 hardware instances use existing batches/materials. C46/C50 retain their previous290/541 instances. Zero new materials/textures or added lights; software area-light budget remains0.

The bounded actual-blueprint/Scene BufferGeometry probe closed exit0. It checks all paint widths/planes and roof hardware support, unchanged fixture serialization, font/hero/C11/C25/AA blocks, palette and circuit-update line. Records: `FINAL_SCENE_SUPPORT.md`, `FINAL_SCENE_SUPPORT_SOURCE.{json,diff}`, `FINAL_SCENE_SUPPORT_PROBE.json`; probe script `work/art/check-final-scene-support.ts`. No full compiler/native/browser/GPU/build ran, and dist remains unchanged. Final actual pixel/route acceptance is still open.
