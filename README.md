# Rift Runner — קופצים בין שערים

A Portal-style browser3D puzzle adventure in active development toward **one saved50-level campaign**. No grade selection in the campaign: curriculumgrades7–9are internal provenance only. Original code/art/audio, actual linked portal views and position/facing/velocity transforms, solid cargo, machinery and recoverable world goals.

**Current candidate:** http://localhost:4261/campaign.html · **development:** http://localhost:5261/campaign.html . Continue/New Game/Levels, strict correct-objective unlocks, reload/resume and replay frontier have normal-input proof. The50-row catalogue and physical fixtures are being authored/audited; they are not yet a verified full50-level delivery. The full clean-save1→50 run remains required. The root preview currently preserves the earlier portal-opening checkpoint while this campaign is completed.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

WASD/arrows move, mouse look (click to lock or choose unlocked drag), Spacejump, Einteract/grab/drop, primary/1placesA, secondary/2placesB, Rsafe retry, Mjournal, Escpause/release, Ffullscreen. Touch joystick/look/actions are available. Reading pauses the world. Hebrew support is optional and never blocks completion.

CAMPAIGN-50.md is authoritative. CAMPAIGN_PLAN.md records chosen mechanic/layout families. docs/campaign/catalogue-draft.json has50authored **planned** rows; src/data/campaign.json is canonical mission data. Physical fixtures load bylevelnumber and remain unchanged under semantic contrast; scripts/prototype-blueprints.ts is an authoring prototype, not the runtime world authority. Independent conformance and physical audits distinguish drafts from verified scenes. Correct English-world objectives unlock next levels; wrong physical routes give recoverable feedback.

Sources/English limits: docs/campaign/LANGUAGE_REVIEW.md. Targets before new-family visuals: docs/campaign-targets/gallery.html. Original asset/search rights: ASSETS.md/ASSET_SEARCH.md. Original32-bar soundtrack, machinery cues and preview: AUDIO.md. No subjective human listening or learning-gains claim.

Historical checkpoints: skyport-desk-v1 preserves the human-rejected document booth; rift-runner-opening-v1 preserves the first portal/carry/bridge win/fall/retry milestone. Previous nine-room/grade-pack logs are historical only and never counted as50-level evidence. No production deployment.
