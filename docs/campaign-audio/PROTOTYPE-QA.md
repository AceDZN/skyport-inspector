# Early campaign prototype QA

Scope: the active development entry `http://localhost:5261/campaign.html`, hook version `campaign-physical-draft-1`. This is **levels 1–3 prototype evidence**, not verification of fifty levels. HMR was possible. This QA owner edited only files in docs/campaign-audio, with no game-source mutations.

Command: `node docs/campaign-audio/prototype-early.mjs`. A fresh browser context starts with an empty game save. Actions use the public UI, keyboard, unlocked drag-look and documented `advanceTime` hook. No player/object positions, completion flags or unlock/save records were set by the runner. Unlocked look is enabled through Settings.

## Latest observed checkpoint

| Observation | Result |
|---|---|
| Fresh menu has New game, Levels and no grade selector | Passed; capture inspected |
| New game starts level 1 | Passed, 29 buffers / three audio loops |
| Aim A at near panel; walk through installed A/B pair | Passed, actual crossing and enter/exit cues |
| Reach west exit while mission asks east | goalMatched false, highestUnlocked remains 1, no Next; error cue plays |
| Restart, traverse again, reach east exit | goalMatched true, highestUnlocked/resumeLevel become 2 |
| Next → reload → Continue | Earned unlock/resume 2 persists and resumes level 2 |
| Level 2: place A on new window panel and B on west-wall cross panel | Passed from normal start-gallery sightline |
| Level 2: actual ninety-degree portal crossing → south/right door | goalMatched true and unlocks 3; required portal ledger alias observed |
| Level 3: portal traversal → grab small cargo → drop behind → pad → east bridge → exit | goalMatched true and unlocks 4 |
| Audio across these real paths | 29 buffers, exactly three loops, zero load errors; pickup/drop/pad/bridge and success/error cues observed |
| Page and separately captured console errors in latest run | Zero of both |

The latest `prototype-results.json` has `passed:true` and seventeen observed stages. Captures 01–08 show the actual menu, traversal, wrong exit, correct exits and level-3 pad state; latest captures were opened and inspected. This is the first three prototype levels only.

## Important limitation in level 3

Both cargo candidates currently start **behind** the glass. The runner therefore crossed the player first, grabbed the small crate in the rear half, and put it on the behind pad. This is a physically and semantically valid solution to the visible mission, and it unlocked 4. Both crates retained zero portal crossings. It verifies object choice/carry/drop/pad/bridge, but **does not demonstrate carried portal traversal** or the catalogue's stated first carried-through-glass introduction. The lead was notified; moving the cargo to the start side would make that introduction necessary. The test did not invent extra carry trips to satisfy an invisible flag.

## Resolved prototype blockers

Earlier runs found that the original level-2 cross-panel was inaccessible from the start gallery. A normal viewpoint around (−6.01, 3.26) hit the intervening shelf panel; a far-left viewpoint (−6.682, 1.284) produced invalid. The lead independently changed the physical fixture: window A is now the front panel, B is on the destination west wall, and right/left exits match the east-facing exit orientation. The latest normal-input run passes that corrected layout.

The actual portal ledger alias `portal:enter:window-panel` was also added from a real crossing, resolving the goal/runtime key mismatch. Wrong-English exits now use the error cue rather than the completion cue, while continuing to withhold progression.

`prototype-first-sightline.json` and `prototype-blocked-level2.json` preserve earlier failing states. `prototype-failure.png` shows the earlier invalid placement; the numbered captures now reflect the passing corrected layout. The first two runs captured page errors only; the latest run separately captured page and console error streams. No historical nine-room capture is counted as campaign evidence.

New switch/shutter/lift/conveyor/junction/relay/receiver audio remains prepared and module-tested in docs/rift-audio; these early levels do not verify those later systems. No fifty-level completion, subjective fun, retained learning or physical-device claim is made.
