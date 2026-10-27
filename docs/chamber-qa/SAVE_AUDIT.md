# Read-only save audit · CJ → Bh

**The reported parent-tab loss is not yet explained.** The current source and frozen Bh bundle use the expected core key, and the actual CJ earned exports pass the Bh parser unchanged. Two real overwrite defects were reproduced in isolated memory stores, without New Game; neither is established as the cause of the parent's IAB session. No browser/render was launched, no parent storage was read or written, and no runtime source was edited.

## Key/schema and observed compatibility

- `src/core/main.ts:16–21` explicitly constructs `CampaignProgress(storage,'rift-runner-rapier-campaign-v1')`. The filename suffix `v1` coexists intentionally with JSON `version:2`; CJ earned exports already have exactly this combination. The shared class's default `rift-runner-campaign-v2` belongs to the rejected prototype entry and is overridden by the core entry. Bh's minified entry contains the same explicit key/legacy gate.
- `parseSave`, `src/progression.ts:11–12`, requires version2, integer highest/resume in1..50, and an object `records`. Each retained record needs boolean `completed`, numeric `runs`, and boolean `last.goalMatched`. Legacy null measurements and optional base/contrast tags are accepted. There is no timestamp expiry, build-hash reset or registered-level-count validation. Merely filtering invalid records while keeping frontier4 would still show Continue, not a fresh Start01.
- `save-audit-data.json` records actual source **and extracted frozen Bh parser** results for five existing earned exports. `level3-run` and CJ `level3-affected-replay` retain records1–3/frontier4/resume4; `clean-five-run`, `remaining-controls-replay` and Bh `final-controls-replay` retain1–5/frontier6/resume6. Every parser result matches. The affected3 export includes genuine legacy1/2 with null measurements and earned3 base+contrast evidence.
- All these exports name origin `http://localhost:4261`. That is distinct storage from port5261, another host/scheme, or an isolated browser profile/partition. No evidence here establishes the parent IAB's exact origin/partition/raw value at the moment of loss.
- QA independently confirms Bh imported the unchanged clean-CJ earned save and passed its87-command controls/reset/restore replay. CJ bytes were not retained, so a direct byte/code diff is unavailable; only CJ manifests/exports and hashes exist. This demonstrates compatibility for the recorded shapes, not universal persistence in every browser context.

Audited frozen bytes: `main-BhURA1n2.js` SHA256 `8e945eb1feeaa0f668904b076196967de67f16797d32b34f7a95a4f7f4dae8d3`; shared progression class in `audio-q5VhIJN7.js` SHA256 `48f161cecdcbc392b5e1e11cb87c7059a69a547d6c9ef30195473f43db9c0b40`. Recorded CJ main SHA256 `224106afd079ae28faeb249e63497f577b1df88e35d1e27d300daf75544d63d7`; its shared chunk SHA256 `15a2b60e7f0eb4c130a2b658429cfd7db2f2cbe2ba08551fa56ac4941a1a624f`.

## Reproduced overwrite risks

1. **Stale instance can erase valid earned progress without New Game.** `persist()` writes the instance's whole in-memory snapshot without re-reading/merging the stored value (`progression.ts:21`). Two instances start fresh; A genuinely observes1–3 and stores frontier4/records1–3. Stale B then performs ordinary `enter(1)` (`:24`) and overwrites that with frontier1/records{}. No backup is created. Multiple same-origin tabs/windows sharing storage can therefore explain this symptom in principle. The source has no storage-event synchronization or monotonic-write protection. The parent's actual competing writer is unknown.
2. **Invalid/unreadable save falls back and a normal entry can overwrite it.** Unsupported version, invalid top-level frontier/resume, malformed JSON or missing schema returns fresh silently. A present invalid key also suppresses the core's legacy migration because the gate tests raw key absence, not parse success. Construction itself leaves raw bytes intact, but `enter(1)` subsequently overwrites them with a valid empty save, without backup or corruption warning. In-memory reproduction uses a hypothetical version1 payload only; none of the actual earned exports above fail validation.
3. **Storage unavailable is incompletely surfaced.** If getting the `localStorage` object throws, core main passes `undefined`; the class then starts fresh with no warning because its optional read does not throw. A `getItem` exception does set a warning, but the fallback instance can still later write its fresh snapshot if storage recovers. A failed `setItem` leaves session progress working and sets a warning; after reload that unsaved session progress is absent. No read/write exception from the parent was captured, so these are possibilities, not diagnosed causes.

Reproducer: `work/save-audit/check.ts` reads exported files and extracts only Bh's pure progression block into a Node VM; all mutations are to disposable JavaScript Maps. It starts no browser/native physics and touches no real browser storage. Detailed results are in `save-audit-data.json`.

## Every repository storage mutation path found

Search included ignored `work` code, source, tests, documentation runners and HTML; dependencies, generated binaries and frozen/minified output were excluded from the source inventory and Bh was checked separately.

| Path | Mutation and scope |
| --- | --- |
| `src/progression.ts:21,23–27` | Current key writes from legacy import, room entry, observed result, explicit New Game and restore. New Game writes `<key>-backup` only when its **own in-memory** `hasProgress` is true. No normal entry/result backup; no `removeItem` or storage clear implementation. |
| `src/core/main.ts:107` | Only `confirm-new` invokes `newGame(true)`; opening the New Game page does not reset. Reload/home/retry/restart/help/settings do not call reset. Drag-look writes only `rift-core-drag`. |
| `src/campaign-main.ts:31` | Prototype New Game can call `newGame()`/`newGame(true)`, but its class uses the separate default key. Controls write only `rift-controls`. Root index/chambers entries import core main. |
| `src/main.ts:13` / `src/audio.ts:166` | Old controls and current audio settings write only `rift-controls` / `rift-audio-v1`. Neither writes a campaign key. |
| `docs/campaign-art/capture-upper-inspection.mjs:8` | The only actual `localStorage.clear()` found: an init script in its newly created disposable Playwright context, conditional on `?inspect=31..50`; then seeds the old prototype key. It is not imported by runtime. No evidence it executed in parent IAB. |
| `docs/chamber-art/capture-frozen-core.mjs:4,18` | Disposable new Playwright contexts write drag-look and an explicitly labelled legacy room2 access fixture. No root campaign-key clear. |
| `tests/progression.test.ts` and audit scratch | Fake memory stores only. QA/audio `storageState()` exports write JSON files, not browser localStorage resets; imported QA files belong to isolated contexts. |

Bh has no `.removeItem()` call or `localStorage.clear()` runtime path. Its other `.clear()` calls concern rendering, physics, keys and Maps. No repository `Clear-Site-Data`, storage-clearing CDP command or IndexedDB deletion was found. A read-only HEAD of the current4261 root returned200/no-cache and **no Clear-Site-Data header**; this does not reconstruct old responses or external browser actions.

## Discriminating evidence and repair direction

Before another app action can overwrite evidence, the existing affected tab's read-only `location.origin`, raw campaign/legacy/backup values and storage-access errors would distinguish absent storage, invalid payload and a valid stale overwrite. An exact pre/post raw record or competing-tab write log is needed to establish cause; current exports alone cannot do that. No fabricated unlock/import is recommended as diagnosis.

The independent source findings support preserving invalid raw bytes before fallback writes, surfacing unavailable/corrupt storage, and preventing stale lower-frontier snapshots from replacing newer earned data except during an explicit reset transaction. Include two-instance stale-write, read-failure/recovery and malformed-save-then-enter regressions. Preserve real old metrics/variants rather than synthesizing runs. These are recommendations only; this audit made no source/storage changes. Draft12–15 registration remains unchanged.
