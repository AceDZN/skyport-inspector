# Rift Runner — local model and font provenance

Active art direction: warm ceramic/concrete, graphite structure, brushed aluminum, botanical glimpses and violet/amber portal rings. The rejected ticket desk is historical. Its asset prose and unused banker lamp are under `docs/rift-art/history/`, and Git tag`skyport-desk-v1` preserves the old build. It is not the new world.

## Featured original cargo module

`public/models/cargo-module.glb` is **original locally authored game art**, not a third-party gallery download or AI/Tripo generation. The art helper modeled it in Blender5.2 after renewed Chrome gallery and My Assets search. Source: `docs/rift-art/build-cargo-module.py`; editable source: `docs/rift-art/cargo-module.blend`. The human's commissioned game may use/modify/distribute this original asset with its source. No external texture, sample, brand, commercial-game asset or input image was used.

- **Bytes:**938,480. **SHA-256:**`e1614cfda5c92d3e38846498c26bf30232869adb651693d931de2eeb8935eb5e`.
- **13,440 triangles /26,646 exported vertices**, one mesh with5 PBR material primitives: warm ceramic hull, graphite impact ribs, brushed aluminum, rubber recesses/grip and restrained amber latch. Geometry includes radiused edges, corner protectors, actual inset handles, hex fasteners, top hatch and cooling slots. It is a detailed hard-surface prop, not a permanent cube stand-in.
- Direct uncompressed GLB export, no textures or extension/decoder requirements, no skin/animation. Original export and runtime are identical; no further lossy optimization was needed. Below the approximate3MB target. Exact parsed bounds/materials are in `docs/rift-art/model-metrics.json`.
- Y-up; floor base approximately0. Almost cubic, around1 unit across. Front carry handle/latch faces+Z; the rear face has a matching handle. Normalize with loaded `Box3`, center X/Z and fit to the authoritative crate dimensions; use an ordinary box collision proxy. The detailed geometry does not establish mass or collision state. Carry/rotate/drop are rigid-body motion and require no rig.
- `docs/rift-art/cargo-module-proof.png` was rendered in Blender and visually inspected. It is an **isolated asset proof, not a gameplay screenshot**. The proof's ground/lights are not exported. Mesh materials/edge highlights remain available in the runtime renderer. The lead owns gameplay integration and its actual camera checks.

## Optional guide — own rigged automaton

`public/models/porter.glb`,2,021,208B, SHA-256`2923e98d6526c3944c081796f319402f78ab1bc1c0dbe8316be7f43671011c56`, copied earlier from the user's Clockwork Alibi original. [Own task](https://studio.tripo3d.ai/workspace/generate/de9faa4f-3704-4fc7-9519-dc5919794331).19,546 triangles /12,366 vertices,65-joint `Armature`, real clips `walk`2.333333s, `idle`15.333333s and the earlier carrying clip4.958333s. No facial rig is claimed. Use idle/walk through a real mixer; carrying clip's lowered-arm limitation is irrelevant to this optional guide.

Original prompt:

> Clockwork Alibi original clockwork railway porter, single full-body slender friendly brass-and-teal humanoid automaton, ivory faceplate, railway vest, articulated arms and sturdy boots, neutral A pose with hands empty and separated, stylized miniature mechanical theater game asset, no platform no background props no text, clean animation-ready geometry.

Earlier/current My Assets/detail checks establish this own original model and prompt. The prior acquisition log recorded Pro and a normal GLB/1k export with Tripo Mixamo rig/animation. The [official paid-output guide](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) and [Terms§5.2.2](https://www.tripo3d.ai/terms), checked27October2026, describe own paid-output use/modification/distribution rights. No new terms, purchase, upgrade or rig operation was performed. This does not license unrelated gallery work. Full earlier rights/acquisition detail is preserved in `docs/rift-art/history/Skyport-ASSETS.md`.

The guide is a friendly mechanical facility helper, never the player's body. It uses original brass/teal materials, +Z front convention, Y-up; scale from posed loaded bounds and ground feet. Embedded JPEG PBR textures; no extension decoder. Optional status is honest until integrated gameplay proves use.

## Font and runtime budget

Existing local Heebo Hebrew/Latin regular/bold WOFF2 subsets remain under `public/fonts/`,34,448B total; SIL Open Font License at `public/fonts/Heebo-LICENSE.txt`. Font hashes are retained in `docs/art/font-metrics.json`. No runtime CDN, account, service or key is required.

Active GLBs total **2,959,688B** (~2.82MiB) if the optional guide is bundled. Module alone is938,480B. Module has no GPU texture allocation; the guide's three1024² maps can use roughly16MiB decoded including mipmaps. Five module material groups mean five draws per uninstanced crate; reuse shared geometry/materials. Exact collision proxies and portal surfaces remain authored world geometry. No skeleton is needed for rigid cargo.

## Verification boundary

Search/acquisition, local file parsing and isolated proof rendering are complete. Actual replacement gameplay-camera review follows integration; earlier desk captures are not evidence for Rift Runner. No whole-game finish, physics correctness or retained learning claim follows from art inspection.

## Actual first-room art inspection

The art helper independently opened the replacement game in Chrome, placed a real A/B pair with keyboard aiming, saw the live destination view, picked up the small module usingE, captured it at normal carry distance, and released it withE. Captures: `docs/rift-art/gameplay-linked-portals.png` and `docs/rift-art/gameplay-carry.png`. Model scale, front orientation, ground contact, bumper/handle/fastener detail and carry silhouette were visually checked. `docs/rift-art/REVIEW.md` records remaining scene lighting/sparsity, portal image quality and label-size recommendations. No guide integration or full game completion is inferred from that first-room review.
