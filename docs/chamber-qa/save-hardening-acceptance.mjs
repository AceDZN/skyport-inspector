/** Prepared UI acceptance. Launch only in the lead's exclusive frozen-build slot. */
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const key='rift-runner-rapier-campaign-v1',url=process.env.RIFT_SAVE_URL??'http://localhost:4261/';
const source=new URL('./clean-five-run/earned-game-only-storage.json',import.meta.url),routeFile=new URL('./known-route.jsonl',import.meta.url);
const plan={status:'PREPARED — NOT RUN',singleBrowser:true,contexts:'One empty two-tab context earns C1 through ordinary controls; then a separate isolated two-tab context imports only the documented genuine CJ clean-five export. First context closes before the second starts.',storageSource:fileURLToPath(source),url,requiredLaunchEnvironment:['RIFT_SAVE_ACCEPTANCE_SLOT=1','RIFT_SAVE_BUNDLE=<assigned main bundle filename>'],scope:'No observe calls, body/portal/win injection, localStorage writes/clears or fabricated unlocks. Page evaluation is read-only. All movement/controls are real mouse/keyboard; no advanceTime.'};
if(process.argv.includes('--plan')||process.env.RIFT_SAVE_ACCEPTANCE_SLOT!=='1'){
 console.log(JSON.stringify(plan,null,2));process.exit(0);
}
if(!process.env.RIFT_SAVE_BUNDLE)throw Error('The lead must supply the assigned frozen main bundle before launch.');
if(new URL(url).origin!=='http://localhost:4261')throw Error('Genuine source storage belongs to localhost:4261; do not remap its origin or seed another origin.');

