# Real Portal gameplay reset

Latest human direction: “whatever you created till now is pure shit.... its broken and looks ugly, that's not a fucking portal game. i want it to be a real portal game”. This is a rejection of the current implementation, including the sparse floating-room campaign. A fifty-row catalogue, fifty rendered layouts and passing static audits did not deliver the intended game.

This brief supersedes the current implementation approach. Preserve its reviewed work under a draft snapshot/tag. Keep the existing builder chat, public repo/main and ports5261/4261. Build a fresh, coherent core in an isolated source folder rather than stacking more exceptions onto the rejected controller/room factory. Reuse appropriate original assets, curriculum sources, audio and save code. The eventual fifty-level saved progression and no-grade-selector requirements remain; expand it **after** the core below passes.

## Immediate deliverable: two convincing playable chambers

1. An enclosed, polished test chamber with real walls, floor, ceiling, a raised cube alcove, large readable portal-capable surfaces and a real pressure-button exit door. Player aims both portals, walks through to retrieve a cube, carries it back, leaves it on the pressure button and walks through the physically opened door. The button also responds to the player standing on it; stepping off removes that pressure. A direct walk/jump cannot bypass the retrieval problem.
2. An enclosed vertical chamber with a genuine drop well and a floor-to-wall momentum fling to a landing that walking/jumping cannot reach. Geometry must be designed from the actual gravity, entry speed, exit height and gap; no artificial “launch used” flag or hidden speed boost. It must be forgiving to normal mouse/keyboard use. Safe fall/retry returns the player promptly.

Author two complete physical problems, not attractive rooms with optional actions checked by an exit evaluator. These chambers establish the engine, art and control standard for the remaining campaign. Continue autonomously after the internal review; this is not a request for a human approval gate.

## Recognizable Portal interaction

- First-person mouse look, WASD movement, Space jump, E pick up/drop/use, Escape pause/unlock. Keyboard look remains a fallback. Movement, stairs/edges, ground contact and cube collisions must feel solid. Clear one-time control teaching, no grade screen.
- A visible, original dual-portal projector held at the lower right, animated recoil/energy response and clear cyan/amber portal-state reticle. Use a finished model, not an invisible gun or a block filling the view. Keep the aim line clear.
- LMB/RMB fires the respective portal onto the point actually aimed at on valid surfaces. Large white wall/floor areas are portal-capable; dark surfaces visibly are not. Fit checks reject invalid edges with clear feedback. Do not silently snap every shot to one pre-labelled panel centre.
- Live destination views must have correct perspective, framing and exit-plane clipping as the player moves and looks around. Portal edges should have depth and coherent energy treatment. Support facing/offset changes and at least a bounded recursive view. A flat screen showing a displaced room is insufficient.
- Traversal transforms position, orientation and velocity for player and dynamic cubes. Wall↔wall, floor↔wall and reverse crossings work repeatedly. Input/air control must not erase the fling velocity. Exit clearance, no bounce-back, no camera/cube disappearance, no walking through adjacent solid wall.
- Held cubes remain physical and collide with walls. Aiming/grabbing through an opaque wall must not work. Carrying through a portal must be visually and physically stable; clip/duplicate partial objects correctly instead of popping or hiding them. Loose cubes also traverse with momentum and orientation.
- Use robust collision/rigid-body support; evaluate Rapier rather than continuing the fragile custom AABB patch chain. Its kinematic character controller and dynamic-body/PID tools are relevant; portal transitions still require explicit transforms and properly scoped physical apertures. Do not disable an entire wall collider just because a portal exists.
- Pressure buttons, doors and any later machinery must have visible causal motion and real collision state. Cubes stay where dropped. A closing door must not trap/jitter the player. Correcting an action/retrying must not leave stale failure flags that make the level unwinnable.

## Visual standard

Visual thesis: a compact, believable experimental facility with cool white ceramic panels, graphite service recesses, brushed-metal mechanisms, cyan/amber energy, deliberate pools of light and grounded contact shadows.

