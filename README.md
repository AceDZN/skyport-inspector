# Rift Runner · קופצים בין שערים

An original first-person portal puzzle game. The current rebuild focuses on two enclosed test chambers: retrieve a rigid cube from a raised alcove and return it to a pressure button; then use a real floor-to-wall momentum fling to reach an elevated gallery.

The new core is composed around Rapier3D0.21: a capsule character controller, dynamic rigid cubes with angular motion, collision-aware holding, aperture-scoped portals and physical machinery. It does not inherit the rejected AABB controller. Existing original sound/music and appropriate art are reused.

**Core candidate:** [localhost4261](http://localhost:4261/). **Development:** [localhost5261/chambers.html](http://localhost:5261/chambers.html). Normal-input and video validation is in progress. No completed-core or fifty-level delivery claim is made yet.

WASD move, mouse look, left/right mouse place portals on valid white surfaces, Space jump, E grab/drop, R safe retry, M Hebrew help, Escape pause/unlock. Drag look is available if pointer lock is unavailable. Reading pauses the puzzle.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

REAL-PORTAL-RESET.md is authoritative and supersedes the earlier campaign approach. The eventual requirement remains fifty authored levels with saved progression and no grade selector; expansion resumes after the two core chambers satisfy physical and visual acceptance. `rift-campaign-50-draft-v1` preserves the rejected, unverified fifty-room draft. Its catalogue, static tests and partial prefix runs are historical source material, not shipped campaign evidence.

Targets and exact prompts: docs/chamber-targets/. Actual art/search evidence: docs/chamber-art/. Independent tests and gameplay evidence: docs/chamber-qa/. Original audio: AUDIO.md and docs/chamber-audio/. No paid Tripo generation, commercial-game assets, human acoustic audition or learning-gains claim.
