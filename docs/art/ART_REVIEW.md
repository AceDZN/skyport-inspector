# Independent art review

27 October 2026, actual Chrome gameplay at `http://localhost:5261`, own tab 512279576. The art helper opened Start, inspected the grade-7 booth and opened the first ticket's side-by-side English inspection. Actual screenshots: `gameplay-first-review.png` and `readable-inspection-review.png`. Also opened and directly compared `docs/visual-targets/gameplay-target.png` using image view.

## First observed build

- The real lamp GLB is present, shaded with its green/brass texture and correct front orientation. Counter contact is clean. The automaton GLB is present and its arms hang naturally rather than remaining in an A/T pose. Local binary checks independently establish its real 65-joint rig and clips.
- Navy enamel desk, brass inspection trays, ivory paper, red tactile stamp, rulebook and bell form a coherent working composition. The 3D world is the dominant surface. English document text is intentionally inspected in a readable narrow HTML overlay; the physical paper texture is not treated as the required reading view.
- Compared with the target, the first build's automaton appears too dark: the face and body are nearly black because the key light is behind a metallic model. The character appears small/full-body rather than a close conversational upper body. Airship's top is cut off by the frame. Recommendations were sent to the lead: front fill or environment reflections; move/scale visitor toward the counter; lower/move airship farther back.
- Inspection overlay renders English LTR, with selectable phrases and legible line wrapping. No automatic correct answer highlight is present before evidence selection. Warm ivory/navy maintains strong contrast. The overlay occupies the central desk while the dock/traveler remain around it.

## Intentional differences from target

The target is an imagegen design mockup, not a game capture. Final implementation uses an existing own rigged automaton in place of the mockup's human character. The booth and airship are original authored Three.js geometry with simpler material wear, background population and architectural detail. No claim of matching the concept's photorealistic surface complexity, hand model or crowd density is made. The aim is the same tangible desk/inspection hierarchy with achievable local rendering.

Final camera fixes are reviewed below when available; acquisition evidence alone does not establish them.

## Updated capture review — after front fill and visitor fitting

Independently opened `docs/playtest/desk.png` and `docs/playtest/compare.png`, supplied by the lead after its scene adjustment. No browser was driven and no source was edited during the QA freeze.

- **Fixed:** automaton's clock face, turquoise vest, buttons, brass joints and hands now read clearly. Larger 4.3-unit traveler near the counter has much better presence. The real skin is in a natural waiting pose; the character identity is unmistakable. Lamp contact and front texture remain intact.
- **Needs the lead's final lighting pass:** the added light bleaches the navy desk and rail frame toward pale blue; ivory papers become nearly white; the vermilion stamp becomes salmon. Exterior boards are very bright. The exact physical paper text in `desk.png` is washed out. Lower total light/exposure while retaining a camera-side key on the traveler. Give the exact paper face an unlit, non-tone-mapped texture material so it does not lose contrast with scene lighting.
- **Readable in the actual task view:** `compare.png` has crisp English serif text, warm ivory paper and clear phrase targets. That is a working reading surface, not a claim that the tiny perspective paper is readable enough. Inspector UI remains compact enough to leave the scene dominant when closed.
- **Remaining art limitation:** airship top remains intentionally cropped and the dock uses simple geometry/empty sky instead of the target's dense architecture, crowd and distressed material finish. This is visibly simpler than the target, and should be described that way. The target's close conversational human eye line is only partially matched by the automaton framing.

A human-facing [target comparison](target-comparison.html) places the generated mockup beside the current real capture with an interactive wipe and explicit labels. It loads `docs/playtest/desk.png`, so the lead can replace that verified capture after its lighting pass without editing this comparison.

The first updated result/queue screenshots were also visually opened: `docs/qa/g7-1-result.png` shows the stamp in the action position and the physical gate partly opening; `docs/qa/wrong-queue.png` visibly offers recall with an explanatory consequence; `docs/qa/g8-2-inspection.png` shows selected evidence in the current scoped notice. These are actual tested states, not concept art or edited composites.

Lead integration follow-up: final desk.png and scoped-update.png replace the earlier captures after reduced lighting and unlit printed faces; ink now retains contrast. Continuous real UI recording is docs/playtest/source-loop.mp4. The independent reviewer’s earlier observations above remain historical evidence, not unresolved completion claims.
