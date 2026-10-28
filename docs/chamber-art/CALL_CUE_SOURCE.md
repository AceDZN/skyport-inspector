# Recovery call display and neutral cue contrast · source-only

The new Scene source includes the preserved finish-v3 patch plus this small renderer follow-up. Exact hashes/snapshot/diff are siblings. No core, physics, control anchor, device specification or static build was edited.

For a switch with `spec.calls`, the display reads the referenced actual lift and named stop. It shows `AT <stop>` / READY only when the target is not moving and its actual position is within.03m of the requested stop. Otherwise it shows `CALL <stop>` with RETURNING only when that stop is selected and the lift is moving, WAITING when selected but not moving, or PRESS E when another stop is selected. Missing connections read UNLINKED / NO LIFT. The station's generic ON/OFF flag cannot manufacture an arrival caption. All motion stays native.

The held footprint keeps its native clipped hull, current pose, .004/.007m offsets, depth test, height fade, pooling, immediate null/drop suppression and neutral colour role. Only patch opacity.20→.26, broken-outline opacity.36→.58, and outline neutral grey `#aeb6b6`→`#c8ceca` change. There is no hull growth, thickness/height lift, target colour, snap, x-ray or manipulation. This is a bounded contrast proposal; its ordinary-view readability still needs actual new-build captures.

CPU source probes cover actual stopped/moving/selected/missing-lift caption states, no physics/control mutation, clipped geometry and native-query immutability, height fade, pooling and stale-cue suppression. TypeScript passes. No browser/GPU/build launched.

The own next-run diagnostic client now captures HTTP status+failed URL/method/resource type, request-failure error text and console message location alongside actual WebGL/CDP GPU data. Its syntax check passes. Historical headed Chrome's two generic404s remain unattributed; independently finding a favicon404 does not prove those were the old requests. The next frozen run must verify actual URLs.
