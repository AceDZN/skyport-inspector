# Sequence drafts12–15

These four explicitly authored fixtures are exported only as `draftSequenceLevels` in `src/core/levels/sequences.ts`. They are not registered or built. The source owns language and geometry together; the blueprint and optics never depend on the active mission/contrast. Lead-owned room11 remains untouched. This is design/source evidence, not normal-input completion or a campaign playthrough.

The batch introduces two machine families—periodic opaque gates and a real reversible conveyor—then combines familiar pressure, optics and physical transport. Room12 has no cargo. Room13 cargo is inside a deep sealed machine and travels on a motor, rather than being another hand-carried cube room. Room14 is a maintained pressure→light→transport circuit; room15 is an actual cargo-clearance and arrival interlock. All rooms have bounded floors, enclosing walls/ceilings and dark destination vestibules. North is −Z, east is +X. No victory condition asks for `usedBelt`, `usedLift`, a secret event count, a particular interchangeable cargo identity or a remembered earlier mistake.

## 12 · Inspection Pulse

**Mission:** Wait for the east shutter to open. Cross before it closes.

An enclosed glazed operations booth initially separates the player from a central waiting gallery. A linked pair between `booth-source` and `waiting-white`, both centred at local floor+1.55, provides actual portal navigation through the booth glass. Beyond the waiting room, two opaque shutters lead to separate dark east/west passages. Their clock displays expose a real repeating phase. `east-clock` is on during [0,7) of a14-second cycle; `west-clock` has offset7. The source neither invents a one-shot deadline nor requires rapid aiming. Each window lasts seven seconds; waiting is safe and the next cycle restores access.

The normal route uses the east open window and reaches `east-exit`. A plausible wrong attempt walks against the closed leaf, which must stay solid; the player can wait/return rather than be crushed or permanently fail. The native engine's safety holds a leaf for a body already inside a genuinely open aperture; touching a closed/partly blocked gate from outside must not open it. White hosts stop in the booth/waiting room, so portals cannot land behind the actual timed gates.

**Same-fixture change:** Wait for the west shutter to open. Cross before it closes. The opposed phase and west corridor are real, not a relabelled exit. The meaningful change is the named shutter/route; before retains its timing relation. A successful final state alone does not prove the learner consciously interpreted the time clause.

**Native contract:** two visible read-only timer bodies `[±1.2,1.25,4.5]`, size `[.8,1.2,.35]`, `kind:'timer',automatic:true,pulse:{period:14,onFor:7,offset:0|7}`. Timer's ordinary circuit flag is its exact id. Opaque leaves at x±4,z−2 have size `[3.2,3,.35]`, centre y1.5→5.0 and circuits `all:[<side>-clock]`. The timers pause their own phase only if an optional real power circuit disables them; no global-clock jump is assumed. Native events are `timer-open/close`; actual shutters already emit contextual motion cues.

## 13 · Return Belt

**Mission:** Reverse the belt before you switch it on. Use the west exit after the cube arrives.

A broad return room contains a sealed six-metre-deep cargo tunnel with a real roof, glazed sides and opaque end stops. The single original diamond cargo begins at the centre of a stopped belt. The two receiving plates are equivalent pressure inputs, wired separately to opposed west/east exit doors. The motor's default direction is east. Its `controls:'reverse'` switch changes actual supported velocity to west; neither a texture arrow nor a goal flag moves the cube.

The two controls are inside a closed operator booth. Walk around the tunnel end to the north viewing aisle z−4.5, shoot `booth-white` through the actual viewing glass and pair it with the outside south source. Enter that booth, reverse while stopped, power on, then leave by the same pair. An opaque cover hides REVERSE while the motor is on. A real fixed cabinet stand-off keeps a floor-level player out of the cover safety volume while leaving the eye-to-control ray clear. The small cover and cabinet still need interaction/safety abuse testing; no source inspection is counted as proof that all reach exploits are excluded.

Cargo travels to a flush .07m receiving plate at x−7.8. End stops hold it there, maintaining the west pressure and real door. Starting in the wrong direction visibly delivers east instead. Recover by stopping, reversing and restarting; the same cube must actually leave one plate and reach the other. Earlier wrong operation does not lock the correct exit. A corrected attempt is useful recovery evidence, not proof of an entirely correct first reading.

**Same-fixture change:** Keep the east direction. Switch the belt on. Use the east exit after the cube arrives. The starting direction now suffices and a different real receiving pressure opens the opposed door. Extra permitted exploration is not penalized.

