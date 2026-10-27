# Core motion art review

Reviewed actual public-input footage `docs/chamber-qa/core-gameplay.mp4` and the full-resolution `final-run` checkpoints. QA's finalized manifest reports earned completions `[1,2]`, zero page/console errors and no injected body, portal, save or win state. This art review does not independently reclassify unit tests or seeded art screenshots as play evidence.

The uncut silent recording is 41.84 seconds, 1,046 frames at25fps, 4,935,562 bytes; SHA-256 `19e0c0c7aea2818b6360b178b953cdac2cdac5f07ad39b33774774d533f7e293`. Its recorded main bundle is `main-WoEqkdvS.js`, SHA-256 `a7dc70e954adf2b530d8f53107b505baf16b034959df1ce7c0e75876fbe2d2ab`. Audio event states are in QA's manifest; the video has no audio stream, so this review makes no listening claim.

## Method and observations

`video-review/inspect-video.py` decoded every frame to160×100 grayscale for a near-white transient scan. It matched the full-resolution QA checkpoints to the video and extracted surrounding frames for visual inspection. I inspected the contact sheet, the named full-resolution checkpoints, the startup frames and representative surrounding frames; I did not watch every frame at full resolution. Exact scan data is `video-review/scan.json`.

|Actual sequence|Video wall time|Visible finding|
|---|---|---|
|Live destination / checkpoint003|10.64s|The destination cube and room appear within the aperture with coherent perspective, surrounding wall depth and camera-dependent view. No full-screen portal flash appears in the reviewed sequence.|
|Partial held cube / checkpoint005|16.32s; nearby16.08/16.56s inspected|The cube remains visibly continuous in front of the amber aperture rather than disappearing as a whole object. This view is nearly front-on: it cannot prove the side seam, reverse crossing or all-angle clipping. Independent physics tests cover partial-cross/reverse contracts; they are not an all-angle art proof.|
|Returned held cube / checkpoint006|17.40s|The same held diamond module remains visible on the near side, with the glass and room now behind it. No whole-cube visibility pop is apparent in the sampled transition.|
|Weighted button / checkpoint007|22.32s|The actual cube rests on the red button. The doorway is seen later during the recorded walk; this one cube-facing still alone cannot establish the entire door motion. QA records the physical circuit and earned exit.|
|Fling / receiving gallery / checkpoint013|35.88s; nearby35.64/36.12s inspected|The player view reaches the receiving floor with the enclosed pit below and a real floor edge/rail. The viewpoint then turns along the gallery. This is consistent with the recorded airborne crossing and grounded landing, rather than a hidden completion overlay.|

Exactly one frame exceeds90% near-white: frame1 at0.04s is entirely white. Full-resolution frames0–2 show browser startup (partial blank white/gray, white, then dark loading), before the menu/gameplay. **There is no >90%-near-white frame after this startup transient.** That does not detect every possible localized texture glitch or certify every recursive-view angle.

## Visual conclusion and remaining limits

The actual recorded core maintains the enclosed ceramic/graphite identity, compact original split-coil projector, coherent live destination and visible cube delivery through the reviewed route. It supports the earlier actual-versus-target comparison in `ART_REVIEW.md`; generated material wear, reflections and energetic portal edges remain richer than runtime. The accepted recording provides a useful motion check for these two routes, not a claim that the eventual fifty-level campaign is complete or that every oblique seam/recursive camera configuration has been inspected.
