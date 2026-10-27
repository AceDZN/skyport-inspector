# Skyport Inspector — בודקי נמל השמיים

Read COMMON.md, COVERAGE.md and GRADES.md. Your new standalone repo is `/Users/acedzn/dev/AceDZN-exp/skyport-inspector`, public origin `https://github.com/AceDZN/skyport-inspector`, dev/preview 5261/4261. Initialize/push main first. This is your own separate builder chat; use the three art, audio and English/QA helpers described in COMMON.md.

## Copy this known loop

Source: **Papers, Please**, https://store.steampowered.com/app/239030/Papers_Please/ . Keep the recognizable rhythm: call next visitor → receive several physical documents → compare with the current rulebook → inspect/ask about a discrepancy → stamp a boarding/hold decision → see the visitor's consequence → learn a new complication. Make it satisfying to handle paper and stamp correctly. A plain yes/no quiz with a station backdrop is not this loop.

Original setting: a whimsical 3D airship terminal for festival visitors. All documents/travelers are fictional, no real passports or personal data. A wrong decision sends someone to the wrong queue or holds an eligible traveler; you can call them back and correct it. A small story thread makes good decisions matter. No mature source-game narrative is needed.

## First-minute action and controls

Fixed seated 3D desk camera, a traveler across the counter, airship dock visible behind. Click bell for NEXT. Grab/drag documents with left pointer/touch; click/tap to inspect a readable, zoomed face. Two inspection slots snap papers side by side. Close zoom with Esc/back. Mark two relevant phrases, then choose a stamp; click/tap or drag the stamp to its target once. Provide keyboard document cycling, inspect, evidence selection, next and confirm; avoid accidental double stamping. No WASD or pointer lock for a seated inspector. Small narrow HTML inspection text is appropriate for legibility, while papers, stamps, desk and visitors remain actual raycasted 3D objects. Do not make learners read tiny texture text from a bad angle.

After a decision, show the physical gate/queue outcome and a brief reason. Accepting/holding by luck can advance the story, but an evidence pair must support a comprehension credit. Selecting a pair must not auto-reveal correct phrases. “Ask for the missing detail” is a legitimate third action. Practice pauses while inspecting text; optional time/accuracy medals start after onboarding.

## Concrete fixture rules

Use a single authoritative travel-case data model: fictional date, passenger/holder names, destination, departure, booking status, documents, updates, missing fields and valid decision(s). English text and evaluator must agree. A note changes only named fields for its stated journey/date; newer does not erase every old fact. Both accepting and holding must be correct in different cases with identical skins, clothing and stamp positions.

Example original base case: desk date 27 October; ticket “Cloud Garden, 18:00, Gate 2, holder Nora Reed”. Matching holder card and a current boarding list make it valid. An update “For the 18:00 Cloud Garden trip today, use Gate 3. The departure time is unchanged” changes only the gate. The actual boarding action must route to Gate 3 while retaining 18:00; a note for tomorrow cannot override today's gate. Missing holder information needs a question, not automatic rejection.

Mixed-tense information: “I usually take the morning airship. Today I am travelling at 18:00. I travelled to the island yesterday.” The current journey is 18:00, not the habitual morning trip or completed yesterday journey. Tell the player exactly which journey is being inspected.

## Nine launch cases — three per grade

See GRADES.md for scope and exact module sources. Each row below is a challenge, with an original independent paired variant; do not just repeat one solved passenger with a new name.

**G7:** (1) guided ticket + timetable, identify date/destination; (2) independent habit/current/past note, ask one precise question if a field is absent; (3) transfer to a return-trip timetable with changed time/destination and no solution hint. Teach present versus completed past and practical information, not tense-name recall.

**G8:** (1) guided mixed account: one person was carrying a case while another left; identify who holds today's booking; (2) independent narrow schedule update and pronoun reference across two documents; (3) new journey transfer where the update changes time but leaves gate/destination unchanged. Text, not document color, determines the valid action.

