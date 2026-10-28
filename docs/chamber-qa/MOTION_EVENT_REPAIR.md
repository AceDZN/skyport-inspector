# Continuous motion and render remainders

The source repair passes7 focused contracts and208 affected integration contracts. The preserved xpj browser build has the original defect. The later frozen BMw ordinary-input C11 replay now verifies the repair: actual loaded beam-off braking holds its pose for700ms, restoration resumes, and the only brake is that deliberate power loss. Three actual arrivals and four motor starts correspond to the real trips; no former chatter remains. See `twenty-parent-review/` and `TWENTY_CHAMBERS.md`.

## Actual failure and cause

The independent ordinary-input room11 completion on xpj retained55 `lift-motor`,54 `lift-brake`, one receiver-power and one actual arrival in its final event window. The loaded deck continued to ascend while powered. [The read-only extracted checkpoint](motion-events/parent-observed.json) binds that observation to the parent manifest and exact scripts. The parent report remains authoritative for its completed11–15 routes; this observation is an audio/motion-state defect, not a failed completion.

The previous render loop split each frame into120Hz slices and a final fractional slice, however small. Machine movement used a fixed distance threshold of0.0001m per update. A continuous1.13m/s motor therefore appeared stopped during sufficiently short positive slices, then moving during the next normal slice. Zero elapsed updates could also invent a brake. Audio throttling reduced the sound rate but did not correct those false events or displayed motion state.

The actual pre-repair `MachineSystems` reproduces270 false motor/brake pairs under alternating1/120s and1µs positive steps with power continuously present. The same final focused test source passes5/7 against that byte-exact snapshot and7/7 against the repair. The two baseline failures are continuous tiny-step motion and a zero-time update; the new fixed-clock controls are independently scoped. The first six-contract diagnostic remains separately preserved.

## Repair and checks

The core render loop now retains fractional elapsed time in `FixedStepClock`, passing only1/120s ticks into physics. Its remainder carries across frames; pause/new-room release clears old input time. There is no tiny leftover physics call. The existing maximum advance cap remains8s.60Hz-like,144Hz and mixed cadences preserve total elapsed time to within one tick.

Machine motion classification now compares displacement with elapsed time, using a1µm/s numerical threshold. Nonpositive/nonfinite machine updates do not advance time or invent state transitions. The repair changes no native body pose/velocity setter, portal transform, collision geometry or temporary carrier-query behavior. The208-contract integration includes the original carrier/cargo/portal/query regressions and the prior partial-entry repair.

The focused powered-cycle case emits one motor event and no false brake. A separate actual power interruption stops at the current pose, emits one real brake, resumes with a second motor event and reaches one genuine arrival. Arrival time/position remains phase-driven; there is no delayed event debounce, hidden timer jump or muted-event workaround.

Identity: [motion-event-repair-source.json](motion-event-repair-source.json) and [byte-exact baseline provenance](motion-event-baseline-source.json). Logs: [unchanged final baseline5/7](motion-events-baseline-final.txt), [fixed7/7](motion-events-fixed.txt), [integration208/208](motion-contact-integration.txt). Per-case event/position traces are in `motion-events/baseline-final/` and `motion-events/fixed/`.

Run `tsx --test --test-concurrency=1 tests/core-fixed-clock.test.ts`. An explicit `RIFT_MOTION_RUN` preserves a named report directory; ad-hoc runs write under ignored work. To reproduce the preserved class baseline, set `RIFT_MOTION_SYSTEMS_SOURCE` to the absolute byte-exact snapshot path in the provenance manifest. Its two failures are expected. The subsequent BMw ordinary-input lift/travel/power-brake replay and its exact main/audio hashes close the observed browser chatter outcome. This is event/cue scheduling evidence; subjective human acoustic audition and the eventual full50 campaign remain separate.
