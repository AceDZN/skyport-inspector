# Independent stationary-deck candidate audit

**The guarded query repair now passes145/145 pure integrated native checks.** The earlier persistent Fixed representation was rejected because it sank and tilted cargo; its failing evidence remains below. The accepted source behavior changes type only temporarily inside the player KCC query, after both planned movement and native velocity are zero, then restores the exact original type before held motion and physical integration. The lead integrated it; QA made no runtime source edit, build or browser run. The frozen1nG browser evidence is separate. Tests ran one job at a time with test-concurrency1.

`stationary-deck-candidate.ts` imports the actual runtime CoreWorld and intercepts only carrier body types/setters. The unchanged machinery8, optics4 and seam4 copies replace import paths only. Their source SHA256/provenance is in `stationary-deck-audit/unchanged-import-provenance.json`; test bodies and assertions are preserved.

## Results and stopping conditions

| Wrapper variant | Actual run | Outcome |
|---|---|---|
|Fixed at zero actual deck delta, kinematic while moving; type setter each step|Existing machinery8 + optics4 + additional8|16/20. Existing12, strict moving-deck jumps, repeated horizontal cargo and portal/query checks pass. Cargo4 fail.|
|Type setter only when type changes|Previously failing cargo4 + unchanged seam4|4/8. Seam4 pass; cargo4 retain identical failing maxima. Full audit not repeated.|
|Intercept carrier next-translation setter; unchanged target transitions once to Fixed and skips native setter; changed target transitions to kinematic before original setter|Cargo4 only|0/4, identical failing maxima/poses. Stopped before seam/full rerun as requested.|
|Unchanged runtime baseline with the same read-only metrics|The same cargo4 histories|Cargo penetration stays within bounds at the matched prefixes; held case completes two up/down cycles. Three other baseline tests stop on the candidate-specific expected Fixed-type assertion, so their full repeated-cycle completion is not claimed.|
|Query-only temporary Fixed without native-velocity guard|Same-pose1 + seam4 + loose4|3/9. Resting same-pose query frees motion, but stop/brake type changes erase residual native velocity; exact-state assertions stop six cases before physical integration.|
|Query-only temporary Fixed with actual-zero-velocity guard|First-stage9, then full isolated25 once|9/9 and25/25. Native state remains exact and all physical cargo/jump/query bounds pass.|
|Pure integrated source; metrics-only wrapper, no candidate behavior|Original seam4 + registered84 + save29 + machinery8 + optics4 + held-footprint8 + additional8|145/145. Source hashes unchanged across the run; no native state violations.|

Evidence: `stationary-deck-audit/results.txt`, `transition-first.txt`, `skip-next-first.txt`, `candidate-detailed-results.json`, `baseline-detailed-results.json`, and `skip-next-first-results.json`. The original failed runs remain preserved. The unchanged cargo penetration bound is0.035m; it was not loosened.

## Cargo failure attribution

Penetration uses the cube's actual quaternion to project its full vertical support. At each maximum the report includes native deck rigid current/next translation, native body type, planned position/previous/delta, native cube current/next pose, quaternion, actual movement and velocity. Planned and native deck tops agree to less than0.00000005m, ruling out a measurement against a planned future deck pose.

| Scenario | Candidate maximum | Baseline maximum at observed history | Candidate maximum frame |
|---|---:|---:|---|
|Loose vertical cargo|0.052782m|0.000673m|t0.500s, initial stationary Fixed dwell, before first ascent. Cube centerY0.524692, oriented vertical support0.577474; actual bottomY−0.052782.|
|Held vertical cargo|0.051257m|0.020438m|t3.692s, final ascent step; actual/native deck deltaY0.020. Cube centerY3.519399, support0.570656. Tilt was already inherited from initial dwell.|
|Loaded vertical midrail brake scenario|0.082777m|0.000610m|t0.700s, initial stationary Fixed dwell before movement, rather than the later brake. Cube centerY0.512688, support0.595465.|
|Loaded horizontal midrail brake scenario|0.082777m|0.000652m|Same initial dwell pose and maximum as the vertical case.|

The type-transition-only and skipped-stationary-next variants reproduce these maxima and poses bit for bit. Thus neither redundant body-type assignments nor the stationary kinematic setter is sufficient to explain or repair this live-contact conversion failure. The evidence narrows it to behavior associated with the tested transition into Fixed, but does not establish an upstream engine cause or prove a different construction/update strategy unsafe.

The planned three-cycle loose test stops after the first ascent when checking the accumulated failure; the held candidate stops after its first ascent. Their names state the intended contract, not completed coverage. The midrail scenarios similarly stop at the preserved prior-dwell penetration assertion before restart validation. Existing weaker brake tests pass, but cannot substitute for these stricter cargo checks.

## Passing motion and query evidence

