# Original chamber art and handheld instrument

The current two-chamber core uses original local procedural art in `src/chamber-scene.ts`. The device is a finished rigid viewmodel assembled from authored beveled meshes, not a gallery download, AI3D output or imported commercial-game weapon. No franchise logo, proprietary mesh, copied texture or three-prong silhouette was used. It was designed after the zero-spend gallery/My Assets search in `ASSET_SEARCH.md` and after inspection of the new targets in `docs/chamber-targets/`.

## Device construction and behavior

The original split-coil projector has a rounded rectangular ceramic rear shell, machined graphite frame, two exposed emitter rails on a recessed bed, aluminum fasteners, ventilation fins, protected lens, rubber grip, trigger guard and A/B state windows. The local shape faces camera-forward(-Z). A rigid glove/cuff is modeled around the grip; **there is no skeletal hand rig or character animation claim**. The current first-person framing crops much of that grip below the screen. It is not evidence of a fully animated player body.

The viewmodel is rendered in its own scene after the world pass and a depth clear. This keeps it out of destination/recursive portal cameras. Its compact lower-right framing was revised from actual gameplay captures so the button and reticle remain visible. Public `fire(index)` supplies a brief recoil/energy response even on rejected shots. A/B windows reflect the actual placed portals. Idle sway is a small rigid transform and respects reduced motion.

The current source is30,976bytes, SHA-256`567750c3064f565b15bb2a08608782312c1b4f47aace93c5fdcf4e7132501d16`. This hashes the complete original chamber art source, including architecture and the device; it is not a standalone GLB size. The source-only door housing correction is included. There is no external device texture/model request at runtime.

## Chamber material kit

Wall and floor base-color, roughness and normal maps are generated locally and deterministically. The two256² material sets contain six RGBA maps, about1.5MiB at base level or2MiB including full mip chains, before other scene maps. Wall material has restrained ceramic variation; the darker floor has grip detail and narrow tile joints. Graphite, aluminum, rubber, red button material and emissive practical fixtures use PBR parameters. Rounded panel geometry and instancing supply edge highlights and physical depth. This is not a photogrammetry or scanned PBR library claim.

Architecture follows the authoritative core solids and surface atlas. In Chamber1, white wall areas correspond to actual eligible surface regions, with collision-backed dark structural ribs and an ineligible dark vestibule. Chamber2 uses dark wall structure and the specifically eligible white well floor/high receiving wall. The glass divider, finished ceiling coffers, service channels, door frame/tracks and red mechanical button establish a continuous interior. Door leaves follow actual machine positions. The corrected source retracts the leaf into a vented housing and clips it above the real aperture rather than leaving a floating slab.

Hardware rendering uses rectangular ceiling lights, a shadowed key, warm low service lights and portal-colored spill. Software WebGL uses a cheaper lighting approximation and updates linked views less often. They are separate performance paths; their appearance is not claimed identical. Portal recursion/physics are lead-owned core systems.

## Reused original asset

`public/models/cargo-module.glb` is retained unchanged:938,480bytes, SHA-256`e1614cfda5c92d3e38846498c26bf30232869adb651693d931de2eeb8935eb5e`,13,440triangles and five PBR primitives. Its local Blender source and original acquisition/proof details remain in `ASSETS.md` and `docs/rift-art/`. The core scene replaces oversized prose labels with a small original diamond mark. Actual rigid-body quaternion orientation is applied to the visual. Source and connected-space copies use independent clipping materials and `portalMatrix`; their partial traversal correctness still requires the normal-input carry evidence.

No new rig, model generation, paid download, upgrade or agreement was performed for the reset art. **Tripo generations0 / credits spent0.** Built-in imagegen design targets were created by the lead and are explicitly mockups. Existing local font/model provenance is unchanged. Other games were read-only references and supplied no copied model to this reset.

## Evidence boundary

`release2/` contains the current actual first-person public-UI captures; `frozen-core/` preserves release1, with exact bundle hashes and method in its manifest. Portal placements in Chamber1 were made by normal keyboard aim/fire and player movement; those images are visual inspection, not completed puzzles. The Chamber2 capture used a separate disposable seeded access-only context and is not earned progression evidence. The lead/QA hold the independent normal-input completion/recording evidence.

`door-pocket-source-probe/` is a source-only art harness inspected after the housing correction. Its header says **UNPLAYED**. It proves the source-only visible correction, while the later public-UI release2 captures independently confirm the corrected housing. The harness is not a public-UI win or final release capture.
