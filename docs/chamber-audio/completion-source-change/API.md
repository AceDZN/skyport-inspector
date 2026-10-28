# Completion pause lifecycle — source preparation

Status: implementation and six lifecycle unit contracts prepared by Audio without launching jobs. Root subsequently ran targeted strict compilation (exit0) and all six contracts (6/6, exit0), with exact audio/main/test hashes; see `RESULT.json`. This is fake-WebAudio lifecycle proof only. No decoding, browser run or listening is claimed. The original module is `audio-before.ts.txt` with digest in `before.json`; new module/test snapshots and hashes are in `prepared-source.json`. Existing 29 assets, AudioContext, mixer buses, three continuous loops and normal cue cap are retained. D2 and its private artifact path are unchanged.

## API

`pauseWithCompletion(): void` is for an **accepted** physical campaign result only. It marks the mixer intentionally paused so further room cues are rejected, clears flight air, stops existing one-shots and optional voice, fades the music bus (all three continuous score/connection/environment loops) to zero, and plays one existing `complete` cue through the same SFX/master path. Suspension occurs from that actual source’s `onended`, not an assumed wall timeout. `complete.wav` contains exactly 83,200 stereo frames at 32 kHz: **2.600 s**, playback rate 1, SHA256 `da283e8bfa07e1900af93a0742e2f1bda1d9f31013d20ef9b1d364218ff5f969`.

`start()` and `setPaused(false)` stop/disconnect any result source first, restore the persisted music/master targets and resume existing loops. Ordinary `setPaused(true)` also cancels the result source immediately, so Home or another menu cannot leave an old completion tail. Source-identity checks prevent a delayed old `onended` callback from suspending a new room or a newer result. No loop/context is recreated for this transition. Missing context/buffer falls back to ordinary paused behavior.

During the result, master and SFX edits still ramp and can mute the figure. A music edit persists its setting while room music stays muted; resume restores that saved value. `state().completionActive` identifies this intentional paused-but-finishing phase. Thus paused may be true while context is running for the 2.6 s completion, then suspended. This is not ordinary pause behavior.

## Lead-owned main integration

Generic dispatch must skip `complete`; a stale-generation result rejected by `progress.observe()` must go Home without a victory cue. On accepted result: set `mode='result'`, `release()` (clear input/air), `audio.pauseWithCompletion()`, render. Result mode pauses physics throughout. Root reports this ordering integrated in future source, with its separate `MAIN_INTEGRATION.json` receipt. Root owns main; Audio did not edit it. That source is not a claim about the immutable D2 served artifact.

## Lifecycle verification (run by Root)

`tests/audio-completion.test.ts` contains six meaningful fake-WebAudio lifecycle contracts: actual-end suspension while room cues are rejected; early Next/Restart through idempotent `start()`; ordinary pause/Home cancellation; persisted master/SFX/music mute semantics; missing-buffer fallback; stale callback against a replacement completion. These fakes test scheduling/ownership and gain targets only, not WebAudio rendering, decoder quality, timing accuracy or audition. Root ran targeted strict first, then all six unit tests successfully, as recorded in `RESULT.json`. Audio launched no compiler/native/browser/build job.

The eventual frozen browser must independently verify full audible 2.6 s result playback over paused/silent room audio, early Next/Restart/Home cancellation, mute while finishing, no resumed old tail, stable 29 buffers/three loops, and genuine final50 save/Continue behavior. A silent Playwright video or a cue counter cannot certify the sound.
