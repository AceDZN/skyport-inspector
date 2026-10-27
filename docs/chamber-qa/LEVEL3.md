# Third chamber: independent QA

Frozen candidate: `main-CuBWdJum.js` SHA256 `b8af04510160a5b7c0ba2fdeaf6568670e1a0a6edce366dc2f39b60ed50e4a65`.

The actual public-input run starts from the unmodified game-only profile genuinely earned by completing chambers1 and2. It verifies migration, Continue3, and real chamber3 play. This is **not** a fresh1→3 proof. No positions, portals, completion flags or unlocks were injected.

`level3-run/manifest.json` and `level3-recovery-recipe.jsonl` preserve the ordinary mouse/LMB/RMB/WASD/E sequence. All commands passed, page errors0, console errors0.

- Plausible wrong answer: cube on the front/west button opens the actual South door. Walking through that door produces one recoverable wrong-destination event, leaves the puzzle active, and keeps completed=[1,2].
- Recovery: pick up that same cube, carry it through the west/east portal pair to the far/behind button, leave it there, return through the pair, and physically walk through the opened North door. Chamber3 is genuinely earned. Player crossings2, cube1.
- Completed alternate: from the level menu select the optional changed instruction, front/south. On the identical physical layout, the same front-button/South answer previously rejected now completes. No portals are demanded when that sentence's physical solution is local.

`tests/core-level3.test.ts` passes4/4: base/contrast fixtures deep-equal; pads occupy the correct opposite sides of the fixed entrance window; each actually drives a different physical door; wrong destination is recoverable without event spam; contrast accepts the other exit. These tests use explicit unit poses and are not playthrough evidence.

Actual initial window/pad and physical route captures were opened and inspected. The room establishes two visible buttons on opposite sides of a full glass divider. **NORTH/SOUTH labels were obscured by door pockets in this candidate**, as art also found independently. The renderer correction and its readable-label capture are still required; this run does not claim visual direction-reading acceptance.

The migrated1/2 records correctly retain null unknown assistance/time/crossing metrics and declare legacy provenance. The candidate's contrast completion overwrites the base last-run metrics without a variant label. This was reported; the lead has authored a source correction retaining separate base/contrast records, pending an actual-save retest in the next frozen build.

`clean-1-3.jsonl` is a prepared normal-input recipe for a separate fresh progression/video pass after the label build. It is planned until that run exists. English authoring/source limits are documented by the author in `docs/core-levels/ENGLISH-3-5.md`; none of these finite routes establishes whole-chapter mastery or learning gains.