The existing machinery8 and optics4 pass under the first candidate without assertion changes, including actual authored11 base/contrast routes and optical power interruption. They are native fixtures, not public-input chamber wins.

At120Hz, both added active-deck jump cases remain airborne for all36 initial frames. Relative foot/deck separation grows on each of the first12 frames by more than0.015m; at0.25s it is0.708433m for vertical lift and0.998433m for horizontal carrier. Both subsequently land without reset. This establishes actual detachment in these fixtures, rather than merely recording a jump event; it does not claim platform-velocity inheritance.

Repeated horizontal loose cargo completes12s/two full cycles with10 actual type transitions, maximum relative drift0.157199m, maximum cargoX4.636127m, cube speed1.614312m/s, cube step0.013423m and oriented penetration0.030848m. It remains on the usable deck.

The native portal/query scenario confirms stationary and moving carrier colliders both obstruct actual Rapier rays, neither becomes an invented portal surface, an occupied destination blocks player crossing, and clearing the deck permits the same pair to cross with native/proxy agreement. Its largest coordinate step0.265111m is a blocked-portal entry rollback, not carrier transport. Portal mappings are excluded from mechanical maximum-step metrics; this rollback is reported separately.

Across the failed cargo prefixes, capsule deck penetration is zero and maximum ordinary player step is0.020m; loose cube step peaks0.019810m and loose speed2.397514m/s. The held fixture's abrupt pickup/settle peaks8.813331m/s and step0.073518m; its measured settled ride before stopping peaks1.198800m/s. The speed assertion applies to the settled ride and was not expanded to excuse the penetration failure. Full metrics and jump traces are in `stationary-deck-audit/additional-results.json` and per-variant detailed files.

## Guarded query repair and integrated validation

The first query-only attempt isolated the KCC effect at the naturally stalled pose: unchanged geometry produced zero motion/20 floor hits in the normal query, then the full0.04m requested horizontal movement and0.0001m upward native nudge/one floor hit while temporarily Fixed. Neither result was applied. However, converting a stopped deck with residual native velocity into Fixed zeroed that velocity even after restoring its type. Exact-state assertions caught manual arrival2.399997m/s, vertical brake1.000006m/s and horizontal brake1.333337m/s becoming zero. These are invariant failures, not another cargo sinking result; cargo penetration stayed below0.0007m through the observed prefixes. `query-first*` preserves those failures.

The final guard requires planned delta exactly zero and actual native linear/angular speed at most1e−8. The first arrival/brake query with a prior velocity follows the original kinematic query; after physics naturally computes zero velocity, stopped queries can substitute Fixed temporarily. No velocity restoration/write, actor relocation, geometry edit, nudge change or desired-delta modification is used. Original types are restored in finally before the held query and physics.step. Moving bodies always keep the ordinary path.

The only assertion adaptations for this distinct representation are explicit: rest type expects KinematicPositionBased outside the query; repeated mechanical phases are counted as actual move/stop transitions rather than persistent body-type transitions. All physical penetration, displacement, speed, airborne, drift, route and repeated-cycle assertions/histories remain unchanged. Same-pose plus seam4/loose4 passed9/9, then the complete isolated audit passed25/25 (`query-still-first.txt`, `query-still-full.txt`).

The lead then integrated the exact guarded behavior. The pure integrated audit imported the real runtime for all original tests and used the wrapper only for read-only metrics/invariants in additional8. It did not apply the candidate override a second time. `integrated.txt` records145/145: original seam4, registered84/save29, machinery8/optics4, read-only held-footprint8, and additional8. Every held query and actual physics step sees the original KinematicPositionBased carrier type. Native current/next pose, linear/angular velocity and requested delta match exactly before/after the integrated helper, with zero violations. `integrated-source-before.json` and `integrated-source-comparison.json` record unchanged source/wrapper hashes across the run.

Integrated maximum loose penetration is0.000692m; held penetration is0.020438m, matching the baseline final-step effect and staying below the unchanged0.035m bound. Settled held ride peak is2.418336m/s; its separate abrupt pickup/settle peak8.725933m/s is retained rather than hidden. The three real loaded up/down cycles complete with12 mechanical phase changes; loose speed peaks2.397619m/s and ordinary player step0.020m. Repeated horizontal drift is0.118584m, cargo step0.013344m and speed1.602229m/s. Strict moving vertical/horizontal jumps retain0.708433m/0.998433m relative clearance at0.25s and36 airborne frames. Capsule deck penetration is zero in these scenarios. Full native poses and traces are in `integrated-results.json` and `integrated.jsonl`.

The native seam regression is closed in these tested source fixtures. New-build normal-input machinery review remains outstanding; this is neither browser proof nor fifty-level completion. All QA native jobs are closed and the slot was explicitly released to Audio's queued C6-only run. No QA runtime source edit or build was made.