const {chromium}=await import('playwright');
const out=new URL(process.env.RIFT_SAVE_OUT??'./save-hardening-acceptance/'+Date.now()+'/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),sourceBytes=await fs.readFile(source),routeBytes=await fs.readFile(routeFile),sourceHash=sha(sourceBytes);
const imported=JSON.parse(sourceBytes),sourceEntry=imported.origins.find(o=>o.origin==='http://localhost:4261')?.localStorage.find(v=>v.name===key);
if(!sourceEntry)throw Error('Documented earned key missing from source export.');
const original=JSON.parse(sourceEntry.value);
if(JSON.stringify(Object.keys(original.records).map(Number))!==JSON.stringify([1,2,3,4,5])||!Object.values(original.records).every(r=>r.completed&&r.last.goalMatched))throw Error('Source is not the documented genuine earned-five export.');
const allRoute=routeBytes.toString().trim().split(/\r?\n/).map(JSON.parse),split=allRoute.findIndex(c=>c.action==='click'&&c.selector==='[data-action=second]');
if(split<1)throw Error('Known C1 route boundary missing.');
const c1=allRoute.slice(0,split),manifest={...plan,status:'RUNNING',startedAt:new Date().toISOString(),importedEarnedStorage:{path:fileURLToPath(source),sha256:sourceHash,provenance:'clean-five-run: genuine fresh ordinary-input1–5 CJ proof; this acceptance import is replay/control inspection, not a fresh campaign proof'},routeSource:{path:fileURLToPath(routeFile),sha256:sha(routeBytes)},assignedBundle:process.env.RIFT_SAVE_BUNDLE,versions:[],actions:[],checkpoints:[],errors:[],consoleErrors:[],notes:[]};
const contexts=[],pages=[];let browser,baseline,captureNo=0;
const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).filter(([,x])=>x!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+canonical(x)).join(',')+'}':JSON.stringify(v);
const recordsSignature=records=>canonical(Object.fromEntries(Object.entries(records).map(([n,r])=>[n,{completed:r.completed,runs:r.runs,completions:r.completions,unaided:r.unaided,bestRetries:r.bestRetries,last:r.last,variants:r.variants,unattributed:r.unattributed}])));
const check=(value,message)=>{if(!value)throw Error(message);};
const read=page=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const completed=s=>Object.entries(s.progress.records).filter(([,r])=>r.completed).map(([n])=>Number(n));
const save=()=>fs.writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2));
async function storage(page){return page.evaluate(key=>({origin:location.origin,main:localStorage.getItem(key),journal:localStorage.getItem(key+'-journal'),backup:localStorage.getItem(key+'-backup')}),key);}
async function version(page,label){
 const scripts=await page.evaluate(()=>[...new Set([...document.querySelectorAll('script[src]')].map(e=>e.src).concat([...document.querySelectorAll('link[rel="modulepreload"]')].map(e=>e.href),performance.getEntriesByType('resource').map(e=>e.name).filter(u=>new URL(u).pathname.endsWith('.js'))))].sort());
 const hashes=await Promise.all(scripts.map(async script=>{const response=await fetch(script);check(response.ok,'Bundle fetch failed: '+script);return{url:script,sha256:sha(Buffer.from(await response.arrayBuffer()))};}));
 const main=hashes.find(s=>new URL(s.url).pathname.split('/').at(-1)===process.env.RIFT_SAVE_BUNDLE);
 check(main,'Assigned main bundle is not loaded: '+process.env.RIFT_SAVE_BUNDLE);
 if(process.env.RIFT_SAVE_MAIN_SHA)check(main.sha256===process.env.RIFT_SAVE_MAIN_SHA,'Assigned main bundle SHA mismatch.');
 if(process.env.RIFT_SAVE_AUDIO_SHA)check(hashes.some(s=>new URL(s.url).pathname.split('/').at(-1).startsWith('audio-')&&s.sha256===process.env.RIFT_SAVE_AUDIO_SHA),'Assigned shared/audio bundle SHA mismatch.');
 const signature=canonical(hashes);if(baseline)check(signature===baseline,'Frozen bundle changed during acceptance.');else baseline=signature;
 manifest.versions.push({label,url:page.url(),at:new Date().toISOString(),scripts:hashes});
}
async function open(context,label){
 const page=await context.newPage();pages.push({page,label});page.on('pageerror',e=>manifest.errors.push({label,error:String(e)}));page.on('console',m=>{if(m.type()==='error')manifest.consoleErrors.push({label,error:m.text()});});
 await page.goto(url,{waitUntil:'domcontentloaded'});await ready(page);await version(page,label);return page;
}
async function ready(page){await page.waitForFunction(()=>typeof window.render_game_to_text==='function'&&JSON.parse(window.render_game_to_text()).mode!=='loading',undefined,{timeout:120000});}
async function checkpoint(page,label){
 const state=await read(page),name=String(++captureNo).padStart(3,'0')+'-'+label.replace(/[^a-zA-Z0-9_-]/g,'-')+'.png';
 await page.screenshot({path:fileURLToPath(new URL(name,out))});manifest.checkpoints.push({label,screenshot:name,state,storage:await storage(page)});await save();return state;
}
async function action(page,label,run){const before=await read(page);await run();await page.waitForTimeout(60);const after=await read(page);manifest.actions.push({label,before,after});await save();return after;}
async function click(page,selector){return action(page,'click '+selector,()=>page.locator(selector).click());}
async function mode(page,value){await page.waitForFunction(expected=>JSON.parse(window.render_game_to_text()).mode===expected,value,{timeout:10000});}
async function audioPaused(page){await page.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).audio;return a.paused&&a.context!=='running';},undefined,{timeout:30000});}
async function home(page){
 const s=await read(page);if(s.mode==='playing'){await page.keyboard.press('Escape');await mode(page,'pause');}
 if((await read(page)).mode!=='menu')await click(page,'[data-action=home]');await mode(page,'menu');
}
async function reload(page,label){await action(page,'ordinary reload '+label,async()=>{await page.reload();await ready(page);await version(page,label);});return checkpoint(page,label);}
async function settingsPreview(page,label){
 await click(page,'[data-action=settings]');await mode(page,'settings');await click(page,'[data-action=sound]');await click(page,'[data-action=back]');
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).audio.loadedBuffers===29,undefined,{timeout:30000});await audioPaused(page);
 const s=await checkpoint(page,label);check(s.mode==='menu'||s.mode==='pause','Preview Back returned to unexpected mode.');check(s.audio.loopCount===3&&!s.audio.loadErrors.length,'Audio decode/duplicate-loop regression.');
}
async function resizePaused(page,label){
 const before=await read(page);check(before.mode!=='playing','Resize probe requires a paused/menu screen.');
 await page.setViewportSize({width:920,height:780});await page.waitForTimeout(180);
 const geometry=await page.locator('#world').evaluate(c=>({width:c.width,height:c.height,rect:{width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height},viewport:[innerWidth,innerHeight]}));
 const after=await checkpoint(page,label);check(Math.abs(geometry.rect.width-920)<2&&Math.abs(geometry.rect.height-780)<2,'Paused canvas did not resize to viewport.');check(canonical(after.world.player.position)===canonical(before.world.player.position),'Paused resize moved the player.');manifest.notes.push({label,geometry,scope:'Canvas sizing/paused state asserted; screenshot requires visual inspection for fresh/nonblank frame.'});
 await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(100);
}
async function aim(page,target){
 for(let pass=0;pass<3;pass++){
  const s=await read(page),p=s.world.player,pos=p.position,d=target.map((v,i)=>v-[pos[0],pos[1]+.65,pos[2]][i]),yaw=Math.atan2(-d[0],-d[2]),pitch=Math.asin(d[1]/Math.hypot(...d));
  let dy=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),dp=pitch-p.pitch;const sensitivity=s.controls.sensitivity;
  check(s.controls.unlocked&&!s.pointerLocked,'Known route requires ordinary drag-look setting; no pointer-lock injection.');
  while(Math.abs(dy)>.002||Math.abs(dp)>.002){const a=Math.max(-.65,Math.min(.65,dy)),b=Math.max(-.4,Math.min(.4,dp));if(Math.abs(a/sensitivity)+Math.abs(b/sensitivity)<1.5)break;await page.mouse.move(720,450);await page.mouse.down();await page.mouse.move(720-a/sensitivity,450-b/sensitivity);await page.mouse.up();dy-=a;dp-=b;}
  await page.waitForTimeout(20);
 }
}
async function keypress(page,code,ms){await page.keyboard.down(code);try{await page.waitForTimeout(ms);}finally{await page.keyboard.up(code);}await page.waitForTimeout(20);}
async function walk(page,x,z,stop=.25){
 let old,stuck=0;for(let i=0;i<100;i++){const s=await read(page),p=s.world.player,pos=p.position,d=Math.hypot(pos[0]-x,pos[2]-z);if(s.mode!=='playing')return;if(d<stop)return;stuck=old&&Math.hypot(pos[0]-old[0],pos[2]-old[2])<.02?stuck+1:0;check(stuck<=10,'Real movement blocked at '+pos+' on way to '+[x,z]);old=pos;await aim(page,[x,pos[1]+.65,z]);await keypress(page,'KeyW',Math.min(110,d/4.8*1000));}
 throw Error('Real movement did not reach '+[x,z]);
}
async function route(page,label,alreadyPlaying=false){
 for(const command of c1){
  if(alreadyPlaying&&command.action==='click'&&command.selector==='#start-btn')continue;
  await action(page,label+' '+JSON.stringify(command),async()=>{
   if(command.action==='click')await page.locator(command.selector).click();
   else if(command.action==='aim')await aim(page,command.target);
   else if(command.action==='place'){const button=command.index?'right':'left';await page.mouse.down({button});await page.mouse.up({button});await page.waitForTimeout(160);}
   else if(command.action==='walk')await walk(page,command.x,command.z);
   else if(command.action==='key')await keypress(page,command.code,command.ms);
   else if(command.action==='press')await page.keyboard.press(command.code);
   else if(command.action==='wait')await page.waitForTimeout(command.ms);
   else if(command.action==='capture')await checkpoint(page,label+'-'+command.name);
   else if(command.action==='assert'){let value=await read(page);for(const k of command.path.split('.'))value=value?.[k];check(canonical(value)===canonical(command.equals),'Known route assertion failed: '+command.path);}
   else throw Error('Unsupported ordinary route command: '+command.action);
  });
 }
}

