# Independent physical fixture pre-flight audit

All50 exported physical drafts were inspected against base/contrast/alternative goals. This is **not** a campaign playthrough or verified completion claim. Tests intentionally fail on missing fulfilment; fixture files were not edited by this helper.

Export version: base campaign-physical-draft-1, upper 2 (runtime override priority). Base SHA256: 9f44138e08910e7f500398b8be67590c9d370c21631103b4d7715f43d4efa22b; upper SHA256: 8f8f935b5ae99efc6dc9d19dbfd283d39f6372484b715005ad7fa9c89ea0aee9. Static findings: 22; levels with findings: 10. Categories: {"integrity":0,"references":16,"inventory":0,"geometry":0,"fidelity":4,"wiring":2}.

Runtime makeBlueprint loads by number and its base/contrast equality is tested independently. That architectural invariant does not establish physical fidelity, reachable goals, functional machines or enjoyment.

|Level|Name|Concrete findings|
|---|---|---|
|1|First Light|No static defect detected; runtime/fidelity play still unverified.|
|2|Corner Turn|No static defect detected; runtime/fidelity play still unverified.|
|3|Glass Parcel|No static defect detected; runtime/fidelity play still unverified.|
|4|Across the Water|No static defect detected; runtime/fidelity play still unverified.|
|5|Side Entrance|No static defect detected; runtime/fidelity play still unverified.|
|6|Two Vaults|No static defect detected; runtime/fidelity play still unverified.|
|7|Under the Beam|No static defect detected; runtime/fidelity play still unverified.|
|8|First, Then|No static defect detected; runtime/fidelity play still unverified.|
|9|Opposite Landing|No static defect detected; runtime/fidelity play still unverified.|
|10|The Way Back|No static defect detected; runtime/fidelity play still unverified.|
|11|Lift Welcome|No static defect detected; runtime/fidelity play still unverified.|
|12|Today at the Hub|**EVENT_ROUTE**: Event route:west-bridge names absent route<br>**EVENT_ROUTE**: Event route:east-bridge names absent route|
|13|Two Gardens|No static defect detected; runtime/fidelity play still unverified.|
|14|The Higher Dock|No static defect detected; runtime/fidelity play still unverified.|
|15|Lock Before Release|No static defect detected; runtime/fidelity play still unverified.|
|16|Either Outer Path|No static defect detected; runtime/fidelity play still unverified.|
|17|Receiver, Not Sender|No static defect detected; runtime/fidelity play still unverified.|
|18|Follow It Up|**EVENT_CARGO_GATE**: Event cargo:cargo-1:cross:north-gate has no actual gate north-gate<br>**EVENT_CARGO_GATE**: Event cargo:spare-cargo:cross:north-gate has no actual gate north-gate<br>**EVENT_CARGO_GATE**: Event cargo:cargo-1:cross:south-gate has no actual gate south-gate<br>**EVENT_CARGO_GATE**: Event cargo:spare-cargo:cross:south-gate has no actual gate south-gate|
|19|Keep It on Board|No static defect detected; runtime/fidelity play still unverified.|
|20|Weights and Ways|No static defect detected; runtime/fidelity play still unverified.|
|21|Garden Ferry|No static defect detected; runtime/fidelity play still unverified.|
|22|Rook’s Delivery|No static defect detected; runtime/fidelity play still unverified.|
|23|Which Belt?|No static defect detected; runtime/fidelity play still unverified.|
|24|At the Flash|No static defect detected; runtime/fidelity play still unverified.|
|25|By the Conveyor|No static defect detected; runtime/fidelity play still unverified.|
|26|Cargo Comes Back|No static defect detected; runtime/fidelity play still unverified.|
|27|While One Rises|No static defect detected; runtime/fidelity play still unverified.|
|28|One Updated Turn|No static defect detected; runtime/fidelity play still unverified.|
|29|Who Opens What|No static defect detected; runtime/fidelity play still unverified.|
|30|The New Depot|No static defect detected; runtime/fidelity play still unverified.|
|31|A Line of Light|No static defect detected; runtime/fidelity play still unverified.|
|32|First Launch|No static defect detected; runtime/fidelity play still unverified.|
|33|Lift, Then Gate|No static defect detected; runtime/fidelity play still unverified.|
|34|Safe Now|**EVENT_ROUTE**: Event route:east-bridge names absent route<br>**EVENT_ROUTE**: Event route:west-bridge names absent route|
|35|Today’s Capacity|No static defect detected; runtime/fidelity play still unverified.|
|36|Which Receiver Is Powered?|No static defect detected; runtime/fidelity play still unverified.|
|37|Both Means Both|No static defect detected; runtime/fidelity play still unverified.|
|38|The Next Result|No static defect detected; runtime/fidelity play still unverified.|
|39|Same Floor, New Landing|No static defect detected; runtime/fidelity play still unverified.|
|40|Forge Transfer|**MISSING_SYSTEM**: Plan requires >=1 relay; fixture has 0|
|41|Her Parcel, Your Route|**MISSING_SYSTEM**: Plan requires >=3 conveyor; fixture has 1|
|42|Beside Her Lift|**MISSING_SYSTEM**: Plan requires >=2 conveyor; fixture has 1|
|43|The Report Matches|No static defect detected; runtime/fidelity play still unverified.|
|44|One New Receiver|No static defect detected; runtime/fidelity play still unverified.|
|45|Today, Not Tomorrow|**GOAL_CARGO**: Goal2 refers to absent cargo spare-cargo<br>**GOAL_CARGO**: Goal5 refers to absent cargo spare-cargo|
|46|Leave One Disconnected|**GOAL_CARGO**: Goal2 refers to absent cargo spare-cargo<br>**EVENT_CARGO**: Event cargo:spare-cargo:enter:main-gate names absent cargo<br>**EVENT_CARGO**: Event cargo:spare-cargo:leave:main-gate names absent cargo<br>**GOAL_CARGO**: Goal5 refers to absent cargo spare-cargo<br>**EVENT_CARGO**: Event cargo:spare-cargo:enter:auxiliary-gate names absent cargo<br>**EVENT_CARGO**: Event cargo:spare-cargo:leave:auxiliary-gate names absent cargo|
|47|The Current Manifest|No static defect detected; runtime/fidelity play still unverified.|
|48|If the Record Says|No static defect detected; runtime/fidelity play still unverified.|
|49|Two Arcs|**INERT_RECEIVER**: middle-emitter→side drives no physical door/bridge/lift circuit|
|50|The Living Relay|**MISSING_SYSTEM**: Plan requires >=3 conveyor; fixture has 2<br>**INERT_RECEIVER**: gallery-emitter→garden-receiver drives no physical door/bridge/lift circuit|