**Native contract:** `return-belt` position `[0,-.15,0]`, size `[17,.3,6]`, speed1.5, direction `[1,0,0]`, circuit `all:['belt-power']`, controls `reverse`. Belt top0; plates x±7.8,y.07,z0 remain inside the native .12m belt support tolerance, so reversal can remove delivered cargo. The cargo centre starts `[0,.55,0]`. POWER `[2,1.25,5.7]`, REVERSE `[−2,1.3,5.85]`, both with front control offsets; actual cover at `[−2,1.5,6.35]`→y3 uses `not:['belt-power']`. Cargo remains more than the ordinary3.1m grab reach from the nearest front/rear standing position; no eligible portal host exists inside the machine.

## 14 · Pressure to Light

**Mission:** Put the cube on POWER before you connect the beam. Keep the receiver lit while the lift moves. Use the upper exit.

In an enclosed power plant, actual pressure on `power-button` enables the optical emitter. A configured but unlit portal pair is allowed: the actual energized receiver connection still cannot occur before power. This is a causal prerequisite, not a demand that the player place portals in a secret order. The near-side cube can remain on POWER while the player uses a linked pair to turn the emitted ray toward a real receiver in the rear plant. That receiver opens the physical observation access, powers the automatic service lift and opens the upper exit.

The receiving gallery is4.2m high and white bands end at3.1m, so a floor-aligned portal pair cannot bypass its vertical transport. The lift's own cycle advances only while actual receiver power remains; removing the cube or moving the beam brakes it in place. Restoring the same condition resumes its own phase smoothly. A missed boarding can wait for another automatic return. Native interruption/rider recovery remains to be checked on this fixture, even though the underlying11 mechanism already has lead-owned native tests.

**Same-fixture change:** Put the cube on POWER. Leave the receiver dark. Use west inspection. Keep the same real pressure, but offset the source portal from z9 to z11 so the emitted ray misses it. That offset pair can still transport the player to the rear lower room; `inspection-door` opens under pressure AND absence of `plant-light`. Upper/access/transport instead require `plant-light`. Both branches and circuits remain present. This is a physical optical choice, not a contradictory new after-instruction or a fabricated event requirement.

**Native contract:** emitter `[5,.9,9]` direction+X, circuit POWER; source wall x10.985, return north wall at x−5/z−13.985; portal centres y1.55. Actual return ray y.9 hits `plant-light` at `[−5,.9,−8.28]` before its solid housing. Automatic `plant-lift` size `[4,.4,4]`, lower `[6,−.2,−4]`→upper `[6,4,−4]`, top0→4.2, period4/dwell5, circuit `all:['plant-light']`, no manual E override or decorative call control.

## 15 · Cargo Clearance

**Mission:** Send the cube east before you cross. Keep the beam clear while the platform moves. Use the east exit.

The cargo machine now shares an actual optical clearance path with a rail shuttle. The original sealed cube initially blocks a low ray across the belt. Both glazed sides have genuine .8×.8m air apertures; glass stays a real native optical occluder. No beam passes magically through intact glass. The tunnel remains six metres deep, so these low slots do not grant ordinary grab reach or allow cargo/capsule escape. End stops and flush plates are the same recoverable belt family as13.

Set the near-bank source/return portal pair, then run the belt east. Movement first clears the ray; **departure still waits for real end-receiver pressure** as well as `transfer-light`. The automatic shuttle therefore cannot depart merely because the cube moved a little or an earlier input was recorded. Maintaining both conditions advances the shuttle's own physical cycle. Reversing the belt removes delivery pressure and brakes transport until a real new delivery is complete. Blocking/reconfiguring the ray likewise brakes; restoring it resumes without a jump.

Only near-bank walls are portalable. The far bank has dark exit vestibules and is separated by a ten-metre span; the4m deck translates six metres between dock contacts. Its guide rails sit below−1.8m, beyond the native1.125m nominal jump height back to bank0. A bounded catch floor and actual .2m-rise stairs return only to the near bank. The side-specific receiving pressure opens the corresponding real exit door on the far bank. Correcting direction and waiting for an automatic return are genuine recovery; normal-input proof must still test both sides and a mid-span interruption.

**Same-fixture change:** Send the cube west before you cross. Keep the beam clear while the platform moves. Use the west exit. Reverse the actual motor; the same cube moves to the other plate, clears the same ray, powers the same shuttle and opens a different real destination. No ride/crossing history check is needed.