try{
 browser=await chromium.launch({headless:process.env.RIFT_SAVE_HEADED!=='1',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 // Phase1 uses no imported data: one actual C1 win supplies the new earned record.
 const fresh=await browser.newContext({viewport:{width:1440,height:900}});contexts.push(fresh);
 const a=await open(fresh,'fresh-A'),b=await open(fresh,'fresh-initially-stale-B');
 check(!completed(await read(a)).length&&!completed(await read(b)).length,'Fresh context unexpectedly had earned records.');
 await a.bringToFront();await click(a,'[data-action=settings]');await a.locator('#drag-look').check();await click(a,'[data-action=back]');
 await settingsPreview(a,'cold-preview-back-pauses');await resizePaused(a,'menu-resize-dirty-frame');
 await route(a,'fresh-C1');const earned1=await checkpoint(a,'actual-C1-earned');check(earned1.mode==='result'&&canonical(completed(earned1))==='[1]','Fresh C1 did not genuinely earn1.');
 const firstRecords=recordsSignature(earned1.progress.records);
 await b.bringToFront();await pageStateWait(b,s=>s.progress.records[1]?.completed===true);
 await click(b,'[data-action=levels]');await click(b,'[data-action=level][data-level="1"]');await mode(b,'playing');
 check(recordsSignature((await read(b)).progress.records)===firstRecords,'Peer normal entry erased/changed the actual earned record.');
 await home(b);const freshReload=await reload(b,'fresh-peer-reload-continue');check(freshReload.progress.resume===2&&await b.locator('#continue-btn').count()===1,'Fresh earned1 did not survive reload/Continue.');
 await fresh.storageState({path:fileURLToPath(new URL('fresh-actually-earned-one-storage.json',out))});await fresh.close();
 // Phase2 imports only the unchanged documented genuine CJ export into a new profile.
 const earnedContext=await browser.newContext({viewport:{width:1440,height:900},storageState:fileURLToPath(source)});contexts.push(earnedContext);
 const primary=await open(earnedContext,'earned-A'),peer=await open(earnedContext,'earned-B');
 const originalSignature=recordsSignature(original.records);check(recordsSignature((await read(primary)).progress.records)===originalSignature,'Genuine import changed its recorded metrics.');
 await primary.bringToFront();await click(primary,'#continue-btn');await mode(primary,'playing');check((await read(primary)).level===5,'Continue did not choose last registered earned frontier.');
 await primary.keyboard.press('Escape');await mode(primary,'pause');await settingsPreview(primary,'warm-preview-back-pauses');await resizePaused(primary,'paused-resize-dirty-frame');await home(primary);
 const reloaded=await reload(primary,'CJ-save-current-build-reload');check(recordsSignature(reloaded.progress.records)===originalSignature,'Reload changed genuine records.');
 await peer.bringToFront();await click(peer,'[data-action=levels]');await click(peer,'[data-action=level][data-level="1"]');await mode(peer,'playing');
 check(recordsSignature((await read(peer)).progress.records)===originalSignature,'Stale peer entry reduced genuine earned progress.');
 const oldGeneration=(await read(peer)).saveDiagnostics.generation;
 await primary.bringToFront();await click(primary,'[data-action=new-game]');await mode(primary,'new-game');
 check(recordsSignature((await read(primary)).progress.records)===originalSignature,'Opening New Game reset before confirmation.');
 await click(primary,'[data-action=confirm-new]');await mode(primary,'playing');const reset=await checkpoint(primary,'confirmed-reset-with-real-backup');
 check(!completed(reset).length&&reset.progress.highestUnlocked===1&&reset.saveDiagnostics.generation!==oldGeneration,'Confirmed reset did not create a fresh generation.');
 const backup=JSON.parse((await storage(primary)).backup);check(recordsSignature(backup.records)===originalSignature,'Reset backup does not contain the actual real records.');
 await pageStateWait(peer,s=>s.saveDiagnostics.generation!==oldGeneration);let stale=await checkpoint(peer,'peer-safe-after-generation-change');
 check(['menu','pause'].includes(stale.mode)&&stale.audio.paused&&!completed(stale).length,'Peer kept an active/completed old-generation screen.');
 manifest.notes.push({label:'cross-tab-reset-focus-limit',mode:stale.mode,scope:'Changing foreground tabs can independently pause the peer. This proves safe state after reset, not that storage alone caused a pause.'});
 if(stale.mode==='pause'){
  await peer.bringToFront();await click(peer,'[data-action=resume]');await mode(peer,'playing');
  await route(peer,'stale-old-run-C1',true);stale=await checkpoint(peer,'old-generation-physical-result-rejected');
  check(stale.mode==='menu'&&!completed(stale).length&&stale.progress.highestUnlocked===1,'Old-generation actual completion rendered/unlocked a result.');check(stale.saveDiagnostics.warning,'Rejected old run did not expose the actual warning.');
 }else manifest.notes.push({label:'old-run-rejection',status:'Not exercised: generation event already discarded the active old run by returning home. Store regression tests cover its observe guard.'});
 await primary.bringToFront();await home(primary);await click(primary,'[data-action=new-game]');await mode(primary,'new-game');await click(primary,'[data-action=restore]');await mode(primary,'menu');
 const restored=await checkpoint(primary,'restore-real-records');check(recordsSignature(restored.progress.records)===originalSignature,'Restore changed/fabricated real metrics.');check(restored.saveDiagnostics.generation!==reset.saveDiagnostics.generation,'Restore reused reset generation.');
 await pageStateWait(peer,s=>s.saveDiagnostics.generation===restored.saveDiagnostics.generation);check(recordsSignature((await read(peer)).progress.records)===originalSignature,'Peer did not receive restored real records.');
 const finalReload=await reload(primary,'restore-reload-continue');check(finalReload.progress.resume===5&&await primary.locator('#continue-btn').count()===1,'Restored Continue missing after reload.');
 check(sha(await fs.readFile(source))===sourceHash,'Documented source export changed during test.');
 check(!manifest.errors.length&&!manifest.consoleErrors.length,'Browser errors occurred; inspect manifest.');manifest.status='PASS — assigned-build save/control acceptance only; fresh actual C1 plus documented genuine-earned replay, no50-room claim';
}catch(error){manifest.status='FAIL';manifest.errors.push({fatal:String(error),stack:error.stack});process.exitCode=1;for(const {page,label}of pages)if(!page.isClosed())try{await checkpoint(page,'failure-'+label);}catch{}}
finally{
 try{manifest.finishedAt=new Date().toISOString();await save();}
 finally{
  for(const {page}of pages)if(!page.isClosed())try{await page.close();}catch{}
  for(const context of contexts)try{await context.close();}catch{}
  if(browser)try{await browser.close();}catch{}
  console.log(JSON.stringify({status:manifest.status,manifest:fileURLToPath(new URL('manifest.json',out)),errors:manifest.errors.length,consoleErrors:manifest.consoleErrors.length},null,2));
 }
}

async function pageStateWait(page,predicate){
 const until=Date.now()+10000;while(Date.now()<until){if(predicate(await read(page)))return;await page.waitForTimeout(60);}throw Error('Peer save state did not update through real storage events.');
}
