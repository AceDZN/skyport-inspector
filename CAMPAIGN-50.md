# Rift Runner — fifty-level campaign

## Latest human direction, 27 October 2026

This supersedes all grade-selector, grade-track, nine-room and repeated-courtyard scope in previous briefs. Scope is the existing Rift Runner game/chat/repository. Continue with the existing three art/audio/English-QA helpers and serialize lead-owned source edits and commits.

Ship exactly **50 authored, playable levels** in one increasingly demanding campaign. No grade choice, grade gating, or grade-labelled difficulty in player-facing menus. Keep source grade/chapter tags internally for curriculum provenance only. The human explicitly requires genuinely different, fun rooms, English that matters, and playtesting of the whole game.

## Campaign and player experience

- Start screen: Continue (when a save exists), New game and Levels. A compact 1–50 map shows completed, next unlocked and later locked levels; completed levels are replayable. Five named chapters of ten can organize the map without becoming separate difficulty selectors.
- Completing a level unlocks the next one and saves locally. Resume survives reload/reopen. Replay must not erase highest unlock. Restart level, checkpoint recovery, pause, journal and settings work consistently. Any full progress reset must be deliberate and reversible or confirmed.
- Teach controls through the first few rooms. Keep movement, looking, portal placement, jump and interaction consistent as new machinery appears. A new object gets a readable affordance and safe opportunity to try it.
- Increase spatial reasoning, planning depth and English precision gradually. A later chapter may briefly introduce a new mechanic in a simple room before combining it; progression need not increase movement difficulty every single level.
- Let the player read and use Hebrew support without a running hazard or countdown. Record assistance separately from completion; using help must not lock progression.
- Keep the stable preview at 4261 current at meaningful verified checkpoints. Do not present a 50-button map over nine rooms as a campaign.

## Room variety is gameplay, not skin

Before broad authoring, produce a machine-readable 50-row level catalogue with level number, room name, physical family, geometry/route description, new demand, interaction chain, English focus, exact source URLs, semantic decision, success conditions and planned real-input solution. Lead owns the final schema; English helper reviews language while QA owns independent play evidence.

Aim for at least ten materially distinct layout families and eight meaningful interactive systems across the campaign, integrating rather than merely listing them. Useful candidates: linked portal traversal, carried/loose cargo, multiple switch/door circuits, rotating bridge junctions, moving lifts/platforms, directed energy relays, momentum launches and safe obstacle/timing routes. Choose a feasible coherent set and prove each works before filling its levels. Do not add inert decorative devices to meet a count.

Examples of different spatial problems: an L-shaped gallery, a multi-storey lift shaft, a split atrium with alternative bridges, a vertical launch tower, a relay garden, a moving-platform canal, a two-object sequence room, a loop with one-way returns, a robot-history depot and a multi-stage finale. Adjacent levels should not repeatedly share the same topology and solution chain. Rotating/recolouring a courtyard or swapping a crate label does not make it a different puzzle.

Suggested arc (adapt the exact names/mechanics, preserve the learning curve):

| Levels | Physical development | English development |
|---|---|---|
| 1–10 | Short exploration, simple portal placement, switches, doors and carry; substantially different small rooms | Imperatives, object descriptions, place/direction, positive/negative instructions, first/then |
| 11–20 | Alternative routes, two-stage circuits, bridge junctions and lifts | before/after/until, must/mustn't/can, comparatives and precise reference |
| 21–30 | Moving platforms, action-history machinery and combinations with portals | Relative clauses, pronouns, present/past/ongoing events and practical notices |
| 31–40 | Energy routing, vertical momentum and conditional systems | Conditions, passive receivers, explicit current versus historical state, scoped updates |
| 41–50 | New configurations combining learned systems; satisfying multi-stage finales | Reported requests with clear speakers, tense/reference integration, multiple-source instructions and changed-context transfer |

Use the Workbook chapter/module snapshots already supplied. Do not invent Ministry coverage. Curriculum grade/chapter remains internal metadata; give an honest final mapping of selected rules practiced and exclusions.

## English must change the solution

- Every level has a concrete language-dependent action, object, relation, sequence, condition or route. The physical objective and feedback must reflect it, rather than letting the same actions win under any sentence.
- Provide plausible alternatives. The correct path/object must not consistently glow, be the only usable one, always be first/left, or be encoded by a repeated colour/shape shortcut. Readable object labels identify objects, not the answer.
- Do not require arbitrary actions simply to flip an invisible completion flag. A launch, relay or sequence must solve an actual spatial/machinery problem. Wrong choices give understandable world consequences and quick, recoverable feedback.
- Sentences must be unambiguous about reference, speaker, owner and time. Explicit facts determine whether a repaired route works now; tense alone does not imply physical safety. Relative-clause tasks need actual observable history when history is their evidence.
- Include changed-wording checks that hold the room's appearance/available actions constant while changing the correct physical action. At least one meaningful contrast per mechanic/language family. Verify the old solution fails the changed objective and the new one succeeds.
- Hebrew coaching/translation is available on request, with short explanations connecting the English to what happened. Avoid a quiz overlay as the way to unlock the action game.

## Whole-game verification required

1. Build/test the controller and each new system in small vertical slices. Run the develop-web-game client after meaningful changes and inspect screenshots/state/errors. Keep deterministic stepping and render_game_to_text current.
2. Run a **clean-save, sequential Level 1 → Level 50 browser playthrough** through the public game UI and real gameplay keyboard/mouse/touch-equivalent inputs. Advancing deterministic time and reading game state for assertions are fine. Setting player/object positions, completion flags, save unlocks, or forcing a win is not completion evidence.
3. Preserve a per-level manifest: level/version, action sequence, expected vs observed physical/English result, pass/fail, captured gameplay and completion screenshots, retries and console errors. A catalogue audit or fifty pure evaluator calls does not replace this run. Fix failures and repeat affected paths plus the sequential campaign if progression changes.
4. Test wrong language choices and changed-meaning contrasts separately; verify recovery and that a physically successful wrong objective does not unlock the next level. Test fall, blocked portal, carried object collision, repeated crossings and momentum/other added systems.
5. Verify save/continue by reloading mid-campaign and returning to the correct unlocked point; test replay without losing progress, checkpoint retry, pause/journal input suppression, audio pause/resume, mute, fullscreen and resize. Verify final-level completion and the completed campaign/replay state.
6. Inspect actual captures across **all fifty rooms**, plus intermediate states for each new mechanic. Lead/QA must look for visual repetition, dead space, unclear routes, unreadable labels, clipping and scenes that diverge from the mockups. Include ordinary human-style browser play on representative early/middle/late rooms; automated solutions establish feasibility, not fun or learning gains.
7. Keep generated targets current for materially new room families; use the invoked imagegen skill before implementing their visual design. Search Chrome Tripo gallery/My Assets before generating models. Reuse strong existing originals; rig animated characters properly. Maintain original background music/ambience and meaningful sound cues for added machinery.
8. Finish with a passing production build and relevant semantic/physics tests, updated docs/provenance/coverage, clean reviewed commits pushed to the existing public AceDZN repository/main, and static preview 4261 serving that build. State any genuine remaining limitation rather than counting planned levels as shipped.

## Coordination

Existing builder lead owns engine, scene, UI, save/progression and integration. Existing English/QA helper should independently audit the 50-row catalogue and own full-run evidence. Art/audio helpers continue their specialties. Reassign helpers as needed after their initial deliveries to keep QA moving. Parent coordinates acceptance and independently reviews representative live rooms, progression and evidence. Do not create another user-facing chat for this same game, and do not alter the other two games from this instruction.
