# Rift Runner curriculum and action evidence

Active Portal-style replacement,27 October2026. The nine-room pack was authored only after an independently played first-room portal/carry/pad/bridge/exit/fall/retry proof. Historical ticket-desk fixtures and evidence-pair rubrics do not count as replacement coverage.

All scenarios are original game missions grounded in saved Workbook content. Exact additional modules were discovered through list_curriculum_filters and fetched/read through get_curriculum_content before fixture authoring; those snapshots are in docs/rift-qa/curriculum. Existing mixed-tense, practical-source, current-status and reported-speech snapshots remain in docs/curriculum.

| Room | Stage and selected source skill | Authoritative task and meaning contrast | Action evidence / feedback |
|---|---|---|---|
|g7-1| guided; [spatial relationships](https://english.workbook.co.il/grade-7/chapter-11/prepositions-time-place), [imperatives/sequence](https://english.workbook.co.il/grade-7/chapter-11/modals-and-imperatives), [practical instructions](https://english.workbook.co.il/grade-7/chapter-12/reading-functional-texts) | Small diamond c1 starts in front; put it on behind-glass pad, then cross east. Other real crate/pad/bridge choices exist. | Actual c1→behind pad→east bridge→exit. World crossing follows pad activation; words are not answered in a quiz. |
|g7-2| independent; [mixed tense/context](https://english.workbook.co.il/grade-7/chapter-10/mixed-tenses-guide), same spatial/imperative/practical modules | usual and yesterday location behind versus today’s front-pad task. c1 starts behind; current route west. | Carry c1 to front pad, then west exit. Feedback separates habit, finished event and current instruction. |
|g7-3| changed-context transfer; G7 spatial/imperative/practical modules | Return run changes identity: small TRIANGLE c2, large diamond c1. Start behind; front pad and west bridge. | Actual small triangle→front→west. Repeating “diamond/behind/east” from first room does not earn language credit. |
|g8-1| guided; [mixed account](https://english.workbook.co.il/grade-8/chapter-10/mixed-tenses-reference), [defining relative clause](https://english.workbook.co.il/grade-8/chapter-11/relative-clauses-reference), [reference](https://english.workbook.co.il/grade-8/chapter-11/pronouns-and-reference), [practical sources](https://english.workbook.co.il/grade-8/chapter-12/reading-practical-texts-and-sources) | Rook actually carries diamond c1 while triangle c2 rests, then stands beside c2. “that Rook carried” selects c1. Behind/east. | Select actual carried crate, transport it, behind pad, east exit. Robot action/history must be real before this skill is verified. |
|g8-2| independent; same G8 modules | Original carried-crate/behind/east instruction plus current update changing only bridge to west. Unambiguous it=crate, there=stated platform. | c1 and behind remain; west changes. Choosing another crate/pad is an overbroad update. |
|g8-3| changed-context transfer; same G8 modules | Reset changes history: robot carries TRIANGLE c2 and stands beside diamond c1. Front pad, east bridge; tomorrow’s west notice does not apply today. | Actual new carried object c2→front→east. Neither previous room’s carried object nor unrelated future notice determines goal. |
|g9-1| guided; [present perfect/past context](https://english.workbook.co.il/grade-9/chapter-10/present-perfect-vs-past-simple-reference), [current practical source](https://english.workbook.co.il/grade-9/chapter-12/reading-practical-texts-and-sources-reference) | Engineer has repaired east; explicitly safe now. West repaired last week but explicitly broken again. c1 behind, east. | Current safe route east; broken west stays folded. Past simple alone does not imply present damage. |
|g9-2| independent; [reported instruction/reference](https://english.workbook.co.il/grade-9/chapter-11/reported-speech-reference), G9 practical source | Mina(she/her) tells Oren(he/him) to move her crate. Player is Oren; owner labels distinguish Mina c1 from Oren c2. Current report, front pad, west. | Move speaker’s crate c1, not addressee’s c2; front/west. No tense-backshift or free speech-production test. |
|g9-3| changed-context transfer; G9 perfect/current context and practical-source modules | Launch-room original small/behind/west plan; scoped update changes only crate to large c2. Explicit safe launch status; floor-to-wall momentum launch first. | Actual launch event before relevant pad activation, then c2→behind→west→exit. Pad/bridge are preserved; launchUsed alone without sequence does not earn credit. |

## Paired meaning changes

| Pair | Same physical skin/candidates/history | Changed words → changed target |
|---|---|---|
|g7-1-pair| Same first-room crates/start/labels | behind→in front of: c1/front/east. A local physically valid solution may stand; crate-portal use is reported separately. |
|g8-1-pair| Same robot carrying c1 and standing beside c2 | carried→stood beside: c2/behind/east. Natural visible action history supplies the evidence; no answer highlighting. |
|g9-1-pair| Same crate geometry/start and chamber | West explicitly safe now; east explicitly broken again: c1/behind/west. Physical bridge condition follows the stated current status. |

## Authoritative evaluation and assistance

Room configuration supplies real crate identities, initial sides, action history, target pad/bridge, current blocked route and launch requirement. `evaluateRoom` consumes actual world outcomes; it never parses an answer sentence. Physical completion requires a crate on a pad, a bridge crossing and real exit. The engine records crossing only after pad activation. Language credit requires the mission’s crate, side and bridge; the launch transfer also requires actual launch before pad activation. Portal-use evidence is separate from English because a legitimate alternative route can still demonstrate the instruction.

A wrong semantic choice may still produce a valid physical completion. It remains a completed route, with precise Hebrew feedback and no claim of that target’s comprehension. Hint/translation/retry counts persist. Unaided means no optional support or retry on the recorded attempt; guided rooms remain guided stages. Journal reading pauses action pressure; there is no speed-reading assessment.

## Exact scope and exclusions

Selected rules from chapters10,11,12 in each grade have concrete tasks across the campaign. No claim covers a whole chapter. This game does not assess free grammar production, extended prose, all relative-clause roles, passive production, full reported-speech forms, the full tense system, listening/speaking proficiency, pronunciation, literature analysis, graphs or retained mastery. Chapter11 G7 spatial/imperative and G8 relative/reference modules are now direct exact sources, unlike the historical desk’s supporting-only coverage.

Semantic suite: `node --import tsx --test tests/semantics.test.ts` —101 passed,0 failed at authoring. That proves the finite rubric/configuration, not physical reachability or enjoyment. First-room browser proof is complete; the other eight rooms, paired variants, grade mistakes/recoveries and launch require actual integrated browser verification recorded in PLAYTEST.md before their coverage status is verified.
