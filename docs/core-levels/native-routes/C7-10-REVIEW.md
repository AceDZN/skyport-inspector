# Native7–10 review · resolved native routes, not browser proof

**Current result: the bounded Z-flight revision passes C7 five/five, then the full6–10 file passes22/22 in one serial run.** Logs `C7-Z-flight-replay.txt` and `C6-10-full-22.txt`. Both processes exited0 and the current native slot was explicitly released to lead/QA. No browser/build was run.

The first explicitly granted serial job ran18 cases and exited1 with15 pass/3 fail. Raw log: `C7-10-first-run.txt`. A diagnostics-only replay preserves the same three failures in `C7-10-failure-details.txt`; no body/machine/goal state was injected. The two recipe corrections below pass in `C7-10-affected-replay.txt`. The intermediate authored west-aisle/end-approach revision still failed catch recovery (`C7-west-aisle-replay.txt`,4/5 pass), so the conditional full22 was correctly withheld then. These earlier records remain unchanged; the eventual green result follows changed real carpentry, not an erased failure or weakened assertion.

Passed in the initial run: all four same-fixture checks; C7 north base, east contrast and actual wrong-east→return→north recovery; C8 real held and loose freight transit plus lower contrast; C9 either individual cube and the first both-button assignment; C10 stairs base and lift base. These are native routes, not public browser completion or curriculum mastery.

## C9 swapped assignment: corrected navigation, same physical assertions

The direct second-cargo approach crossed the first cube's occupied pad. Actual failed state: cube-a was at `[−10.308,.844,6.399]` rather than west-button-b `[−1,.14,5]`, with contact speed11.8585 recorded; cube-b correctly pressed west-button-a, while west-button-b was false and WEST stayed shut. No failure was attributed to the AND circuit. The corrected route goes through the clear south aisle `[4,8.8]` before approaching the second pad. It explicitly asserts the first actual pressure remains pressed; the same release/AND/open/removal/replacement/exit requirements now pass. No cargo repositioning or relaxed identity/pressure test was added.

## C10 SIDE: corrected mechanical waiting, same full-open requirement

The first check ran .15s after actual docking. Native state had `at:service-lift:upper=true`, the stopped deck at y4.05 and SIDE active/opening at progress.1875. The player remained on fixed lower floor, no ride occurred and the unrelated cube stayed at spawn. The corrected recipe waits for the real leaf to reach progress>.95 before asserting/crossing. The full no-ride parking→stairs→parked deck bridge→SIDE path passes. No stop flag or leaf position was written.

## C7 catch stairs: measured authored blocker

Original22-step geometry (.26m treads/.2m rise) stopped at player `[−13.463254,−3.096647,3.999741]`, grounded with desired vx4.8. The next native contact was `catch-return-step-2`, witness `[−13.1999998,−3.79999995,3.99991]`, normal `[−.891018,.453967,≈0]`; applied dx was.0000965 against requested≈.04. KCC offset=.0149999997, minWidth=.25, maxHeight=.230000004. Diagnostics-only log: `C7-stair-contact.txt`.

The lead then changed only the authored stair loop to20 .29m treads/.22m rises, keeping x bounds[−13.8,−8], width2.5/z4 and the same return route. The unchanged catch test still fails, now on its first south-side entry at player `[−13.680013,−3.484672,5.517166]`. Contact `catch-return-step-0` has witness `[−13.680026,−4.180023,5.250010]`, normal `[≈0,.426195,.904632]`; requested dz≈−.04 yields only−.0001086. The west wall's inner face isx−14, leaving .2m before the first tread, smaller than capsule radius.28+offset.015; lateral overlap with the next riser may combine with the near-limit .22 rise. These observations do not by themselves isolate one KCC formula.

At that failed stage, no jump, respawn, alternative hidden path, actor reposition or assertion change was used. Runtime geometry remained lead-owned. A smaller-rise/broader-entry authored revision was suggested; C7 could not then be labelled a full route pass on the basis of its other successes alone. The final accepted native revision is recorded below.

## West-aisle revision: actual end approach, still insufficient tread landing

The lead added a real west aisle: basin xmin−15, west wall−15.2 and matching enclosing ceiling/walls. The recovery navigation alone changed from south-side entry to `[−14.2,5.7]`→`[−14.2,4]`→hub. This deliberately uses the new actual aisle; fall, grounded basin, no jump/reset and complete return requirements were unchanged. The same revision adds real NORTH/EAST shutters driven by their actual dock contacts to prevent the newly discovered east-deck→north-dock running-jump shortcut. Both missions keep identical hardware/wiring.

All four C7 equality/base/contrast/wrong-restore cases pass with those physical shutters and ordinary leaf travel. Catch recovery now enters from the west but stalls at `[−13.754416,−3.224653,4.000198]`, grounded, on `catch-return-step-1`. Witness `[−13.509965,−3.95995,4.000115]`, normal `[−.830548,.556947,0]`; applied dx.000128 of≈.04. That intermediate source still had20 .29m/.22m treads. This demonstrates that end clearance alone was insufficient; minWidth plus controller skin cannot by itself establish safe tread dimensions around the rounded capsule. A wider-tread/smaller-rise staircase along the available Z volume and a real top landing was proposed to the lead, but no such correction was applied by this review. Preserve all three failed geometry stages rather than replacing their records with the later successes of unrelated routes.

## Final bounded Z-flight: genuine return succeeds

The lead accepted and authored22 .60m-deep/.20m-rise treads, width2.5 atx−12.5, running fromz−9 to4.2 inside the existing enclosure. A real top landing x[−13.75,−7.8],z[3.6,5.2],top0 meets the hub. Its south limit5.2 preserves the original deliberate fall atz5.8. The existing expanded west aisle reaches the low north end. Actual dock shutters remain wired to stopped-at-dock signals under both missions.

Only recovery navigation changes: original fall/grounded basin, then `[−14.2,5.7]`→`[−14.2,−9.5]`→`[−12.5,−9.5]`→`[−12.5,4.4]`→`[−7.5,4.4]`, then NORTH. No jump, respawn, altered controller, actor movement injection or relaxed grounded/exit assertion is used. This actual catch→aisle→flight→landing→hub→exit route passes; the other C7 cases also pass with their unchanged normal routes. The subsequent full22 run includes the C9 aisle and C10 real-door-wait corrections and passes every equality/base/contrast/alternative/recovery check. Independent shortcut testing and public browser proof remain separately owned by QA/lead.
