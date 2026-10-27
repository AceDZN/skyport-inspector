# Early core English: chambers 3–5

Status: authored language and physical design contract, **not normal-input completion evidence**. Scope is the new enclosed Rapier core under `PORTAL-CAMPAIGN-QUALITY.md`. No old fifty-room fixtures, hidden action flags or mission-derived geometry are used here. Runtime metadata is `src/core/levels/early-english.ts`, exporting `earlyEnglish` keyed by 3, 4 and 5. Each entry has `name`, `mission`, optional paused Hebrew `he`, a player-facing thematic `chapter` and internal `sources`. Source URLs must not become grade selectors or a requirement to answer a quiz.

## The instructions

| Chamber | English mission | Physical reading |
|---|---|---|
| 3 · Behind the Window | Put the cube on the button behind the window. Use the north door. | Choose the remote east button, then the actual north route. |
| 4 · Trade Places | Stand on the button to open the first door. Bring the cube back. Leave it on the button before you exit. | Player pressure reveals access, then the cube takes over so the player can leave through a physically open exit. |
| 5 · Two Together | Put one cube on each button. Leave both cubes there to keep the exit open. | Two distinct occupied buttons are needed simultaneously; either cube-to-button assignment is valid. |

These are original game sentences, not quotations or reproduced exercises. Hebrew retains the same objects, relationships and sequence. It belongs in optional help that pauses the world; it should not replace the English decision by default.

## 3: a real spatial alternative

The fixed reference view is the **west entrance facing east through the window at x = 0**. The west bay is in front of that window and the east bay is behind it. The reference does not follow the moving camera. Entrance architecture/signage must establish that view; north and south door signs must identify actual directions without marking one as correct.

Stable physical IDs agreed with art: `front-button`, `behind-button`, `north-door`, `south-door`, `north-exit`, `south-exit`, `cube`. The west/front button opens the south door; the east/behind button opens the north door. Both doorways have real usable vestibules and routes. Choosing the wrong button leaves the requested north door closed, with an observable reason to reconsider the spatial phrase. Do not pretend a visible open doorway is blocked by an invisible language collider.

The optional contrast changes the requested destination to **in front of the window / south door**. It changes the cube's actual placement, powered door and route. It does not swap circuits, relocate cargo, change portal physics or create an arbitrary success condition. Compare the same physical blueprint under both sentences. A correct independent cube delivery and a correct carried delivery are both valid; neither “stay on the walkway” nor a particular portal colour/index is part of the English.

Required later evidence: normal controls for behind/north; a plausible front/south attempt showing the different real circuit/route; then the front/south contrast on unchanged geometry. Capture cube pressure, door position, requested/actual destination and full audio state. Merely changing a metadata string is not evidence.

## 4: the player gives the cube a job

Stable IDs: `maintenance-button`, `access-door`, `exit-door`, `cube`. Player pressure on the button opens the opaque first/access door, exposing the remote portal surface and cube. Once the cube returns, leaving it on that same button maintains both access and the final exit door. The final corridor is dark/non-portalable where specified by the physical author; no route should bypass its real door.

“Before you exit” describes the actual process, not an event-ledger test: the exit cannot remain open until something continues pressing the button. The English does not forbid temporary experiments, stepping off, relinking portals or a valid independent cube return. It names the needed replacement state. The “it” in the final sentence refers to the previously named cube.

Specific physical counterfactual: take the cube off the button before approaching the exit; pressure clears and the exit closes. Restoring the cube should recover normally, with no permanent penalty for an earlier attempt. A before→after sentence would be impossible with the present circuit, so no optional playable contrast is exported. An honest alternative order would require a real second route or different machinery, to be agreed with the lead/art; no secret counter should manufacture that alternative.

Required later evidence: stand-on-button opening/revealing access, real cube retrieval and replacement pressure, exit opening, plus an empty-button attempt showing a physically closed exit and recovery. If a bypass leaves the cube unnecessary, the fixture fails this contract and the mission must not cover it with an invisible requirement.

