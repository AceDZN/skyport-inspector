# Isolated common stationary-machine query comparison

Status: the common candidate passes the five scoped authored native checks. Four of five separate synthetic guard units pass; the tiny-angular setup produced zero native angular velocity and failed before the candidate query. Full affected integration, invoked held-cargo restoration, build, and new-browser acceptance remain pending.

The active runtime and served v3 were untouched. Baseline World SHA is `e04f8690ddfb9306c9602a25a104b5e47dbe6829b937cf53da82debf52be3d94`; isolated candidate World SHA is `19db676a53b8111a4220967f0a4d956b61e0c998af60d80bee61b8236afc83e1`. The candidate removes the machine-kind whitelist and temporarily uses Fixed only for planned-zero-delta native kinematic bodies whose current and queued translation/rotation match exactly and whose linear/angular components are exact positive zero. Original native type is restored in finally.

| Authored check | Original v3 | Common candidate |
| --- | --- | --- |
| C12 timer, four unchanged one-second outward inputs | Earlier locked feedback baseline failed two directions | 1/1; all four clear, grounded, zero jump/reset |
| C34 inactive TEST switch | A 1.7142 m, S 1.7062 m; pass | A 2.1003 m, S 1.9275 m; pass |
| C34 fully closed latch leaf | A 0.1921 m, S 0.00465 m; pinned | A 3.2483 m, S 1.9072 m; clear |
| C1 closed EXIT, W600 then S400 | S 0.000043 m; pinned | S 1.45466 m; clear |
| C13 inactive BELT POWER, W600 then S400 | S 0.000760 m; pinned | S 1.48336 m; clear |

The C1 test uses the authored spawn, never presses the button, never touches the cube, and places no portals. C13 uses the actual aimed walking pair into its control booth and never presses E. C34 uses its authored spawn and actual walking pair; TEST remains off, and the subject leaf remains fully closed. All four class checks retain solid-contact, clearance, grounded, zero-jump/reset, and exact crossing assertions. No authored pose, velocity, machine clock/state, collider, history, goal, or save writes were used. These are native checks, not browser-play proof.

The rotation-aware observer checks all machine bodies before/after character queries and before actual held/native integration. It records current and queued translation and quaternion, native type, linear/angular velocity, actual inside-query types, and portal-placement state. The common class run observes 3,666 character queries and 3,666 restored-before-physics checks with zero violations. The C12 companion observes another 1,688 actual character queries and restored-before-physics checks with zero timer-state violations. Its earlier timer-only observer does not record quaternions; the four-class observer does. **All selected authored controls invoke zero held queries. Installing a hook is not held-state evidence.** Existing authored C24/C26 held routes are the planned next coverage.

The separate synthetic units are explicitly not authored play: eligible stationary switch, queued translation, queued rotation, and actual tiny residual linear velocity pass. Queued translation and rotation actually integrate afterward to the queued destination. The fifth unit's yaw `1e-12` prior native step produces an actual changed quaternion but native angular velocity zero, failing its setup guard before querying the candidate. It proves no angular-residual exclusion. Preserve this first result; use a separate clearly labelled angular safety case rather than changing its historical outcome.

Each job receipt stores the exact command, environment selectors, working directory, exit code, elapsed time, and 127 before/after source hashes. All source locks and active-original hashes match. The first expired compiler session left an empty `baseline-classes-first/strict.txt` with unknown completion; it is not counted. The separate `strict-confirmed-job.json` explicitly exits 0. Candidate `common-timer-first/strict-job.json` exits 0 for all three selected test files, and that exact-byte receipt is reused for class/guard native jobs. Compiler and native phases are serial.

The first class-observer false positive remains under `stationary-control-classes-v3/baseline-first`: it compared legitimate post-integration moving leaves against stale pre-integration snapshots. The corrected interval observer retires that snapshot only after native physics returns while retaining exact before-held/before-physics checks. No production change addressed that test-only boundary mistake.

`RESULT.json` indexes measurements and job receipts. Original logs, trajectories, snapshots, first setup failures, and source copies remain intact. Isolated source roots are `work/chamber-qa/stationary-common-validation/{baseline,candidate}/sources`; `run_phase.py` reproduces selected jobs with unique evidence roots and enforced locks. No broad suite has run in this phase.

## Approved angular follow-up

The separate `common-angular-finite-first` case is strict 0 / native 1/1. It queues a finite `1e-3` rad native rotation, performs a real physics step, then queues the observed current quaternion as the stopped destination. Actual prior angular velocity is `0.11999998241662979` rad/s. Current and queued T/Q match before the query; the body stays Kinematic during it and all T/Q/queued T/Q/v/omega are exact afterward. The next real native integration preserves the stopped pose and naturally clears omega. This synthetic guard is not authored play. Original `common-guards-first` quantization setup failure remains intact.

Full required integration is recorded separately under `../common-full-required-complete-first`. Its initial all-49 strict attempt under `../common-full-required-first` exited 2 because the isolated copy omitted the existing belt helper and two unchanged legacy tests have strict null/never diagnostics. That outcome remains intact. The complete source follow-up copies the exact helper, leaves historical tests unchanged, and strictly checks the new observer/helpers/narrow tests before the full native execution.
