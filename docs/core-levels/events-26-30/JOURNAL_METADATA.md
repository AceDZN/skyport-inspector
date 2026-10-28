# Read-only event metadata, 26–30

Added only `CoreLevel.journal` to the five level entries, under the lead’s exact `JournalConfig` API. No fixture/circuit, native body, observer implementation, event producer, audio event, goal, save, registry, renderer or public bundle was changed. The module hash at the first metadata-bearing native run is `9b97067f6ca51003721fbbd02e5f37192d1309ee256851452b96bba98054412c`; full source digests are in `initial-28/source-digests.json`.

| Room | Watched real IDs and product labels |
|---|---|
|26|`gate-a` → A (shutter), `gate-b` → B (shutter). Actual `test-power` switch ON→OFF is configured in `tests` as TEST over those two gates; it is not mislabelled as a pressure sensor.|
|27|`cargo-hatch` → HATCH, `inspection-door` → INSPECTION DOOR (shutters); `cargo-light` → RECEIVER (light); `power-pressure` → POWER, `lift-pressure` → LIFT (pressure); `reuse-lift` → BALCONY LIFT (dock).|
|28|`store-receiver` → STORE, `service-receiver` → SERVICE (pressure); `store-carrier` → STORE CARRIER, `service-lift` → SERVICE LIFT (dock).|
|29|`link-lift` → LINK LIFT (dock), with actual LOADING/TRANSFER/INSPECTION poses.|
|30|`gallery-light` → GALLERY RECEIVER (light); `cargo-access` → CARGO ACCESS (shutter); `gallery-pressure` → GALLERY, `service-pressure` → SERVICE (pressure); `reconnect-lift` → GALLERY LIFT (dock).|

The largest configuration has6 NOW rows, below the8-row cap. Every ID refers to an actual authored device, pad or optical receiver. No fabricated cargo history, report accepted flag or reported-tense circuit input is added.

Lead’s source producer/UI is now implemented but was unbuilt at this handoff. Lead reported13 pure/native journal contracts and strict test-source compilation passing, including observer-disabled baseline parity: body/machine/ray/audio events match. The producer uses actual native shutter pose/rest, native stopped docks, fresh native contacts/rays and empty new-attempt baseline history. It keeps NOW separate from bounded history, and marks missing/truncated/reset negative intervals UNKNOWN. Optional N/LOG pauses the game. This author did not change that implementation or independently certify every readout claim; actual metadata-specific journal/public-input review remains separate from physical route proof.

E26 corrected4/4 and E27 first4/4 were recorded before these metadata additions. E28 first5/5 runs with the read-only configurations active and preserves the new core/module hashes. These results do not substitute for browser integration, actual past/current language observation or all50 campaign acceptance.
