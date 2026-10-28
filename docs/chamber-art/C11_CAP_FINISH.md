# C11 optical cradle · bounded source finish

Status: SOURCE ONLY. The immutable served35-room build was not rebuilt or changed. No browser/GPU was launched for this pass. The proposed appearance still needs a frozen-build actual capture; material values and CPU geometry checks are not visual acceptance.

## Actual basis

Inspected Root's real `docs/chamber-qa/thirty-five-gpu/run/002-11-loaded-model-from-spawn.png` and `003-11-live-owned-lens-three-quarter.png`. The latter visibly supports meaningful functional reuse of the owned Tripo optical insert: its irregular rim and dark surround frame the live red aperture, and the beam meets its centre. Most of the imported body is hidden by broad, nearly black cradle caps. Spawn002 identifies the emitter's role but does not show the front imported-body silhouette. This is narrow optical-insert acceptance, not a full-body hero/target-parity or all-angle fit claim.

The previously inspected `docs/chamber-targets/laser-lift-target.png` / final-v2 planning family remains the construction reference. No new image or model generation was used. The source GLB, its pose, crop and real optics function remain unchanged.

## Exact source change

Only `src/chamber-scene.ts` changed at `ownedProjectorCradle` and its active material cleanup. Four front skin pieces use a dedicated non-emissive rough service finish: sRGB `#8a938e`, roughness.72, metalness.14, reusing the existing subtle wall normal map at.10 strength. Side/top/bottom skins retain their existing machine finish; the back remains graphite. This gives the front a diffuse material contribution instead of relying mainly on reflection. Actual brightness must still be checked in game.

The front skins end4mm behind the old pylon front plane. Four thin aluminum reveal strips end.5mm behind that same plane, leaving3.5mm of real depth separation from the skins. They stay outside the unchanged.42m-wide opening, whose local vertical limits remain−.30 to+.29 relative to the optical body. Existing rounded edges remain; no front plane is coplanar with its trim. Every piece remains inside the original native housing bounds, including the trim. No collider, level fixture, host, proxy, portal aperture, beam pose, interaction point, circuit, lamp state, global light, white eligibility or cargo/device geometry changed.

The pass adds one local material and four small mesh pieces in the loaded C11 cradle only. The material is disposed and removed from the owned set on active model cleanup, alongside existing geometry cleanup. Loading/failure fallback and late-load invalidation remain. The actual imported lens retains its native state-driven masked response. Root's AA constructor option and `renderDiagnostics` block are byte-for-byte preserved.

## Source freeze and checks

Before editing, saved the exact current source to `work/art/source-snapshots/chamber-scene-before-c11-cap-finish-2f6889e2.ts`:100,200B, SHA-256 `2f6889e26ffa659f42a5902499c81b21afbe38fc0139af83a8509382aea448b7`. `C11_CAP_FINISH_BASELINE.diff` records Root's already-existing AA/diagnostics additions relative to43e0; it is a preservation record, not a patch to reapply. The proposed own diff was saved before application.

New frozen source:101,256B, SHA-256 `ce6905b0170eb1a54fc726507c175987d6f01fb4f201e9ea788d3dc59bc2f4f8`. Snapshot: `work/art/source-snapshots/chamber-scene-c11-cap-finish-ce6905b0.ts`. The applied own delta is `C11_CAP_FINISH_SOURCE.diff`; the source record is `C11_CAP_FINISH_SOURCE.json`.

Passed `tsc --noEmit`. The focused CPU cap probe checks all skin/trim bounds against the original pylon, precise front separation, five clear aperture rays, local material disposal, unchanged blueprint, Root AA/diagnostics and hero/cue blocks. The existing actual-GLTF CPU probe also passes the unchanged asset hash, exact lens/native pose, fitted geometry, shader-mask insertion, active cleanup, late discard and failure fallback. That probe uses a fake bitmap decoder and proves no browser shader/pixel result. No broad gameplay test or new route proof is claimed for a material-only pass.

Next actual review should repeat003 at the same ordinary input angle, then a short offset view. Accept only if the front reads as mid-value service metal, the irregular imported rim stays visible, the reveal has no sparkle/z-fight, and the beam/lens/receiver behaviour and cleanup remain correct. The source pass must not be described as a screenshot improvement until that review.

## C25 actual013 inspection · queued opportunities only

Also inspected real `docs/chamber-qa/thirty-five-gpu/run/013-25-close-linked-view-before-entry.png` and re-viewed the already-inspected `docs/core-levels/targets/references/chamber-25-target.png`. The actual glass, original cargo, stair route and carrier are legible. The far full-height wall still reads as a large dark rectangle of similarly weighted ribbed/smooth tiles; ceiling frames and service wall share a narrow dark range. The stair risers and carrier fascia have little finish separation from that wall. This remains visibly simpler/flatter than the reference's framed freight opening, localized warm threshold gradients, distinct plinth material and controlled edge highlights. The generated target is architecture guidance, not proof that its pictured rails or dimensions belong in the native room.

For a later separately reviewed pass, use the real freight/header mass as the main compositional boundary; group existing nonportal wall infill into two quieter material zones rather than another repeated all-wall grid. Reserve graphite for existing frame/recess boundaries. Add restrained edge treatment to the actual stair/carrier fascia within its bounds and consider a local threshold wash only from an authored roof/header, with the same visibility/clearance limits already used elsewhere. Preserve all white host cells exactly. Do not copy target handrails, invent a guideway, fill a recovery void, add non-solid walk obstacles, new controls or answer labels. No C25 source change was made in this pass.
