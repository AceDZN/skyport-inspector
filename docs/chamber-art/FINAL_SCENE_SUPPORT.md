# Final Scene support patch — source-only freeze

Scene SHA `45805a6c744ab03b7e18966dfaa7b6d22f3b1c15e36cf0b97cf510dd5c46aee2` (103,301B). Before snapshot `ed926005` remains immutable. Exact final snapshot: `work/art/source-snapshots/chamber-scene-final-support-45805a6c.ts`. Diff and numeric receipt: `FINAL_SCENE_SUPPORT_SOURCE.diff` and `FINAL_SCENE_SUPPORT_PROBE.json`.

Only `src/chamber-scene.ts` runtime code changed. No blueprint, physical proxy, circuit, control point, host, cargo geometry, asset, portal renderer, clipping, AA or preload changes. Actual render/readability acceptance remains pending the final frozen build.

## Floor traces (C47/50 only)

The same two Manhattan legs are clipped to static floor rectangles at the actual source-pad support height. The full3.6cm paint width must fit a support rectangle; only touching intervals are merged. Exposed support endpoints are inset2.5cm. Paint is a depth-tested horizontal mesh at floorTop+.004, one merged geometry per existing circuit pair. Catch floors at a different height and moving decks are excluded. Unsupported sections and old vertical stubs are omitted. Current material colors/emissive response and circuit update code are unchanged.

The actual C47 flush FREIGHT trace is now atY.004 rather than−.122. C50 freight spans stop beforeZ20 and restart afterZ36. Archive spans also retain the genuinely supported fixed arm atZ24..26, with real gaps on either side; no visual bridge is painted over the well.

## C48 roof

The same slab helper now includes `question-roof`: actual undersideY12, X−14.4..18.4/Z−10.4..14.4, .45m inset and all full-height partition exclusions. Four existing housing/light slots at(X,Z)=(0,11),(−11,−4),(2,−4),(15,−4), lightY11.55. Existing material batches/intensity4.4; software area-light count remains0. Old generic off-centre coffer/fixture loops are skipped for48.

## CPU receipt

Actual blueprints and actual Scene helper methods were imported without constructing a World or WebGL renderer. Every emitted coffer/fixture footprint was checked against the actual clear slab union; all four mounts passed in46/48/50. Every current authored47/50 circuit pair produced one supported geometry; every paint quad has static floor support and normal+Y. Blueprint serialization remained identical. Font/hero/C11/C25/AA blocks, palette and update line remained equal to the before snapshot. The bounded probe closed exit0. No full compiler/native/browser/GPU/build ran.

| Room | Roof hardware instances | Paint pairs |
| --- | ---: | ---: |
| 46 | 290 | — |
| 47 | — | 5 |
| 48 | 246 | — |
| 50 | 541 | 3 |
