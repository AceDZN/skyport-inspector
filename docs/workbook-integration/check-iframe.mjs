/** Actual iframe integration QA. Reads snapshots; aims/moves with normal DOM input.
 * No assignments to game bodies, portals, goals, progress or clocks. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {createGameDriver} from './physical-driver.mjs';
const out=new URL('./browser/',import.meta.url).pathname;await fs.mkdir(out,{recursive:true});
const game=process.env.RIFT_GAME_URL??'http://127.0.0.1:4262/';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--host-resolver-rules=MAP foreign.localhost 127.0.0.1','--no-proxy-server']});
const result={status:'running',scope:'Actual iframe, read-only snapshots, normal DOM/Playwright inputs and real RAF. No body/goal/save/clock injection.',game,checks:[],captures:[],actions:[],errors:[]};
let context,page,frame,driver;
const server=createServer((request,response)=>{
 const src=new URL(request.url,'http://127.0.0.1:4263').searchParams.get('src');
 response.writeHead(200,{'Content-Type':'text/html'});
 response.end(`<!doctype html><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:0}</style><script>window.hostEvents=[];addEventListener('message',e=>{if(e.source===document.querySelector('iframe')?.contentWindow)window.hostEvents.push({data:e.data,origin:e.origin,at:performance.now()})})</script><iframe src="${src}" allow="fullscreen; autoplay; gamepad"></iframe>`);
});
await new Promise(resolve=>server.listen(4263,'0.0.0.0',resolve));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
async function read(){return frame.evaluate(()=>JSON.parse(window.render_game_to_text()));}
async function messages(){return page.evaluate(()=>window.hostEvents);}
async function capture(name){const path=out+name+'.png';await page.screenshot({path});const state=await read();result.captures.push({name,file:path,state,hostEvents:await messages()});await fs.writeFile(out+'LIVE.json',JSON.stringify(result,null,2));console.log('CAPTURE',name,state.mode,state.level);return state;}
const envelope=(muted)=>({source:'workbook-host',version:1,slug:'rift-runner',type:'set-muted',muted});
async function embed(query='',origin='http://localhost:4263',failModel=false){
    await context?.close();context=await browser.newContext({viewport:{width:1440,height:900}});page=await context.newPage();
    page.on('pageerror',e=>result.errors.push({type:'pageerror',message:String(e)}));
    page.on('console',m=>{if(m.type()==='error'&&!failModel)result.errors.push({type:'console',message:m.text()});});
    if(failModel)await page.route('**/models/hero-weighted-cargo.glb',route=>route.fulfill({status:503,body:'Intentional required-model failure'}));
    const src=game+query;
    await page.goto(origin+'/rift-iframe?src='+encodeURIComponent(src),{waitUntil:'domcontentloaded'});await page.waitForSelector('iframe');frame=page.frames().find(f=>f.parentFrame()===page.mainFrame());
    await frame.waitForFunction(()=>typeof window.render_game_to_text==='function');await frame.waitForFunction(()=>!['loading'].includes(JSON.parse(window.render_game_to_text()).mode),{},{timeout:120000});
    await page.waitForTimeout(160);driver=createGameDriver(page,frame,{onAction:action=>result.actions.push(action)});return read();
}
async function send(data){await page.evaluate(({data,target})=>document.querySelector('iframe').contentWindow.postMessage(data,target),{data,target:new URL(game).origin});await page.waitForTimeout(60);}
try{
    let s=await embed('?level=50');assert(s.level===50&&s.mode==='playing'&&s.directPractice,'Locked deep link did not enter room 50');assert(s.heroAssets.ready,'Required hero models not ready');
    assert(s.progress.highestUnlocked===1&&s.progress.completed.length===0,'Deep link fabricated save progress');
    let events=await messages();assert(events.length===2&&events[0].data.type==='ready'&&events[1].data.type==='level-start'&&events[1].data.level===50,'Ready/start order wrong');
    result.checks.push({name:'locked-level50-entry-save-and-ready',state:s,events});await capture('01-real-room50-direct-entry');
    const gains=s.audio.gains;await send(envelope(true));s=await read();assert(s.audio.hostMuted===true&&JSON.stringify(s.audio.gains)===JSON.stringify(gains),'Host mute changed user gains');
    await send({...envelope(false),version:2});assert((await read()).audio.hostMuted===true,'Foreign protocol changed mute');
    await page.evaluate(({data,target})=>{const sibling=document.createElement('iframe');sibling.id='foreign-sibling';document.body.append(sibling);sibling.contentWindow.eval('parent.document.querySelector("iframe").contentWindow.postMessage('+JSON.stringify(data)+','+JSON.stringify(target)+')');},{data:envelope(false),target:new URL(game).origin});
    await page.waitForTimeout(60);assert((await read()).audio.hostMuted===true,'Sibling source changed mute');await page.evaluate(()=>document.querySelector('#foreign-sibling').remove());
    await send(envelope(false));assert((await read()).audio.hostMuted===false,'Parent unmute failed');result.checks.push({name:'actual-parent-mute-invalid-protocol-and-sibling-rejected',passed:true});
    s=await embed('?level=1&level=2');assert(s.mode==='menu'&&s.level===1,'Ambiguous link did not retain menu');assert((await messages()).length===1,'Menu fabricated attempt');
    result.checks.push({name:'duplicate-level-rejected',passed:true});
    s=await embed('?level=1','http://foreign.localhost:4263');await page.waitForTimeout(200);assert((await messages()).length===0,'Foreign parent received lifecycle');await send(envelope(true));assert((await read()).audio.hostMuted===false,'Foreign origin changed mute');result.checks.push({name:'actual-foreign-parent-denied',passed:true});
    s=await embed('?level=1','http://localhost:4263',true);assert(s.mode==='load-error','Missing required model did not block play');events=await messages();assert(events.length===1&&events[0].data.type==='error','Missing required model reported ready/start');await capture('02-required-model-error-no-fallback');
    await page.unroute('**/models/hero-weighted-cargo.glb');await frame.locator('[data-action=retry-load]').click();await frame.waitForFunction(()=>JSON.parse(window.render_game_to_text()).mode==='playing',{},{timeout:120000});await page.waitForFunction(()=>window.hostEvents.map(e=>e.data.type).join(',')==='error,ready,level-start');events=await messages();assert(events.map(e=>e.data.type).join(',')==='error,ready,level-start','Model retry lifecycle wrong');result.checks.push({name:'required-model-error-and-real-retry',events});
    s=await embed('?level=1');await driver.dragMode();
    let before=await read();await frame.locator('[data-action=help]').click();const pausedState=await read(),paused=pausedState.activeSeconds;assert(Number.isFinite(paused),'No observable active simulation clock');await page.waitForTimeout(800);s=await read();assert(s.activeSeconds===paused&&s.audio.paused&&JSON.stringify(s.world.player.position)===JSON.stringify(pausedState.world.player.position),'Help did not freeze time/position/audio');await frame.locator('[data-action=resume]').click();assert((await messages()).filter(e=>e.data.type==='level-start').length===1,'Pause/resume duplicated start');
    const retryObservation=await driver.key('KeyR');s=await read();assert(s.world.respawns===1,'Normal retry did not occur');events=await messages();assert(events.filter(e=>e.data.type==='level-start').length===2&&!events.some(e=>e.data.type==='level-complete'),'Retry lifecycle wrong');
    const attemptStart=retryObservation.activeSecondsAtKeydown;result.checks.push({name:'help-freeze-and-real-R-attempt',before,paused,after:s,events,retryObservation});
    s=await driver.playC1({capture,poster:async()=>{
        await page.screenshot({path:new URL('../../public/poster.png',import.meta.url).pathname});
        result.poster={path:'public/poster.png',state:await read(),sha256:createHash('sha256').update(await fs.readFile(new URL('../../public/poster.png',import.meta.url))).digest('hex'),scope:'Unedited actual gameplay screenshot; original 1440x900, no mockup or image generation.'};
    }});
    await page.waitForTimeout(500);events=await messages();const completions=events.filter(e=>e.data.type==='level-complete');assert(completions.length===1&&completions[0].data.level===1,'Goal did not send exactly one completion');assert(completions[0].data.durationMs===Math.round((s.activeSeconds-attemptStart)*1000),'Duration is not active attempt time');assert(s.progress.completed.join(',')==='1','Saved campaign did not record actual room1');
    await capture('06-real-C1-completion');result.checks.push({name:'actual-C1-physical-completion-and-pause-excluded-duration',state:s,events,attemptStart});
    await frame.locator('[data-action=second]').click();s=await read();events=await messages();assert(s.level===2&&s.mode==='playing'&&events.at(-1).data.type==='level-start'&&events.at(-1).data.level===2,'Real Next did not start room2');await capture('07-next-room2');
    await frame.locator('[data-action=pause]').click();await frame.locator('[data-action=restart]').click();events=await messages();assert(events.filter(e=>e.data.type==='level-start'&&e.data.level===2).length===2,'Restart did not make fresh attempt');assert(events.filter(e=>e.data.type==='ready').length===1,'Restart repeated ready');result.checks.push({name:'next-and-restart',state:await read(),events});
    assert(result.errors.length===0,'Unexpected browser errors recorded');
    result.status='passed';
}catch(error){result.status='failed';result.failure=String(error);console.error(error);if(frame)await capture('FAILED').catch(()=>{});process.exitCode=1;}
finally{await fs.writeFile(out+'RESULT.json',JSON.stringify(result,null,2));await context?.close();await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));console.log(JSON.stringify({status:result.status,checks:result.checks.map(c=>c.name),errors:result.errors,failure:result.failure,poster:result.poster?.path},null,2));}
