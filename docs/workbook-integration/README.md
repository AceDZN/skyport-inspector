# Workbook game adapter

Rift Runner uses the canonical slug `rift-runner`, English title **Rift Runner** and Hebrew title **קופצים בין שערים**. This is a host-only addition on top of accepted campaign checkpoint `ef64e2e`. Rooms, physical engine, fixtures, models, scene renderer and English content are unchanged. The earlier 497 native tests and full fresh50 gameplay acceptance still describe those unchanged systems; they were not rerun for this bridge.

`?level=N` accepts exactly one canonical integer1–50 and opens that authored room directly in `playing` mode. Invalid/duplicate/decimal/leading-zero/out-of-range values preserve the normal saved menu. A requested room ahead of saved progress runs as session-only practice. It does not invent previous completions, change the saved resume level or unlock skipped rooms. Real completion permits Next within that practice session; Restart/R remain available. Ordinary saved campaign play keeps its previous save behavior. Contrast practice never sends base completion analytics.

The child posts `{source:'workbook-game',version:1,slug:'rift-runner',...message}` only to the exact validated immediate parent origin. Allowed parents are canonical HTTPS Workbook subdomains, HTTP localhost/127.0.0.1, or a Vercel preview with exactly the same origin as the game. Standalone/foreign parents receive no bridge events. `ready` follows required model loading and the first actual scene render. It precedes the queued `level-start` for an automatic deep-link entry. Each actual base launch/restart/R/respawn starts an attempt; help, pause and resume do not. One `level-complete` is sent only for the actual matched physical base goal. `durationMs` uses the active simulation clock from that attempt; paused reading time and earlier retries are excluded. Required-model failure sends `error`, shows Retry, and never reports ready or substitutes a missing model. Error text sent to the host is generic.

Optional host mute is `{source:'workbook-host',version:1,slug:'rift-runner',type:'set-muted',muted:boolean}`. The child requires both the exact allowed parent origin and `event.source === window.parent`. Host mute is transient, survives playback/resume/completion and never overwrites the player's saved mixer values. This change adds no mute UI to the host app.

## Verification

`ACCEPTANCE.json` and `browser/RESULT.json` record the closed passing run: real iframe level50 with fresh locked save; ready/start ordering; valid mute/unmute and rejected protocol/sibling/foreign messages; malformed deep link; intentional503 required-model failure and successful Retry; exact clock/position/audio freeze in help; actual R attempt; real C1 portals→cube pickup→carried crossing→pressure button→physical exit; exactly one base completion with measured active duration; Next2 and Restart2 without repeated readiness. Zero unexpected page/console errors. Tests use real RAF, normal mouse input and synthetic standard DOM keyboard events; no pose, portal, clock, win or progress assignments. They are not an all-trusted OS-input or mobile-touch study.

Ten focused host unit tests passed via `node_modules/.bin/tsx --test tests/host.test.ts`. `npm run build` passed strict runtime TypeScript and Vite; the existing large-bundle warning remains. The develop-web-game client was run and its screenshot inspected under `skill-client-final/`. Final gameplay/error/completion screenshots and the original poster were also opened and inspected. `HARNESS_HISTORY.json` retains SHA-bound failed observer attempts; they are not passes. The final active-time diagnostic is read-only.

`public/poster.png` is an unedited 1440×900 screenshot from the actual successful C1 run, showing the real cube on the pressure button, open exit, linked portal and gun. It is copied into `dist/poster.png` by the build. No image generation, compositing or mockup was used.

## Reusing the physical route on the released app

The complete local iframe check is `node docs/workbook-integration/check-iframe.mjs`; set `RIFT_GAME_URL` to a different bundle directory URL (with a trailing slash) to check that release. It serves a real local parent on4263. The game build/preview defaults to127.0.0.1:4262 for this check.

For an actual Workbook player page, reuse the route without creating another harness:

```js
import {createGameDriver} from '/absolute/release-checkout/docs/workbook-integration/physical-driver.mjs';
// page is the real Workbook Page. frame is its already-loaded Rift Runner Frame.
// Open the app at ?level=1 with a fresh profile first.
const driver=createGameDriver(page,frame);
await driver.dragMode(); // uses actual Pause → Settings → checkbox → Back → Resume
const goal=await driver.playC1({capture:async label=>{
  await page.screenshot({path:`${output}/${label}.png`});
}});
// goal.mode === 'result' && goal.world.result.goalMatched === true
```

The driver reads canvas bounds for iframe offset/size, aims using ordinary mouse drag, uses real DOM key events, and only reads public snapshots. `render_game_to_text().activeSeconds` exposes the active simulation time for precise pause/attempt observations. Root owns the separate acedzn-tools catalog/R2/host release and all50 uploaded-entry checks; those are not claimed by this source-side receipt.
