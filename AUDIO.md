# Skyport Inspector audio

All music, ambience and foley in this repository are original synthesis created for this game on 27 October 2026. No external recordings, commercial-game soundtrack, paid service, account or purchased sample is used. The synthesis source is `scripts/render-audio.py`; the runtime is `src/audio.ts`. These original audio assets may be used and redistributed with Skyport Inspector. There are no third-party audio attribution requirements.

## Composition: “Afternoon Boarding”

82 BPM, 4/4, 32 bars, 93.659 seconds. A A B A′ form, D major with a B minor bridge. The foreground melody is a restrained reed-like harmonic voice; the accompaniment uses soft frequency-modulated electric-piano chords, plucked harmonic bass and quiet shuffled brush synthesis. The A motif rises F♯–A–B and returns through A–F♯–E to D. The second A changes the response notes; the bridge changes harmony, contour and register; the final A resolves to D. The final 8-bar section is a musical return, not a repeated timer cue.

| Bars | Form | Harmony / arrangement |
|---|---|---|
| 1–8 | A | Dmaj9 → Gmaj9 → Em7 → A7; first reed question/answer |
| 9–16 | A | Same progression, altered opening/response notes and articulation |
| 17–24 | B | Bm7 → Gmaj9 → Em7 → A7; contrasting higher-register melody |
| 25–32 | A′ | A returns and resolves to D; final cadence leaves space for the next loop |

`skyport-chamber.flac` contains the complete calm arrangement. `shift-energy.flac` is an aligned optional shuffle/fill layer, raised by `setEnergy(true)` for a later case or shift completion. It does not replace the harmony/melody. `terminal-ambience.flac` contains a low airship propeller, soft cloth/wind noise and distant wordless formant-like terminal murmurs. These are synthesized environmental textures, not recorded speech. They loop independently under the music.

The circular room-reflection mix preserves final-note tails at the loop start. A short endpoint correction removes sample discontinuities. The score and energy stems have identical length and start time. Lossless FLAC encoding preserves the exact loop endpoints and keeps the three loops compact; WAV cues avoid codec delay on short tactile actions.

## Context cues

13 different locally bundled cues, with slight playback-rate variation for repeated tactile actions:

| Runtime name | Sound / action |
|---|---|
| `bell` | Brass partials for calling the next visitor |
| `paper-pickup` | Short paper fiber rustle |
| `paper-slide` | Longer paper scrape |
| `page-turn` | Double-folded page flutter |
| `evidence-pencil` | Two pencil strokes |
| `ink-pad` | Soft ink-pad contact |
| `board-stamp` | Firm, higher wooden/rubber impact |
| `hold-stamp` | Lower, heavier stamp impact |
| `gate-opening` | Quiet sliding mechanism / airy release |
| `recall` | Descending then resolving piano correction cue |
| `shift-end` | Four-note D-major completion figure |
| `mistake` | Short low, gentle unresolved interval |
| `question` | Rising two-note piano question |

Aliases accepted by `cue()` include `next`, `pickup`, `slide`, `inspect`, `page`, `evidence`, `ink`, `board`, `hold`, `gate`, `correction`, `success`, `end`, `ask`, and `stamp`.

## Playback controls

`SkyportAudio.start()` creates/resumes AudioContext from a user gesture and fetches/decodes all local assets. Repeated calls reuse one context and the same three loop sources. Master, music, SFX and voice gains are independent, clamped to 0–1 and saved in `localStorage`; setting any bus to zero mutes it. Gain ramps avoid hard changes. SFX are capped at eight concurrent sources, with old sources disconnected when finished. A master compressor provides final headroom. Pause fades then suspends the context; resume preserves loop position. The game calls `setPaused` for pause/tab visibility and `setEnergy` for end-of-shift intensity.

Voice is optional and this slice contains no spoken-language samples. `playVoice(url)` supports replayable local subtitled speech if added later, and `setDucking(true)` lowers music and ambience to 24% while speech plays. The exposed voice slider therefore reserves the gain bus; it does not imply listening assessment.

## Preview and verification

[26-second mixed preview](docs/audio/skyport-mixed-preview.wav) includes the calm tune/ambience, optional energy texture, bell, paper, pencil, ink pad, both stamps, gate, mistake, correction, question and shift-end sounds. The preview is an authored mix, not a recording of gameplay. Machine measurements are in `docs/audio/audio-metrics.json`; they include PCM duration, RMS, peak and loop endpoint delta. The generator is seeded for reproducibility. Encoded-file decoding checks and actual browser checks are recorded below when complete.

No subjective human listening session has been asserted. Automated non-silence/decoding and AudioContext checks do not establish musical quality; the preview is provided for audition.
