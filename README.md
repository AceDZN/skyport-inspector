# Rift Runner · קופצים בין שערים

An original first-person portal puzzle game. The new campaign grows from two proven enclosed chambers: retrieve a rigid cube through portals, then use a real momentum fling. Chamber 3 adds two physically different button/door routes selected by a spatial instruction. Ten authored chambers are now playable. A fresh normal-input1→5 run and a separate genuine-earned5→10 continuation verify the current foundation; a fresh sequential1→50 run and the remaining40 rooms are still required.

The new core is composed around Rapier3D0.21: a capsule character controller, dynamic rigid cubes with angular motion, collision-aware holding, aperture-scoped portals and physical machinery. It does not inherit the rejected AABB controller. Existing original sound/music and appropriate art are reused.

**Current review:** [localhost4261](http://localhost:4261/). **Development:** [localhost5261/chambers.html](http://localhost:5261/chambers.html). [Ten-room evidence](docs/chamber-qa/TEN_CHAMBERS.md) binds the normal-input6→10 continuation, C7 wrong-route/stair recovery, C8 loose-cargo freight, C9 alternate cargo choice, C10 no-ride base/parking contrast and reload persistence to frozen DiK0owgl. Three initial harness assumptions are retained; no page/console errors occurred. This is separate from the earlier [128.52-second continuous fresh1→5 recording](docs/chamber-qa/five-chambers-gameplay.mp4) on CJGVY4LM and the [41.84-second two-room recording](docs/chamber-qa/core-gameplay.mp4). No fresh1→10 or completed50-room claim is made.

WASD move, mouse look, left/right mouse place portals on valid white surfaces, Space jump, E grab/drop, R safe retry, M Hebrew help, Escape pause/unlock. Drag look is available if pointer lock is unavailable. Reading pauses the puzzle.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

REAL-PORTAL-RESET.md is authoritative and supersedes the earlier campaign approach. The eventual requirement remains fifty authored levels with saved progression and no grade selector; expansion proceeds in small authored, tested batches. The Rapier campaign uses an isolated save key, preserves earned two-chamber progress with explicitly unknown old measurements, and supports Continue, unlocked replay and backed-up reset. Base and changed-instruction evidence are retained separately. `rift-campaign-50-draft-v1` preserves the rejected, unverified fifty-room draft. Its catalogue, static tests and partial prefix runs are historical source material, not shipped campaign evidence.

Targets and exact prompts: docs/chamber-targets/. Actual art/search evidence: docs/chamber-art/. Independent tests and gameplay evidence: docs/chamber-qa/. Original audio: AUDIO.md and docs/chamber-audio/. No paid Tripo generation, commercial-game assets, human acoustic audition or learning-gains claim.