## Candidate position bias

{"sampleCount":24,"firstInventory":8,"leftmost":12,"nearest":16}. Only tasks that actually select one cargo identity are sampled; generic crate tasks accept equivalent alternatives. Leftmost/nearest use actual spawn positions; the catalogue requires alternatives rather than repeated positional answers. Array order is diagnostic only because the game does not expose a cargo list.

## Runtime producer checks

Separate tests exercise the actual fixed Rook replay for22/24/43; contrast24 event names; clean initial prohibition state31; actual supported lift boarding11; real portal crossing event2; actual central delivery16; all fixed histories22/23/24/25/30/43/48; and disabled lift power20/37/50. These are unit setups and are not counted as public-UI play evidence. Their pass/fail appears in the test output.

## Remaining review

Even a static-clean row still needs collision/geometry/visual inspection and real-input solution through public UI. In particular, verify every promised topology and mechanical dependency, not just entity names; inspect all50 captures and intermediate states. Check lift/conveyor dock arrival, complete cargo loops, portal facing, meaningful beam occlusion, guarded stop access, false-exit recovery, interval/prohibition history, and both meanings of every contrast.

Earlier eight wins belong to the superseded nine-room milestone. Audio helper’s prototype L1 strict-gating/save tests are representative early evidence only. No50-level runtime claim is made.
