/** Isolated real browser network-failure/retry check. Never writes game state/save/body poses. */
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
const {chromium}=createRequire('/Users/acedzn/dev/AceDZN-exp/skyport-inspector/package.json')('playwright');
const out=new URL('./asset-retry-run/',import.meta.url).pathname;
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const report={scope:'Two fresh isolated contexts; real asset HTTP 503 injected once, ordinary Retry UI click, read-only public state. No gameplay/progress proof.',cases:[]};
const check=(v,m)=>{if(!v)throw Error(m);};
try{
 for(const name of ['hero-projector','hero-weighted-cargo']){
  const context=await browser.newContext({viewport:{width:1280,height:800}}),page=await context.newPage();
  const c={asset:name,responses:[],consoleErrors:[],pageErrors:[]};report.cases.push(c);let failed=false;
  page.on('response',r=>{if(r.url().endsWith('.glb'))c.responses.push({url:r.url(),status:r.status()});});
  page.on('pageerror',e=>c.pageErrors.push(String(e)));page.on('console',m=>{if(m.type()==='error')c.consoleErrors.push(m.text());});
  await page.route('**/'+name+'.glb',async route=>{if(!failed){failed=true;await route.fulfill({status:503,contentType:'text/plain',body:'Deliberate isolated asset-retry QA fixture'});}else await route.continue();});
  await page.goto('http://localhost:4261/hero-repair/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).mode==='load-error',null,{timeout:120000});
  c.failure=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  check(failed&&!c.failure.world&&!c.failure.heroAssets.ready,'Failed asset must prevent construction of a playable scene');
  check(!c.failure.progress.completed.length,'Fresh failure fixture gained progress');
  await page.screenshot({path:out+name+'-load-error.png'});
  await page.locator('[data-action=retry-load]').click({noWaitAfter:true});
  await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='menu',null,{timeout:120000});
  c.recovered=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  check(c.recovered.heroAssets.ready&&c.recovered.world&&!c.recovered.initializationError,'Ordinary retry did not recover both real assets');
  for(const asset of Object.values(c.recovered.heroAssets.assets))check(asset.verifiedSHA256===asset.expectedSHA256&&asset.phase==='ready','Unverified retry asset');
  check(!c.recovered.progress.completed.length,'Retry gained progress');
  await page.locator('[data-action=start]').click({noWaitAfter:true});
  await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='playing');
  c.playing=await page.evaluate(()=>JSON.parse(render_game_to_text()));
  check(c.playing.heroInstances.gun.attached&&c.playing.heroInstances.cargo.length===1,'Recovered real scene missing hero instances');
  await page.screenshot({path:out+name+'-recovered-playing.png'});
  c.scripts=await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.src));
  c.scriptHashes=await Promise.all(c.scripts.map(async url=>({url,sha256:createHash('sha256').update(Buffer.from(await(await fetch(url)).arrayBuffer())).digest('hex')})));
  check(!c.pageErrors.length,'Unexpected page errors in retry fixture');c.passed=true;
  await context.close();await fs.writeFile(out+'report.json',JSON.stringify(report,null,2));
 }
 report.passed=report.cases.length===2&&report.cases.every(c=>c.passed);
}catch(error){report.error=String(error);process.exitCode=1;}
finally{await fs.writeFile(out+'report.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({passed:report.passed,error:report.error,cases:report.cases.map(c=>({asset:c.asset,passed:c.passed,expectedNegativeConsoleErrors:c.consoleErrors.length,pageErrors:c.pageErrors.length}))}));}
