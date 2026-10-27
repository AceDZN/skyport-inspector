# Static prototype continuation: levels 4–10

Entry: `http://localhost:4261/campaign.html`. Script: `node docs/campaign-audio/prototype-4-10.mjs`. Scope is a prototype checkpoint, not a fifty-level verification run.

The runner created a fresh browser context and repeated the actual UI/input prefix: New game → wrong west exit (no unlock/error cue) → level-1 east win → unlock 2 → reload/Continue 2 → ninety-degree window-panel/right-door win → unlock 3 → **new front-start cargo** grabbed and carried through a real portal → behind pad → east bridge → level-3 win/unlock 4. The small crate's portal-crossing count is positive in this run, superseding the earlier qualified level-3 rear-start proof.

The same browser context then remained alive for recorded interactive normal-input commands. Commands only aim, walk, press ordinary keys, use the UI, advance documented deterministic time, read state and capture screenshots. They do not set positions, completion flags or save unlocks. Full command/state history is in `early-4-10/prototype-results.json`.

## Level 4: transport works; route semantics fail

Observed real chain:

1. Place A on near panel and B on the detached cargo quay.
2. Walk through A to the cargo island; grab the large diamond.
3. Carry it back through B; on the near quay, relink B to the far panel.
4. Carry it through A to the far quay and drop it on the far pad.
5. Return through B to the near quay, then attempt to walk north along the west bridge toward the requested west exit.

The last walk crossed the near-panel portal again because it sits at the bridge entrance. It warped the player to the far quay; normal walking then reached the west exit. The result nevertheless reported `goalMatched:true` and unlocked 5. The complete event ledger has pad activation and portal events but **no `route:west-bridge` event**. This is an observed English-action bypass; it is **not counted as a correct level-4 pass**, even though the prototype evaluator accepted it.

The near panel's host wall spans the west bridge's normal approach: its width is 3.8 while the bridge is 3 wide, both centered at x −5 near z 4. The route obstruction and missing goal predicate were reported to the lead. The large crate did physically traverse twice; cargo selection/transport/far-pad activation are verified independently of the route defect.

The requested continuation stopped at this issue. Levels 5–10 have not been counted as played or verified. The browser was closed after preserving the result; its observed highest-unlocked value 5 reflects the reported faulty acceptance, not a valid campaign checkpoint for final proof. The final clean-save run must repeat after corrections.

Page errors: zero. Captured console errors: zero. Audio remained at 29 buffers / three loops with zero load errors; portal/pickup/drop/pad/bridge/completion cues are present in snapshots. Captures `09-level4-cargo-quay.png` through `12-level4-west-bridge-win.png` are actual gameplay; the last was opened and inspected. Its filename describes the prototype's accepted result, not this QA verdict.