## 5: count the destinations as well as the cubes

Stable IDs: `lower-button`, `upper-button`, `cube-a`, `cube-b`, `exit-door`, `exit`. The cubes have distinct retrieval routes in split-height architecture, but the mission assigns neither cube an arbitrary identity or fixed button. One cube on each means two different occupied buttons. Putting both on one button does not satisfy the real AND circuit. Player pressure can help during setup; once the player leaves for the exit, both cubes must continue the two pressures.

Specific physical counterfactual: move either cube away, or put both cubes on the same button; one input clears and the exit closes. Restore two simultaneous distinct presses to recover. The source metadata does not demand a particular retrieval order, portal traversal count or cube/button assignment. “Both” is simultaneous maintenance, not a hidden count of earlier pad touches.

An either/both contrast cannot produce two successful choices in the current AND-only fixture. No such optional contrast is exported. A completable “either” instruction would require a real alternate OR branch/door available in the same world; discuss that architecture before adding the sentence. Do not silently change the AND circuit when the English changes.

Required later evidence: both real retrieval paths; either cube assignment; one occupied button keeping the physical exit closed; two cubes on a single button still closed; both distinct buttons pressed opening the exit; normal recovery after removing/replacing one cube.

## Exact source grounding

The saved `docs/campaign/LANGUAGE_REVIEW.md` and curriculum snapshots were reviewed for source selection only, not reused as proof of this core. Relevant modules were also retrieved through the Workbook public connector on 27 October 2026. Discovery confirmed the grade-7 chapter-11 module IDs. No Workbook practice, public worksheet or paid generation was created.

| Canonical source | Specific use and limit |
|---|---|
| [G7 chapter 11: prepositions of time/place](https://english.workbook.co.il/grade-7/chapter-11/prepositions-time-place) | Source sections on relationships between objects and short directions ground spatial phrase/destination reading in chamber 3. Our fixed window viewpoint and front/behind contrast are original situated examples, not a quotation from that lesson. Saved related snapshot: `docs/rift-qa/curriculum/grade-7_prepositions-time-place.md`. |
| [G7 chapter 11: modals and imperatives](https://english.workbook.co.il/grade-7/chapter-11/modals-and-imperatives) | The base-verb imperative and ordered instruction sequence ground chambers 3–4. We use put/stand/bring/leave/use; this batch does not assess can/must/should merely because they share the source module. Saved related snapshot: `docs/rift-qa/curriculum/grade-7_modals-and-imperatives.md`. |
| [G7 chapter 12: functional texts](https://english.workbook.co.il/grade-7/chapter-12/reading-functional-texts) | Source sections on action/object/quantity, sequence words including before/after, and maintaining a number's referent ground chambers 4–5. The cube/button sentences are original adaptations, not the source's plant/recipe task. Saved related snapshot: `docs/curriculum/grade-7_chapter-12_reading-functional-texts.md`. |
| [G7 chapter 11: countable nouns and quantities](https://english.workbook.co.il/grade-7/chapter-11/countable-uncountable-quantifiers) | The one-item/two-item countable distinction supports cube/cubes in chamber 5. The retrieved module does not explicitly teach both/each; those are original contextual wording for the actual two-input mechanism. No mastery of all quantifiers, countability contrasts or much/many is claimed. |

The source grade/chapter is provenance, not a grade gate or player proficiency label. This early batch intentionally does not force grade-8/9 tense, passive or reported-speech material into unsuitable cube actions. Later physical designs can support those meanings. No whole chapter, extended reading/writing, listening, speaking, retention or learning-gain claim follows from these instructions.

## What this batch can establish

Chamber 3 supports an independent spatial choice between physically plausible branches. Chambers 4–5 support reading and planning through necessary physical conditions; because their present circuits force one successful final state, a success alone cannot isolate English comprehension from discovering the machine by trial and error. Preserve that distinction in coverage/evidence. Normal-input tests, wrong-language attempts, source review and visual inspection are all still required before these authored entries count as verified implemented chambers.
