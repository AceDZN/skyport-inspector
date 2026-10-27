# Independent playtest log

27 October 2026. English/QA helper executed these checks with Playwright against `http://localhost:5261`. No game-state mutation, forced win or evaluator injection was used to solve browser cases. Browser scripts read `render_game_to_text` and operate actual buttons, document lines, selects, raycast canvas input, keyboard focus and touch input. This is automated usability/causal-flow evidence, not a claim about enjoyment or learning gains.

## Commands and results

| Command | Observed result |
|---|---|
| `node --import tsx --test tests/semantics.test.ts` | 61 passed, 0 failed, 0 skipped. All 9 launch cases and 3 paired variants, wrong stamps, unsupported evidence, missing information, scoped updates, report identities/dates, and tense-context regressions. |
| `node docs/qa/browser-test.mjs` | All 9 launch cases solved through the actual UI. G7/G8/G9 each completed with 3/3 source-supported first-attempt decisions, including each changed-context transfer. The exact question revealed the third document in G7-2 and its reply was selected as evidence. No page errors. Also passed wrong HOLD → visible wrong-queue result → recall → recovery; missing-time lucky guess blocked; irrelevant question did not clarify; hint/translation assistance persisted after hiding translation; pause/Esc, audio settings and restart. JSON: `docs/qa/browser-results.json`. |
| `node docs/qa/controls-test.mjs` | All 3 paired replay campaigns completed in their correct stage positions. English changes caused G7 return HOLD→BOARD, G8 tomorrow notice Gate3→Gate2, G9 READY→NOT READY BOARD→HOLD. Paired segment results preserved in `docs/qa/paired-results.json`. Initial keyboard select test needed correction for native macOS headless popup behavior (see below). |
| `SKIP_PAIRS=1 node docs/qa/controls-test.mjs` | Keyboard-only Start → inspect → two evidence phrases → native time selection → stamp → correct evidence result. Native Tab/Enter/type-ahead used; no programmatic focus or click in that sequence. Esc closed rulebook while preserving inspection, then closed inspection. Real AudioContext running, decoded buffers and cues scheduled with no load error. Touch context390×844 completed first case with actual tap inputs; portrait and landscape844×390 had no horizontal overflow. JSON: `docs/qa/controls-results.json`. |
| `node docs/qa/physical-test.mjs` (final frozen source) | Real3D canvas raycast click opens readable inspection; pointer drag snaps paper and emits slide; Escape cancels a drag without committing it; browser-protocol Hebrew-character key with physical KeyE opens inspection; pause plus advanceTime10000 leaves event clock unchanged; BOARD opens chosen Gate2/18:00 and moves the visitor along its route after5.1sec; stale armed instruction removed; short landscape close control fully visible; real touchCancel commits no slide and leaves inspection recoverable. JSON: `docs/qa/physical-results.json`. |

“Unaided” in the game’s summary means no optional hint, translation or retry on that attempt; the guided case remains a guided stage. It does not mean retained mastery. Independent English review is in ENGLISH_REVIEW.md and mapping in CURRICULUM.md.

## Actual captures inspected

- `g8-2-inspection.png`, `g9-3-inspection.png`: readable English and selectable evidence; one early automated capture left both slots on the same document, which is permitted. `side-by-side-stable.png` shows two different documents after the entrance animation settles.
- `g7-1-result.png` through `g9-3-result.png`, `grade-7-complete.png`, `grade-8-complete.png`, `grade-9-complete.png`: real decision/campaign states from UI play, not generated mockups.
- `wrong-queue.png`: visible misconception consequence before recall.
- `physical-drag.png`, `drag-cancel-stable.png`: tangible paper drag and restored desk positions.
- `board-world-outcome.png`: final source, physical ink mark, selected gate opening and traveler route. This focused route test intentionally uses no evidence, so its visible result correctly awards no comprehension credit.
- `mobile-inspection-stable.png`, `mobile-landscape-stable.png`: final short-height layout and readable scrollable paper surfaces. The final landscape close control is fully inside the viewport.

The gameplay camera, cobalt desk/ivory papers, brass traveler and lamp, warm dock and explicit stamp state are coherent. HTML document inspection intentionally supplies readable text over the3D papers. The robot traveler differs from the human concept target, and the scene remains more stylized and less textured than the generated mockup; generated art is not a screenshot.

## Defects found and disposition

- Paired replay originally replaced the independent slot even when the paired case belonged to a guided/transfer stage. Lead fixed matching by base case ID; all paired campaigns retested successfully.
- Short landscape inspection header/close was clipped by minimum paper height. Lead reduced short-height minima/constrained height; final bounding-box and screenshot verification passed.
- Armed-stamp toast persisted over results. Lead clears it on stamp/new case; final UI check passed.
- Escape did not originally cancel an active drag. Lead restores original paper position and cancels capture state; actual pointer Escape path and touchCancel path passed after fix.
- Two early runs were interrupted by development hot reload before first case assertions. Final runs used frozen source. No runtime page errors occurred in the completed campaign run.
- Native ArrowDown/Home on a macOS headless `<select>` did not commit an option, reproduced in a standalone plain select. Native keyboard type-ahead (`1` →18:00) worked and was used for the complete keyboard win; this was a test-driver adaptation, not an app patch.

## Audio and limits

Independent QA verified actual post-gesture AudioContext running state, decoded local buffers, cue scheduling, gain changes, pause/resume and restart path. This helper did not acoustically audition music. AUDIO.md records the audio owner’s detailed metrics, playback/settings/blur/loop QA and audition limitations. No listening-proficiency claim.

The Hebrew input check sends `key: ק`, `code: KeyE` through the browser input protocol and verifies the real event handler. It does not change macOS’s global input-source setting. Mobile is Chromium touch emulation, not physical-device testing. No screen-reader session, real student observation or long-term retention experiment was performed. The finite evidence rubric can omit a valid alternative reason; a correct game action still stands without comprehension credit.

## Lead final delivery checks

After the independent checks, two small audio cue changes removed a duplicate Restart bell and separated the mistake cue from recall. The static production preview (`http://localhost:4261`) then passed a real UI supported evidence win, exactly one Restart bell/three loops, wrong-stamp consequence, and local asset loads with no HTTP/browser errors. Evidence: docs/playtest/static-preview-check.json. The existing develop-web-game client also completed against the final sources; its actual inspection screenshot and visible state are docs/playtest/client-final/shot-0.png and state-0.json, both opened by lead. Final build passes and the 61 semantic tests remain passing. The full 67.68-second real UI recording and26 observed states are docs/playtest/source-loop.mp4 and loop-states.json; recording page errors:0. Audio/video preview limits are stated in their viewers.
