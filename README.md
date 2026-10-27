# Rift Runner · קופצים בין שערים

An original first-person portal puzzle game. The new campaign grows from two proven enclosed chambers: retrieve a rigid cube through portals, then use a real momentum fling. Chamber 3 adds two physically different button/door routes selected by a spatial instruction. The first five authored chambers now have one fresh, normal-input1→5 run. The eventual fifty-room campaign remains in progress.

The new core is composed around Rapier3D0.21: a capsule character controller, dynamic rigid cubes with angular motion, collision-aware holding, aperture-scoped portals and physical machinery. It does not inherit the rejected AABB controller. Existing original sound/music and appropriate art are reused.

**Core candidate:** [localhost4261](http://localhost:4261/). **Development:** [localhost5261/chambers.html](http://localhost:5261/chambers.html). A fresh [128.52-second continuous recording](docs/chamber-qa/five-chambers-gameplay.mp4) earns all five completions with194ordinary-input commands and zero browser/assertion errors on frozen CJGVY4LM. The current BhURA1n2 review adds a settings-preview pause correction. Chamber3 also has independent base/wrong-route/recovery/changed-instruction proof and readable direction-sign captures. The earlier [41.84-second core recording](docs/chamber-qa/core-gameplay.mp4) preserves the original two-room milestone. The fifty-level campaign is still being built.

WASD move, mouse look, left/right mouse place portals on valid white surfaces, Space jump, E grab/drop, R safe retry, M Hebrew help, Escape pause/unlock. Drag look is available if pointer lock is unavailable. Reading pauses the puzzle.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

REAL-PORTAL-RESET.md is authoritative and supersedes the earlier campaign approach. The eventual requirement remains fifty authored levels with saved progression and no grade selector; expansion proceeds in small authored, tested batches. The Rapier campaign uses an isolated save key, preserves earned two-chamber progress with explicitly unknown old measurements, and supports Continue, unlocked replay and backed-up reset. Base and changed-instruction evidence are retained separately. `rift-campaign-50-draft-v1` preserves the rejected, unverified fifty-room draft. Its catalogue, static tests and partial prefix runs are historical source material, not shipped campaign evidence.

Targets and exact prompts: docs/chamber-targets/. Actual art/search evidence: docs/chamber-art/. Independent tests and gameplay evidence: docs/chamber-qa/. Original audio: AUDIO.md and docs/chamber-audio/. No paid Tripo generation, commercial-game assets, human acoustic audition or learning-gains claim.