**Native contract:** `clearance-belt` `[0,−.15,7]`, size `[17,.3,6]`, same velocity/control behavior as13. Optical slots at z3.9/10.1, x±.4, y.3..1.1. Emitter `[−5,.65,12]` shoots west into source `[-10.985,1.55,12]`; south return `[0,1.55,13.985]` sends its low ray north into `transfer-light` `[0,.65,3.43]`. Actual emitter/receiver housings sit behind these poses. `clearance-shuttle` size `[4,.4,4]`, near `[4,−.2,0]`→far `[4,−.2,−6]`, automatic cycle period5/dwell5, circuit `{all:['transfer-light'],any:['east-receiver','west-receiver']}`. POWER/REVERSE are visible switches on the near bank; there is no riding console.

## Retrieved language and bounded claims

[Workbook: G8 chapter11, connectors and time clauses](https://english.workbook.co.il/grade-8/chapter-11/connectors-and-time-clauses) was already freshly saved by the lead as `docs/curriculum/grade-8_chapter-11_connectors-and-time-clauses.md` and was retrieved/read again through the connected public Workbook `get_page_markdown` during this draft. It explains before/after as event order and while as overlap. Its examples also distinguish clause order from event order and do not make a time word determine every verb tense. All four game missions are original situated examples, not quotations or source-provided exercises. No invented URLs, practice-generation services or paid accounts were used.

This batch practices short practical interpretation of order and maintained conditions. It does not claim mastery of tense selection, free clause writing, punctuation, the entire connectors topic, until, grades7–9 or complete chapters10–12. **Until is not introduced here:** that selected module does not explicitly teach it. Source grade is internal provenance only. Correct puzzle states can also be discovered physically, so success is not by itself independent proof of language comprehension or retention.

## Targets generated and inspected before new families

All new images used built-in imagegen; exact normalized prompts are saved beside them. These are construction targets, not gameplay/screenshots or native completion evidence. No paid external model/image/audio service was used.

- `targets/sequences-shutter-12.png`: one enclosed first-person frame; accepted two real opaque gates, overhead storage, clear safe waiting floor, original-scale glazed booth and compact read-only phase display. The image's handheld silhouette is rejected; existing runtime projector remains authoritative.
- `targets/sequences-belt-13.png`: accepted original diamond cargo, glazed deep tunnel, full roof/end stops, compact POWER/REVERSE controls and an actual cabinet cover. Perspective does not set source dimensions; final flush plate/waist stand-off coordinates are explicit above.
- `targets/sequences-transfer-15-rejected-optics.png`: preserved rejected first output. Its along-belt beam would remain blocked by delivery and its round portal housings are not our runtime design. It is not an implementation reference for optics.
- `targets/sequences-transfer-15.png`: targeted built-in edit was displayed/inspected before15 geometry. Accepted substantial bounded deck, rail well, return stair construction, original diamond cargo and perpendicular front-to-back cargo obstruction. Source, slots and receiver positions above are authoritative; no optical ray follows decorative wiring or passes through solid glass. The exact edit prompt is `sequences-transfer-edit-prompt.txt`.
- Room14 reuses the already inspected `docs/chamber-targets/laser-lift-target.png` pressure/optics/automatic-lift construction family, independently viewed again before14 geometry. Its circular cargo face and image room number are rejected; source uses the existing original diamond module and correct room14. It adds no new machine appearance.

Art received the new target paths and timer/conveyor/shuttle contracts before implementing shared appearance. Shared scene/engine/registry files are not owned by this draft.

## Pending verification

Strict isolated TypeScript checking passed for `sequences.ts` with ES2022/Bundler/DOM settings. The lead requested no new browser/native-render QA while the workstation is under manual review. All earlier audio-probe browser contexts were closed. **No new native physics or normal-input tests for12–15 have been run.** Structural source review is not completion proof. Before registration, check finite/unique solids, exact host bounds, initial phase states, all full-support apertures and actual sightlines, opaque closed-gate collision/safety, both recurring windows, real belt end-to-end/reversal/pressure, reverse-cover E reach and safety, beam occlusion at every slot/housing, live interlocks, loaded shuttle/lift motion and interruption recovery, return stairs and absence of portal/jump bypasses. Then test correct, recoverable wrong and same-fixture changed instructions through ordinary public mouse/keyboard on a frozen build, with console/audio state and inspected screenshots. Preserve unsuccessful attempts honestly. There is no50-room completion claim.
