# Skyport local art and font provenance

Two original models from the user's already-owned Tripo outputs are bundled locally. No new models were generated for Skyport. The traveler is a friendly brass-and-teal **automaton**, rather than the human traveler depicted by the design mockup. This is a deliberate reuse choice to retain a coherent rigged character without spending credits. These files are art, not semantic truth or document text.

## Model inventory

| File | Runtime bytes | SHA-256 | Geometry / rig |
|---|---:|---|---|
| `public/models/porter.glb` | 2,021,208 | `2923e98d6526c3944c081796f319402f78ab1bc1c0dbe8316be7f43671011c56` | 19,546 triangles / 12,366 vertices; 65-joint `Armature` skin, 3 real skeletal clips |
| `public/models/lamp.glb` | 586,004 | `64d76119944d93d214640ad210e831459919834faecbb61e6265603769e186fa` | 19,450 triangles / 11,805 vertices; rigid static mesh, no rig/clips |

Total GLB transfer **2,607,212 bytes** (~2.49 MiB), below the approximate 3 MB per-model target. Embedded textures and normal/roughness-metalness maps are retained. Porter uses embedded JPEG textures and no extensions; lamp uses embedded WebP textures / `EXT_texture_webp` (supported by current browsers), with no Draco or Meshopt dependency. Exact inspected metadata is `docs/art/asset-metrics.json`. Both files retain the prior game's shipped bytes; no new lossy processing was needed.

### Automaton — prior Clockwork Alibi original

Original prompt:

> Clockwork Alibi original clockwork railway porter, single full-body slender friendly brass-and-teal humanoid automaton, ivory faceplate, railway vest, articulated arms and sturdy boots, neutral A pose with hands empty and separated, stylized miniature mechanical theater game asset, no platform no background props no text, clean animation-ready geometry.

[Own Tripo task](https://studio.tripo3d.ai/workspace/generate/de9faa4f-3704-4fc7-9519-dc5919794331). Copied read-only from `/Users/acedzn/dev/AceDZN-exp/clockwork-alibi/public/models/porter.glb`, whose ASSETS.md records original paid-account generation, normal GLB / 1k export, human-authorized public repository use and successful Tripo Mixamo rig acquisition. Current Chrome My Assets/detail verified the own model and matching prompt. The original downloaded final export and Skyport runtime hashes match.

Clips embedded in the GLB:

- `walk` — 2.333333 seconds, 195 animation channels.
- `Clockwork Alibi porter walks slowly in place while carefully ca` — 4.958333 seconds, 195 channels. Prior game's attempted carrying clip has mostly lowered arms; do not present it as precise chest-height carrying.
- `idle` — 15.333333 seconds, 195 channels.

Use `idle` while waiting and `walk` only for movement. Face is toward +Z in the original game's world convention; confirm from this game's camera. Accessor geometry bounds are x ±0.5, y approximately 0…0.9771, z ±0.1211; complete posed `Box3` bounds are required for fitting. Normalize height, center X/Z, and put the posed lowest point on the dock. Skeletal deformations use a real skin; rigidly moving a model group is not itself proof that a walking clip played.

### Banker lamp — prior Matter Customs original

Original prompt:

> classic green glass banker's desk lamp with brass base and pull chain, single object

[Own Tripo task](https://studio.tripo3d.ai/workspace/generate/047a19d7-0f27-4926-8640-736b16b2559e). Copied read-only from `/Users/acedzn/dev/AceDZN-exp/matter-customs/public/models/lamp.glb`. The previous ASSETS.md records normal UI export and processing: original 917,140 B, SHA-256 `4974537ed7948e075776e6dbe7ce644c8c3c1b993f5cda5eeb8a237d72eaf5bd`; welded/smoothed then local glTF-Transform WebP/1024 optimization to the runtime bytes above. This Skyport copy is byte-identical to that shipped optimized file. Current Chrome detail verified the own owner controls and exact prompt.

Y-up and base y=0. Bbox min `[-0.4909,0,-0.4272]`, max `[0.4909,1,0.4272]`; cord broadens the bounds. Best colored green shade and pull chain face +Z; back has a gray-green texture limitation. Point +Z toward the gameplay camera. Static lamp needs no skeleton rig. Prior Tripo detail displays 19,470 faces; post-processing runtime has 19,450 triangles.

## Rights basis

These are the user's own original prompted outputs, not unrelated discovered gallery assets. Prior acquisition logs recorded the subscribed account as Pro. On 27 October 2026 the official [commercial-use guide](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) and [Terms §5.2.2](https://www.tripo3d.ai/terms) were checked: paid users' own generated outputs carry use/modification/distribution rights. No new agreement, upgrade, subscription or purchase was accepted. This basis does not establish rights in other creators' gallery entries. Original output uniqueness is not guaranteed.

## Hebrew and English font

Heebo regular/bold Hebrew and Latin WOFF2 subsets are bundled under `public/fonts/`. Copied from the existing installed `@fontsource/heebo` package, with its SIL Open Font License at `public/fonts/Heebo-LICENSE.txt`. No runtime font CDN is required. `docs/art/font-metrics.json` records exact sizes/hashes (about 34 KiB total fonts).

## Rendering and limitations

Keep the two PBR models' original materials and coherent warm sky light; do not replace all maps with flat color. Rough order: ~39k model triangles plus original booth meshes. Three 1024² RGBA textures per model can expand to roughly 16 MiB including mipmaps, so both may occupy around 32 MiB of GPU texture storage despite their small transfer size; exact browser texture allocation depends on implementation. Shadows and pixel ratio should be capped on mobile. Rigs are real; facial animation and exact finger contact are not claimed.

Acquisition and file inspection do not establish final scene quality. The lead owns integration, actual gameplay captures and final VISUAL_REVIEW.md; art-helper camera review is recorded separately when available. No false claim is made that these are screenshots of the completed game.
