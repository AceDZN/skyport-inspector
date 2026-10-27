# Rift Runner: independent Portal core review

Reviewed on 27 October 2026 after the human rejected the previous fifty-room implementation. The rejected campaign remains historical draft work. This report concerns the new Rapier core at `http://localhost:4261/chambers.html`, served from the frozen `main-tCue42BN.js` build during the review. Source checkpoint: `c58825f` in AceDZN/skyport-inspector. Later source fixes require their own regression evidence.

## Actual normal-input outcomes

The parent used the in-app browser, ordinary mouse drags/clicks, WASD, E and Space. No player/body/portal assignments, forced win, save injection or debug unlock was used.

**Chamber 1 earned completion.** A blue portal was aimed at the west wall and an orange portal above the raised alcove. The parent walked through the linked pair, picked up the cube, jumped back through the raised orange portal while carrying it, brought it to the floor button, dropped it onto the button and walked through the physically opened exit. The UI displayed `CHAMBER 1 COMPLETE` and offered the next chamber. Aimed placement, live linked views, traversal, retrieval, carried-cube return and button/door progression were exercised together.

**Chamber 2 earned completion.** The parent placed the upper-wall receiver and a floor portal beneath the fall route, walked off the well lip while holding W through the drop, emerged through the upper receiver, landed on the otherwise elevated gallery and entered its exit vestibule. The UI displayed `CHAMBER 2 COMPLETE`. The final pair was blue on the upper wall and orange on the well floor; color order was not hard-coded to the solution.

This is a meaningful improvement over the rejected draft: actual enclosed rooms, first-person portal tool, pressure-button door and a real fall-to-horizontal-fling route. It establishes two working core problems. It does **not** establish fifty finished educational levels or certify every edge case.

## Defects sent to the builder

- The upper receiver in Chamber 2 was 3.6 m high around a 3.1 m portal. Its usable center range was narrow, and the gallery obscured much of it from the approach. Several clearly white aimed shots failed the fit check. Enlarge the visible receiver and its matching placement surface, then retest the physical landing range.
- A four-pixel drag-look adjustment was interpreted as a click and replaced a portal. Any genuine drag must suppress shooting on release.
- Invalid-placement messages remained in accessibility state across later successes and completion. Clear and expire the message content as well as its visible class.
- Final visual quality must be assessed against actual gameplay, not the attractive target image. Current enclosure, material hierarchy, button conduit and tool are much clearer, while portal-view resolution and mechanical door detail still deserve review.

The lead reports source fixes for the first three; this parent run predates those fixes.

## Supporting evidence and limits

The independent engine report contains fourteen passing Rapier integration checks: resting cube/blocked divider, aimed point and fit rejection, repeated bidirectional crossing with speed preservation, adjacent wall solidity, player/button release, hovering-cube rejection, cube/button door safety, opaque-wall grab rejection, low-speed fling insufficiency, genuine falling fling with W released and held, ordinary-jump insufficiency, fall recovery and independent held-cube crossing/pullback. These are focused physics checks, not substitutes for the browser outcomes above.

Builder visual captures under `docs/chamber-art/frozen-core/` are explicitly unplayed composition inspection. Some use seeded room access and are not earned progression evidence. Builder normal-input recordings under `docs/chamber-qa/` must remain separately labeled and tied to the relevant build.

## Remaining authorized scope

Publish the repaired core at the actual root `http://localhost:4261/`, retain one saved escalating campaign without grade selection, and author the requested fifty chambers on this physics/rendering base. Each later chamber needs a distinct physical problem and English that materially changes a successful action. The whole final campaign still needs an earned normal-input playthrough, save/resume/replay checks and final visual/audio review. Neither a fifty-row catalogue nor these two wins fulfills that scope.
