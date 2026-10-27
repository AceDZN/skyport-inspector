# Skyport Inspector · בודקי נמל השמיים

A single-player 3D airship ticket booth for Hebrew-speaking English learners in grades 7–9. Call the next traveler, compare physical documents with the current rulebook, mark two evidence phrases, clarify missing information, route a boarding decision and stamp the ticket. Recall a traveler to correct a mistake.

An original direct adaptation of the document-inspection loop in **Papers, Please**, with fictional festival journeys and an original chamber-jazz soundtrack.

## Play locally

```sh
npm ci
npm run dev
```

Open **http://localhost:5261**. Static built preview: `npm run build && npm run preview`, **http://localhost:4261**. Strict ports; no backend, accounts, API keys, runtime AI or CDN assets. No production deployment is part of this delivery.

Select כיתה ז׳ / ח׳ / ט׳, then פתיחת העמדה. Each track has a guided case, independent case and changed-context transfer. “גרסה מקבילה” changes one case’s English while preserving its visual skin and changes the correct action.

- Click the bell / **N**: next visitor after the previous case.
- Drag papers into the desk slots. Click a paper / **1–3** / **E**: readable comparison.
- Click or Tab/Enter on two phrase buttons to mark supporting evidence.
- **R** / rulebook: current rule. **Q** / בירור: ask a precise question when information is missing.
- Choose gate and departure time. Select **BOARD / B** or **HOLD / H**, then click a physical paper or the explicit stamp target / **Enter** once.
- **Esc** closes the active inspection/overlay; **P** pauses; **F** fullscreen. Native Tab/Enter controls work throughout. Letter shortcuts use physical key codes, including Hebrew keyboard layout, and do not fire inside inputs/selects/buttons.

Reading has no countdown. Hebrew help and translated phrase support are optional; the event record distinguishes assistance, retries and transfer. A correct action with no supporting pair can advance the story but earns no comprehension credit. This finite slice does not measure retention or whole-chapter mastery.

## Scope and evidence

Nine original launch challenges and three playable paired variants cover selected rules: current/habit/past journey information, practical tickets, missing details, reference, scoped updates, contextual current check-in versus dated records, and reported information. Tense alone never establishes current validity. Grade7/8 chapter11 support is qualified because the supplied reference snapshots are chapter9 modules.

Read [CURRICULUM.md](CURRICULUM.md), [coverage.json](coverage.json), [ENGLISH_REVIEW.md](ENGLISH_REVIEW.md) and [COVERAGE.md](COVERAGE.md) for exact Workbook sources and honest exclusions. No speaking, free writing, retained mastery or entire-chapter completion claim.

## Art and audio

Two locally bundled owned Tripo models, real skeletal idle/walk clips, bundled Heebo fonts, original procedural desk/tools/airship. [ASSET_SEARCH.md](ASSET_SEARCH.md) records current gallery/My Assets searches; [ASSETS.md](ASSETS.md) gives hashes, rights basis and rig limits. Zero new generations/credits.

Original 82 BPM 32-bar chamber-jazz music, ambience and 13 tactile cues. Separate master/music/SFX/voice gains, ramped mutes, pause/blur suspension, ducking support and no duplicate loops on restart. Voice recordings are not used. Listen to the [26-second mixed preview](docs/audio/skyport-mixed-preview.wav); composition source and checks are in [AUDIO.md](AUDIO.md).

[Generated design mockup](docs/visual-targets/gameplay-target.png) is labelled separately from [real gameplay](docs/playtest/desk.png) and [real inspection](docs/playtest/compare.png). The [continuous source-loop recording](docs/playtest/source-loop.mp4) and [local evidence viewer](http://localhost:5261/docs/playtest/index.html) include wrong/recall/recovery and transfer. See [VISUAL_REVIEW.md](VISUAL_REVIEW.md) and [PLAYTEST.md](PLAYTEST.md).

## Verification

```sh
npm test
npm run build
```

`tests/semantics.test.ts` checks authoritative world decisions, both sides of paired meaning contrasts, evidence bypasses, clarification, scoped updates, temporal context and reporting identities. Browser tests exercise actual user controls rather than injecting wins. Reproducible QA script and captures are in `docs/qa`. `window.render_game_to_text()` exposes visible game facts, learning events and audio status; `window.advanceTime(ms)` supports deterministic stepping and respects pause.

Known limits: finite source/evidence rubric, no free-form language parser or recorded voice; simplified procedural dock geometry; no hand/facial animation. Browser compatibility and listening evidence are stated precisely in the QA/audio docs.