- Build enclosed rooms with real architectural scale, varied wall depth, ceiling structure, door tracks, ledges, bevels and surface detail. No global green plane, open-sky whitebox islands, paper-thin frames or repeated crates as the entire environment.
- Use a coherent modular material kit with actual base colour/roughness/normal treatment, controlled UV scale, readable contrast and restrained wear. Light the room deliberately; avoid flat washed-out ambient light and empty backgrounds. Choose an achievable high-quality real-time art target, not a photorealistic concept image the runtime cannot approach.
- Search Chrome Tripo gallery/My Assets first and reuse suitable originals before generating. Existing original cargo/rigged guide can be retained if appropriate. The portal device and featured mechanical props need finished silhouettes/materials. Rig any animated character properly. Author original art/code/levels; no imported commercial-game assets or logos.
- Generate and inspect new gameplay design targets with the invoked imagegen skill before implementing this reset. Save prompts/targets in the project. Compare actual **first-person gameplay captures** at matched camera/composition against them, then improve the actual game. Mockups and overview renders are never delivery evidence.
- Sparse in-play HUD: small reticle/portal status, contextual interaction hint and one short English mission. Hebrew help/journal is accessible and pauses the puzzle. Keep internal IDs, evaluator jargon and debug panels out of the player experience.
- Maintain original background ambience/music and convincing portal, footsteps, landing, cube, button, door and fling SFX. Test mute/pause/resume and prevent repeated motor/contact event spam.

## English and eventual campaign

The students remain Hebrew speakers, and Workbook grades7–9 rules chapters10–12 remain the source. Teach short action language in the first core chambers, then make object, spatial relation, sequence, reference, current notice and condition change the physical solution in later rooms. Keep physical fixtures/history independent of mission wording. Multiple physically valid answers allowed by the sentence must count. No arbitrary unrelated exit chores, quiz unlocks or grade choice.

Once the two chambers pass the actual play standard, extend the same engine/art standard into the fifty-level progression. Retire or rebuild the rejected fixtures rather than merely wrapping them in prettier walls. Preserve useful original content as a source library, not a requirement to keep bad puzzles. Whole-campaign normal-input testing still applies to the final fifty levels.

## Evidence required before claiming the core works

- Test the actual new entry page through normal mouse/keyboard controls, both manual-style play and reproducible browser runs. Inspect screenshots/video and errors. No forced body positions, portal placement API calls, completion flags or fabricated unlocks as play evidence.
- Show an actual continuous gameplay recording of Chamber1: aim/shoot → correct live view while moving → traverse → retrieve/carry cube through → cube rests on button → door visibly opens → walk through and progress. Also test dropping the wrong side, standing/leaving the button and recovering.
- Show Chamber2: enter the well → cross the floor portal → fly out with transformed momentum → land across the genuine gap → finish. Verify jump/walk alone cannot reach that landing, repeated/reverse crossings work and falling retries safely.
- Test carry/loose cube collisions, blocked exits, shots near edges, partial portal crossings, frame-rate independence, pause/focus/resize, restart, audio and saved progress. Fix defects and repeat affected chains.
- Review the actual first-person art against the targets. Parent must be able to open localhost4261 **root** and immediately recognize/play the new core. Remove the stale grade-menu entry when the new core is ready.
- Commit coherent checkpoints to main. Update docs and evidence honestly. Do not call the game complete after only a mockup, geometry audit or two-chamber core; the eventual fifty-level request remains open.

## Primary technical references

- [Official Portal page](https://store.steampowered.com/app/400/Portal/) — source-game context and footage/screenshots.
- [Official Three.js portal example](https://threejs.org/examples/webgl_portal.html) and [source](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_portal.html) — render-target/camera projection reference; this alone is not a complete traversable game.
- [Rapier JavaScript controllers](https://www.rapier.rs/docs/user_guides/javascript/character_controller/) — current character and held-body control guidance.
