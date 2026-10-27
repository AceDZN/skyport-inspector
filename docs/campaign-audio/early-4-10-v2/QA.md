# Early campaign prototype, second candidate

Entry: `http://localhost:4261/campaign.html`. Driver: `docs/campaign-audio/prototype-4-10-v2.mjs`. This is an exploratory normal-input checkpoint across candidate builds, not final clean-save fifty-level verification. Earlier failures in `early-4-10/` remain unchanged.

The driver started a new browser context and used New game, ordinary keyboard/mouse actions, public UI, documented time stepping and state reads. No player/object positions, unlocks, completion flags or game-save records were set. Full command/state history (including unsuccessful actions) is in `prototype-results.json`. Screenshots were opened and inspected.

| Level | Observed result |
|---|---|
| 1 | Real portal crossing; wrong west exit rejects with error cue and no unlock/Next. Restart and east exit unlock 2. |
| 2 | Reload and Continue preserve earned progress. Latest window/cross placement and real ninety-degree traversal reach west/right door and unlock 3. |
| 3 | Front-start small crate grabbed before portal traversal; actual carried crate crossing count positive. Behind pad and east bridge exit unlock 4. |
| 4 | Detached cargo-island portal chain and relinking work. Wrong small triangle on far pad plus a full west-span route correctly rejects with no unlock. Fresh attempt transports large diamond through two portals, activates far pad, walks the entire west bridge south, records `route:west-bridge`, and unlocks 5 at near-bank west exit. |
| 5 | Required side switch/shutter active plus forbidden central-door crossing reaches the correct outer exit and correctly rejects, leaving 6 locked. Fresh retry opens the side shutter, physically traverses it using the west detour with central door closed, and unlocks 6. Actual lever-off shutter closing and reopening also tested. |
| 6 | Portal to west vault, select small triangle, carry it back through portal, activate central pad. Walk around physical grate, cross north bridge, north exit unlocks 7. |
| 7 | Lever and cargo shutter work; A on window panel places. Normal B placement attempt at cross-gallery panel rejects and B remains null. Source fixture shows destination normal −Z faces away from reachable south bank. Route stopped and reported; no workaround injected. |
| 8–10 | Pending; not entered or counted as tested. |

The earned save is retained in the live browser context at level 7 for Continue after fixture correction. `checkpoint.json` records the stopping state. At that checkpoint: no page errors, no console errors, 29 decoded audio buffers, three running loops and no audio load errors. New `switch-toggle`, `shutter-open` and `shutter-close` cues were triggered by actual level-5 machinery, alongside error and completion cues. Human subjective audition is not claimed.

At earned level 5 the page reloaded the updated candidate bundle; `level5-build.json` records its URL, SHA256 and size. The preceding prefix ran the prior candidate, so this evidence must not be represented as one immutable final-build run. The level-7 blocked placement is captured in `28-level7-back-facing-cross-panel-attempt.png` with matching state. No fifty-level completion claim is supported here.

## Stopped after direct human replacement

The human rejected the unfinished campaign and redirected work to two polished enclosed chambers. This run was stopped and its browser closed. The later level-7 corrected panel allowed both portals to place, but a subsequent carried-route attempt respawned repeatedly and did not complete the room. A misleading capture filename `30-level7-left-beam-pad.png` was queued before that attempt finished; its actual state is a respawned player on the entrance bank, **not a successful pad**. The full log preserves the failure. Valid exploratory completions remain 1–6 only; 7–10 were not verified. No fifty-level completion claim is supported.
