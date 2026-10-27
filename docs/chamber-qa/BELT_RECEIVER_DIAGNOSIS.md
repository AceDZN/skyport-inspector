# Draft13/15 belt receiving-pad diagnosis

**The current0.07m-high pads reproduce both delivery failures. An isolated flush-at-belt-top candidate passes both delivery/reversal contracts.** No runtime fixture, engine, support tolerance or body pose/velocity was edited by QA. These are unregistered native machinery labs using the real power/reverse API, not browser routes, instruction-comprehension results, saved unlocks or completed rooms. The frozen ten-room review/build is separate.

The parent's `authored-belt-probe.mts`, `authored-belt-result.json` and `AUTHORED-BELT-FINDING.md` in the read-only `idea-plotter/reports/rift-platform-contracts` directory were inspected first. The independent lab reproduces their original authored spawn/cargo and60s east-delivery timeout at120Hz. `belt-contact-lab.ts` reads the actual current native manifolds, solver contacts, cube quaternion/support extent and conveyor eligibility. `belt-receiver-regression.test.ts` retains strict east delivery, maintained pressure, stop/reverse/restart, west delivery and old-pressure release assertions.

## Measured baseline sequence

Both rooms stall atX≈6.427/Y≈0.670. Native receiving-pad pressure never arrives within60s, so no west-reversal run is claimed for the baseline. Real belt/floor contact continues during the stall; this is not an observation based only on the proxy grounded flag.

At13.8167s the first pad manifold exists with positive contact distance≈0.0167m and zero impulse: that is predictive contact, not yet a blocking force. By13.8500s the pad manifold applies an actual horizontal blocking impulse≈3.30 while the belt/floor still have solver contacts. Cube upward velocity≈0.1567m/s makes the engine's approximate grounded flag false, so its conveyor drive returns zero even though the unrotated gap is then only0.0014m. The first loss is therefore the vertical-velocity grounded predicate, before the0.12m gap limit.

The cube subsequently rotates against the raised cylinder rim. In draft13 at60.8s, actual centerY0.670002 and oriented vertical support0.670074 put the true lower extent at−0.000071m, essentially on belt top0. Native belt/floor manifolds each retain two solver contacts. The unrotated calculation instead reports0.120002m and removes drive. Draft15 oscillates around the same boundary; its final sample can still request drive while the pad's oblique collision normal blocks progress. This supports a raised-rim/tilt interaction combined with approximate drive eligibility, not a claim that widening one tolerance alone would fix it.

A native forward ray at beltTop+0.035m sees the raised receiving cylinder as the first low obstruction. Its physical top is0.07m: cylinder half-height0.07, centerY0. This profile ray is explicitly a low horizontal obstruction measurement, not a full-cube swept-volume certificate. Native manifold points, normals, impulses and solver-contact distances supply the separate actual collision evidence.

## Isolated source-geometry candidate

Only the authored receiving-pad Y changes from0.07 to0. Belt top stays0; physical pad half-height/radius remain0.07/0.96, so its center becomes−0.07 and its top becomes0. The real sensor location follows that same authored pad. The engine's0.12m support criterion, grounded calculation, force/velocity logic, cargo and all other geometry remain unchanged. This is a geometry fork returned by a fresh blueprint; no live body is assigned a new pose.

| Native contract | Draft13 flush candidate | Draft15 flush candidate |
|---|---:|---:|
|East receiving arrival, including1s settle|16.8s|16.8s|
|East pressure over subsequent2s|240/240 frames|240/240 frames|
|West arrival after real stop/reverse/restart|51.6s total|53.1s total|
|West pressure over subsequent2s|240/240 frames|240/240 frames|
|Old east pressure released|True|True|
|Final west/east door progress|1/0|1/0|
|Respawns / completion result|0 / null|0 / null|

The flush candidate still has a small transient native contact/drive interruption near the cylinder edge; it is not described as perfect contact. It recovers and delivers with near-level cargo rather than developing the sustained0.12m apparent gap. At the0.035m ray height the first obstruction becomes the authored end stop, rather than the receiving pad. Final oriented lower extent is approximately−0.00010m with actual upward pad-support contacts and positive bearing impulses.

## Evidence and scope

`belt-receivers-first-run.txt` and `belt-receivers/first-run/` preserve the first comparison. That original maintenance check sampled pressure at the end of2s. QA then strengthened maintenance to require every native frame and reran into a separate directory: `belt-receivers-strict-pressure.txt` plus `belt-receivers/strict-pressure/{13,15}-{baseline,flush}.json`. The strict run has two preserved baseline failures and two passing flush candidates. It does not hide intentional failures behind a global all-pass count. Original raw manifold samples are retained, including predictive positive-distance contacts.

Lead fixture integration and a pure actual-fixture replay remain separate decisions. The complete control-access/order procedure in13 and optical connection/shuttle/exit route in15 still need authored-route and browser checks. QA made no runtime edit, rebuild or browser run and explicitly released the native slot after the strict comparison exited. This later unregistered work does not hold the ten-room review or imply fifty-level completion.