**G9:** (1) guided present-perfect versus past event record, distinguishing a currently relevant check-in from a dated past visit; (2) independent reported message with explicit speaker/addressee/reporting date, preserving whose ticket/which date it concerns; (3) transfer combining two sources and a scoped update, requiring a short decision reason assembled from evidence phrases or typed freely with a reviewed finite rubric. Do not call phrase selection free writing. Keep a clarification path if the record does not settle current validity.

Crucial grammar qualification: “I lost my ticket yesterday” does not establish whether it is missing now. Add explicit “I found it this morning” or “I still cannot find it”, or require clarification. Likewise present perfect is not a magic current-validity flag; the contextual rule/document must state what counts as checked in. Current status and finished event differ in the information conveyed; either can be grammatical.

## Art and asset search

Art direction: cobalt/navy enamel, aged ivory paper, restrained vermilion stamps, brass lamps, warm sky light. Tangible desk tools and soft traveler silhouettes; a polished 3D booth rather than a generic low-poly card app. Frame desk at a natural working angle, world ≥75% view, current rulebook compact and readable. Real character eye line, clean ground/contact and appropriate scale.

Search Tripo gallery/My Assets first for luggage, desk lamp, stamp, vintage counter, generic traveler/robot. The user's owned `/Users/acedzn/dev/AceDZN-exp/clockwork-alibi/public/models/porter.glb` and its ASSETS.md are a read-only reuse candidate; inspect rights and rig/clips before copying. Do not require a new custom humanoid if a suitable owned traveler exists. Use an actual rig if walking/deforming a character; no facial rig needed. Papers and exact text are procedural planes/UI for accuracy; featured desk props and visitors should be good meshes. Record search/rejections before exceptional generation.

## Music, ambience and SFX

Audio helper: compose an original light 78–88 BPM chamber-jazz/lo-fi motif, warm plucked bass, gentle reed-like melody, brushed/shuffled percussion and soft electric-piano chords. 32-bar AABA/ABAC with real phrase variation, seamless looping and a slightly busier end-of-shift layer. Ambience: low terminal crowd/airship propeller/cloth wind textures, ducked under reading audio. Distinct cues: bell, paper pickup, paper slide, page turn, evidence pencil, ink pad, board stamp, hold stamp, gate opening, correction/recall and shift end. Tactile foley should be more satisfying than generic UI bleeps. Master/music/SFX/voice controls, no duplicate loops after restart. Deliver and test a mixed local preview as COMMON.md requires.

## Generate the design target before implementation

Built-in imagegen; save exact prompt/output in docs/visual-targets and label it a mockup.

> Use case: ui-mockup. Asset type: gameplay design target for a real browser 3D document-inspection game. Create a believable 16:9 mid-game frame of Skyport Inspector. First-person seated camera looks down onto a detailed navy-enamel ticket booth desk with aged ivory travel papers in two inspection slots, a chunky red rubber stamp in the foreground, brass reading lamp and a small boarding bell. Beyond the counter a friendly original traveler waits, with a cream-and-blue airship dock in warm afternoon light. Actual tangible 3D paper edges, grounded props, expressive coherent model silhouettes, polished achievable Three.js rendering. One focused readable ticket says exactly “CLOUD GARDEN / 18:00 / GATE 2”. A compact current notice says exactly “Today: Gate 3. Time unchanged.” A small inspector mark links the two gate fields; no automatic green correctness highlights. The stamp is hovering over the ticket, showing a player action. Sparse top text “SHIFT 2”, tiny lower hint “Drag to compare”. Desk and world dominate, no browser frame, title screen, answer cards, giant dashboard or copied game characters. Cobalt, warm ivory, brass and restrained vermilion; legible text and a practical working camera.

## Acceptance

Playable nine-case three-grade campaign, actual tactile document/inspection/stamp loop, functional clarification/evidence actions, escalating rules and meaningful consequences. At least one paired meaning-changing case per grade and one transfer per grade. Tests cover valid/invalid/missing info, scoped updates, referents, tense context and reported-message identities. Browser win + error/recall + keyboard + touch + audio/settings/restart; real captures compare with target. Public main pushed; coverage.json marks only implemented/verified cases; no finished-curriculum or learning-gains claim. Keep building through the complete slice.
