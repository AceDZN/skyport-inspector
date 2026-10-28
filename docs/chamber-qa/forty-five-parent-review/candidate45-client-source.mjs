/** DOM-key automated gameplay. Synthetic standard keyboard events; actual physics/render/save. Never writes game/save/body state. */
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/acedzn/dev/AceDZN-exp/skyport-inspector/package.json')('playwright');
import fs from 'node:fs/promises';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
const out=new URL(process.env.RIFT_OUT??'./run/',import.meta.url).pathname;await fs.mkdir(out,{recursive:true});const rawVideo=new URL('./recordings/'+Date.now()+'/',import.meta.url).pathname;await fs.mkdir(rawVideo,{recursive:true});
const browser=await chromium.launch({headless:process.env.RIFT_HEADED!=='1',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:900},storageState:process.env.RIFT_STORAGE||undefined,recordVideo:process.env.RIFT_VIDEO==='1'?{dir:rawVideo,size:{width:1440,height:900}}:undefined}),page=await context.newPage();
const errors=[],consoleErrors=[],actions=[],checkpoints=[],versions=[],modelResponses=[],networkFailures=[];let captureNo=0,mouseX=720,mouseY=450,realTime=true;
page.on('response',r=>{const url=new URL(r.url());if(url.origin==='http://localhost:4261'&&url.pathname.endsWith('.glb'))modelResponses.push({url:r.url(),status:r.status()});});page.on('requestfailed',r=>{if(r.url().startsWith('http://localhost:4261/'))networkFailures.push({url:r.url(),error:r.failure()?.errorText});});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const world=s=>s.world??s,player=s=>world(s).player;
function valueAt(state,query){let value=state;for(const key of query.path.split('.'))value=value?.[key];if(query.id!==undefined)value=value?.find?.(item=>item.id===query.id);if(query.field)for(const key of query.field.split('.'))value=value?.[key];return value;}
function matches(state,query){const value=valueAt(state,query);if(Object.hasOwn(query,'equals'))return JSON.stringify(value)===JSON.stringify(query.equals);return typeof value==='number'&&(query.min===undefined||value>=query.min)&&(query.max===undefined||value<=query.max);}
const check=(condition,message)=>{if(!condition)throw Error(message);};
let writtenActions=0,writtenCheckpoints=0;
const record=()=>({status:'Automated DOM-key browser gameplay; individual assertions and completion states govern scope',scope:'Movement and coarse keyboard look use synthetic standard DOM keyboard events and real browser timers/RAFs. Fine mouse aim/clicks, press and explicitly trusted-key commands use Playwright UI input. Actual game physics/render/audio/save; read-only public snapshots. No save/body/win/machine/clock injection. This is not an all-trusted-input run.',importedEarnedStorage:process.env.RIFT_STORAGE??null,rawVideoDirectory:rawVideo,versions,actions,checkpoints,errors,consoleErrors,modelResponses,networkFailures});
const save=async(final=false)=>{
 const complete=[];while(writtenActions<actions.length){const a=actions[writtenActions];if(!final&&!a.after&&!a.error&&writtenActions===actions.length-1)break;complete.push(JSON.stringify(a));writtenActions++;}if(complete.length)await fs.appendFile(out+'actions.raw.jsonl',complete.join('\n')+'\n');
 const captures=checkpoints.slice(writtenCheckpoints);if(captures.length){await fs.appendFile(out+'checkpoints.raw.jsonl',captures.map(c=>JSON.stringify(c)).join('\n')+'\n');writtenCheckpoints=checkpoints.length;}
 const live={...record(),actions:undefined,checkpoints:undefined,actionCount:actions.length,checkpointCount:checkpoints.length,lastAction:actions.at(-1),lastCheckpoint:checkpoints.at(-1)};
 await fs.writeFile(out+'live.next.json',JSON.stringify(live));await fs.rename(out+'live.next.json',out+'live.json');
 if(final){await fs.writeFile(out+'manifest.next.json',JSON.stringify(record(),null,2));await fs.rename(out+'manifest.next.json',out+'manifest.json');}
};
async function version(){
 await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).mode!=='loading');
 const graphics=await page.evaluate(()=>{
  const state=JSON.parse(window.render_game_to_text());if(!state.world||state.initializationError)return{available:false,reason:'Game renderer has not been constructed; no context created by this observer'};
  const canvas=document.querySelector('#world');const gl=canvas?.getContext('webgl2');if(!gl)return{available:false};
  const ext=gl.getExtension('WEBGL_debug_renderer_info');return{available:true,renderer:ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):String(gl.getParameter(gl.RENDERER)),vendor:ext?String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)):String(gl.getParameter(gl.VENDOR)),version:String(gl.getParameter(gl.VERSION)),attributes:gl.getContextAttributes(),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),pixelRatio:devicePixelRatio};
 });
const scripts=await page.evaluate(()=>[...new Set([...Array.from(document.querySelectorAll('script[src]')).map(e=>e.src),...Array.from(document.querySelectorAll('link[rel="modulepreload"]')).map(e=>e.href),...performance.getEntriesByType('resource').map(e=>e.name).filter(url=>new URL(url).pathname.endsWith('.js'))])]);versions.push({graphics,at:new Date().toISOString(),url:page.url(),scripts:await Promise.all(scripts.map(async url=>({url,sha256:createHash('sha256').update(Buffer.from(await (await fetch(url)).arrayBuffer())).digest('hex')})))});}
async function capture(label){const state=await read(),name=`${String(++captureNo).padStart(3,'0')}-${label.replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)}`;await page.screenshot({path:out+name+'.png'});checkpoints.push({label,capture:name+'.png',state});await save();console.log('CAPTURE',label,JSON.stringify({mode:state.mode,level:state.level,player:player(state),result:world(state).result?.goalMatched}));return state;}
async function time(ms){await page.waitForTimeout(ms);await page.waitForTimeout(20);}
async function key(code,ms){const observed=await page.evaluate(({code,ms})=>new Promise(resolve=>{
 const started=performance.now(),target=document.querySelector('#world');if(!target)throw Error('No game input canvas');const dispatch=type=>target.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));
 setTimeout(()=>{dispatch('keyup');resolve({requestedMs:ms,domIntervalMs:performance.now()-started,scope:'Synthetic standard DOM keyboard events on the running game; actual real timer, no game clock or pose changes'});},ms);dispatch('keydown');
}),{code,ms});const a=actions.at(-1);a.keyTiming??=[];a.keyTiming.push({code,...observed});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function aim(target){
 const resolve=s=>{const p=typeof target==='function'?target(s):target;check(Array.isArray(p)&&p.length===3&&p.every(Number.isFinite),'No finite public target for ordinary mouse aim');return p;};
 for(let coarse=0;coarse<2;coarse++){const s=await read(),p=player(s),d=resolve(s).map((v,i)=>v-[p.position[0],p.position[1]+.65,p.position[2]][i]),yaw=Math.atan2(-d[0],-d[2]),pitch=Math.asin(d[1]/Math.hypot(...d)),dy=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),dp=pitch-p.pitch;let changed=false;
  if(Math.abs(dy)>.4){await key(dy>0?'KeyJ':'KeyL',Math.min(1400,(Math.abs(dy)-.15)/1.5*1000));changed=true;}
  if(Math.abs(dp)>.3){await key(dp>0?'KeyI':'KeyK',Math.min(1100,(Math.abs(dp)-.12)/1.2*1000));changed=true;}
  if(!changed)break;
 }
 for(let pass=0;pass<3;pass++){
 const s=await read(),p=player(s),position=p.position,d=resolve(s).map((v,i)=>v-[position[0],position[1]+.65,position[2]][i]),yaw=Math.atan2(-d[0],-d[2]),pitch=Math.asin(d[1]/Math.hypot(...d));let dy=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),dp=pitch-p.pitch;const sensitivity=s.controls?.sensitivity??.0022;
 if(Math.abs(dy)<=.002&&Math.abs(dp)<=.002)return;
 while(Math.abs(dy)>.002||Math.abs(dp)>.002){const a=Math.max(-.65,Math.min(.65,dy)),b=Math.max(-.4,Math.min(.4,dp));if(Math.abs(a/sensitivity)+Math.abs(b/sensitivity)<1.5)break;
  if(s.pointerLocked){mouseX-=a/sensitivity;mouseY-=b/sensitivity;await page.mouse.move(mouseX,mouseY);}else{check(s.controls?.unlocked,'Lock the mouse or enable unlocked drag through settings first');await page.mouse.move(720,450);await page.mouse.down();mouseX=720-a/sensitivity;mouseY=450-b/sensitivity;await page.mouse.move(mouseX,mouseY);await page.mouse.up();}
  dy-=a;dp-=b;
 }await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}}
async function walk(x,z,stop=.25){let old,stuck=0;for(let i=0;i<100;i++){const s=await read(),p=player(s),pos=p.position,d=Math.hypot(pos[0]-x,pos[2]-z);if(s.mode!=='playing')return;if(d<stop)return;stuck=old&&Math.hypot(pos[0]-old[0],pos[2]-old[2])<.02?stuck+1:0;if(stuck>10)throw Error(`Blocked walking to ${x},${z}; actual ${pos}`);old=pos;await aim([x,pos[1]+.65,z]);await key('KeyW',Math.min(450,d/4.8*1000));}throw Error(`Walking did not reach ${x},${z}`);}
async function command(c){if(c.action==='clock')check(c.mode!=='deterministic','This client never changes game time');const before=await read();actions.push({input:c,before});
 if(c.action==='click'){await page.locator(c.selector).click({noWaitAfter:true,...c.options});await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).mode!=='loading');}
 if(c.action==='check')await page.locator(c.selector).setChecked(c.checked??true);
 if(c.action==='lock'){await page.bringToFront();await page.locator(c.selector??'#world').click({position:{x:720,y:450}});mouseX=720;mouseY=450;await page.waitForTimeout(100);check((await read()).pointerLocked,'Ordinary click did not lock the pointer');}
 if(c.action==='aim')await aim(c.target);
 if(c.action==='aim-crate')await aim(s=>{const cargo=world(s).crates.find(item=>item.id===c.id);check(cargo,'No public cargo '+c.id);return cargo.position;});
 if(c.action==='face'){check(Array.isArray(c.direction)&&c.direction.length===3&&c.direction.every(Number.isFinite)&&Math.hypot(...c.direction)>0,'No finite look direction');await aim(s=>player(s).position.map((v,i)=>v+(i===1?.65:0)+c.direction[i]*20));}
 if(c.action==='mouse'){mouseX+=c.dx;mouseY+=c.dy;await page.mouse.move(mouseX,mouseY);}
 if(c.action==='place'){const button=c.index===1?'right':'left';await page.mouse.down({button});await page.mouse.up({button});await time(160);}
 if(c.action==='key')await key(c.code,c.ms);
 if(c.action==='trusted-key'){const started=Date.now(),down=page.keyboard.down(c.code);await new Promise(resolve=>setTimeout(resolve,c.ms));const upSent=Date.now(),up=page.keyboard.up(c.code);const responses=await Promise.allSettled([down,up]);actions.at(-1).trustedKeyTiming={code:c.code,requestedMs:c.ms,localSendIntervalMs:upSent-started,totalResponseMs:Date.now()-started,scope:'Trusted Playwright keyboard down/up, real local timer; no game-state writes'};for(const r of responses)if(r.status==='rejected')throw r.reason;await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
 if(c.action==='press')await page.keyboard.press(c.code);
 if(c.action==='walk')await walk(c.x,c.z,c.stop??.25);
 if(c.action==='wait')await time(c.ms);
 if(c.action==='performance-sample')actions.at(-1).frameTiming=await page.evaluate(duration=>new Promise(resolve=>{const start=performance.now(),intervals=[];let previous=start;function sample(now){intervals.push(now-previous);previous=now;if(now-start<duration){requestAnimationFrame(sample);return;}const sorted=[...intervals].sort((a,b)=>a-b);resolve({scope:'Read-only real requestAnimationFrame observations; no game clock or pose changes',durationMs:now-start,frames:intervals.length,meanIntervalMs:intervals.reduce((a,b)=>a+b,0)/intervals.length,maxIntervalMs:sorted.at(-1),p95IntervalMs:sorted[Math.floor((sorted.length-1)*.95)]});}requestAnimationFrame(sample);}),c.ms??1500);
 if(c.action==='key-until'){
  actions.at(-1).domKeyObservation=await page.evaluate(({codes,queries,timeout})=>new Promise((resolve,reject)=>{
   const started=performance.now(),target=document.querySelector('#world');if(!target)throw Error('No game input canvas');let finished=false;
   const dispatch=type=>{for(const code of codes)target.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));};
   const end=error=>{if(finished)return;finished=true;dispatch('keyup');if(error)reject(Error(error));else resolve({scope:'Synthetic DOM key hold, read-only public state observed each real RAF; no game state/clock assignments',elapsedMs:performance.now()-started,codes});};
   dispatch('keydown');const timer=setTimeout(()=>end('Timed out observing DOM-key gameplay condition'),timeout);
   function observe(){if(finished)return;try{const s=JSON.parse(window.render_game_to_text());const matched=queries.every(q=>{let v=s;for(const k of q.path.split('.'))v=v?.[k];if(q.id!==undefined)v=v?.find?.(item=>item.id===q.id);if(q.field)for(const k of q.field.split('.'))v=v?.[k];if(Object.hasOwn(q,'equals'))return JSON.stringify(v)===JSON.stringify(q.equals);return typeof v==='number'&&(q.min===undefined||v>=q.min)&&(q.max===undefined||v<=q.max);});if(matched){clearTimeout(timer);end();return;}requestAnimationFrame(observe);}catch(error){clearTimeout(timer);end(String(error));}}
   requestAnimationFrame(observe);
  }),{codes:c.codes??[c.code],queries:c.conditions??[c],timeout:c.timeoutMs??5000});
 }
 if(c.action==='key-when'){
  actions.at(-1).domDockInput=await page.evaluate(({codes,when,until,waitTimeout,moveTimeout,stableMs,freshArrival,moveDuration})=>new Promise((resolve,reject)=>{
   const target=document.querySelector('#world');if(!target)throw Error('No normal input canvas');let finished=false,moving=false,away=!freshArrival,stableSince=0,moveStarted=0,startState,waitingFrames=0,movingFrames=0;const started=performance.now();
   const dispatch=type=>{for(const code of codes)target.dispatchEvent(new KeyboardEvent(type,{code,key:code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));};
   const matches=(s,q)=>{let v=s;for(const k of q.path.split('.'))v=v?.[k];if(q.id!==undefined)v=v?.find?.(i=>i.id===q.id);if(q.field)for(const k of q.field.split('.'))v=v?.[k];if(Object.hasOwn(q,'equals'))return JSON.stringify(v)===JSON.stringify(q.equals);return typeof v==='number'&&(q.min===undefined||v>=q.min)&&(q.max===undefined||v<=q.max);};
   let timer;const end=(error,state)=>{if(finished)return;finished=true;clearTimeout(timer);if(moving)dispatch('keyup');if(error)reject(Error(error));else resolve({scope:'Read-only public dock/support observation on real RAF followed by ordinary synthetic DOM key down/up in the same browser; no game/body/camera/machine/save/clock writes',elapsedMs:performance.now()-started,waitMs:moveStarted-started,moveMs:performance.now()-moveStarted,waitingFrames,movingFrames,codes,startState,endState:state});};
   timer=setTimeout(()=>end('Timed out waiting/moving with ordinary dock input'),waitTimeout+moveTimeout+500);
   function observe(now){if(finished)return;try{const s=JSON.parse(render_game_to_text());if(!moving){waitingFrames++;const at=s.mode==='playing'&&when.every(q=>matches(s,q));if(!at){away=true;stableSince=0;}else if(away){stableSince||=now;if(now-stableSince>=stableMs){moving=true;moveStarted=performance.now();startState=s;dispatch('keydown');}}if(!moving&&now-started>waitTimeout){end('Real dock/support never reached input condition',s);return;}}else{movingFrames++;if(moveDuration!==null?now-moveStarted>=moveDuration:until.every(q=>matches(s,q))){end(null,s);return;}if(now-moveStarted>moveTimeout){end('Ordinary dock movement did not reach safe support',s);return;}}requestAnimationFrame(observe);}catch(error){end(String(error));}}
   requestAnimationFrame(observe);
  }),{codes:c.codes??[c.code??'KeyW'],when:c.when,until:c.until??[],waitTimeout:c.waitTimeoutMs??45000,moveTimeout:c.moveTimeoutMs??6000,stableMs:c.stableMs??160,freshArrival:c.freshArrival??true,moveDuration:c.ms??null});
 }
 if(c.action==='wait-device'){
  const deadline=Date.now()+(c.timeoutMs??30000),samples=[];let away=!c.freshArrival,stableSince=0,matched=false;
  while(Date.now()<deadline){
   const s=await read(),w=world(s),d=w.devices.find(d=>d.id===c.id);check(d,'No visible native device '+c.id);
   const distance=c.position?Math.hypot(...d.position.map((v,i)=>v-c.position[i])):0,moving=!!w.signals?.['moving:'+c.id],at=distance<=(c.tolerance??.015)&&(c.settled===false||!moving)&&(c.minY===undefined||d.position[1]>=c.minY)&&(c.maxY===undefined||d.position[1]<=c.maxY);
   samples.push({at:new Date().toISOString(),position:d.position,progress:d.progress,moving});if(samples.length>30)samples.shift();
   if(!at){away=true;stableSince=0;}else if(away){stableSince||=Date.now();if(Date.now()-stableSince>=(c.stableMs??200)){matched=true;break;}}
   await page.waitForTimeout(40);
  }
  actions.at(-1).deviceWait={id:c.id,freshArrival:!!c.freshArrival,samples};
  check(matched,'Native device did not reach a real settled stop '+c.id);
 }

 if(c.action==='wait-for'){const started=Date.now();let stableSince;while(true){const current=await read(),now=Date.now(),ok=(c.conditions??[c]).every(condition=>matches(current,condition));if(ok){stableSince??=now;if(now-stableSince>=(c.stableMs??0))break;}else stableSince=undefined;check(now-started<(c.timeoutMs??30000),`Timed out waiting for actual public state: ${JSON.stringify(c.conditions??[c])}`);await time(c.pollMs??80);}}
 if(c.action==='wait-audio-ready')await page.waitForFunction(()=>JSON.parse(render_game_to_text()).audio.loadedBuffers===29,{},{timeout:30000});
 if(c.action==='trajectory'){for(let i=0;i<c.samples;i++){await time(c.ms??33);const state=await read();checkpoints.push({label:'trajectory-'+i,state});if(i%(c.captureEvery??4)===0)await capture('trajectory-'+i);}}
 if(c.action==='capture')await capture(c.name);
 if(c.action==='assert'){const v=valueAt(await read(),c);check(JSON.stringify(v)===JSON.stringify(c.equals),`Expected ${c.path}${c.id?' id='+c.id:''}${c.field?'.'+c.field:''}=${JSON.stringify(c.equals)}, got ${JSON.stringify(v)}`);}
 if(c.action==='assert-range'){const v=valueAt(await read(),c);check(typeof v==='number'&&(c.min===undefined||v>=c.min)&&(c.max===undefined||v<=c.max),`Expected ${c.path}${c.id?' id='+c.id:''}${c.field?'.'+c.field:''} in [${c.min??'-∞'},${c.max??'∞'}], got ${JSON.stringify(v)}`);}
 if(c.action==='assert-facing'){const p=player(await read()),d=c.direction;check(Array.isArray(d)&&d.length===3&&d.every(Number.isFinite)&&Math.hypot(...d)>0,'Invalid expected facing');const yaw=Math.atan2(-d[0],-d[2]),pitch=Math.atan2(d[1],Math.hypot(d[0],d[2])),error=Math.abs(Math.atan2(Math.sin(p.yaw-yaw),Math.cos(p.yaw-yaw)));check(error<=(c.tolerance??.03)&&Math.abs(p.pitch-pitch)<=(c.tolerance??.03),'Ordinary mouse/keyboard look did not reach the expected direction');actions.at(-1).facingError={yawRadians:error,pitchRadians:Math.abs(p.pitch-pitch)};}
 if(c.action==='reload'){await page.reload();await page.waitForFunction(()=>window.render_game_to_text);await version();await capture('reload');}
 if(c.action==='paused-input')throw Error('Use real-time paused-observation; deterministic stepping is disabled');
 if(c.action==='paused-observation'){const start=await read();check(['pause','help','settings','journal'].includes(start.mode),'Open a real reading/pause panel first');try{await page.keyboard.down('KeyW');await page.waitForTimeout(c.ms??600);}finally{await page.keyboard.up('KeyW');}const end=await read();const delta=Math.hypot(...player(end).position.map((v,i)=>v-player(start).position[i]));check(delta<1e-6,'Actor moved while reading');check(JSON.stringify(world(start).devices)===JSON.stringify(world(end).devices),'Machinery moved while reading');check(end.audio.paused===true,'Reading panel leaves audio active');actions.at(-1).pausedObservation={scope:'Real-time ordinary W attempt while paused; no advanceTime call',mode:start.mode,actualPositionDelta:delta,machineryUnchanged:true,audioPaused:end.audio.paused};}
 if(c.action==='keys'){for(const code of c.codes)await page.keyboard.down(code);await time(c.ms);for(const code of c.codes)await page.keyboard.up(code);}
 if(c.action==='movement-check'){const start=player(await read()).position;for(const code of c.codes)await page.keyboard.down(code);await time(c.ms);for(const code of c.codes)await page.keyboard.up(code);const end=player(await read()).position,distance=Math.hypot(end[0]-start[0],end[2]-start[2]);actions.at(-1).movement={start,end,distance};check(distance>=(c.minDistance??.4),`Ordinary ${c.codes.join('+')} movement pinned: ${distance}m`);}
 if(c.action==='keyboard-look-check'){const start=player(await read());await key('KeyJ',180);await key('KeyI',130);const end=player(await read());check(Math.abs(end.yaw-start.yaw)>.1,'J keyboard look did not change yaw');check(Math.abs(end.pitch-start.pitch)>.05,'I keyboard look did not change pitch');}
 if(c.action==='focus-cycle'){await page.keyboard.down('KeyW');const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(180);actions.at(-1).browserFocus={source:await page.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus()})),other:await other.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus()}))};await page.bringToFront();await page.keyboard.up('KeyW');await other.close();check((await read()).mode==='pause','Changing tab did not pause the game');}
 if(c.action==='fullscreen-check'){await page.keyboard.press('KeyF');await page.waitForTimeout(200);const active=await page.evaluate(()=>!!document.fullscreenElement);check(active,'F did not enter fullscreen');await page.keyboard.press('KeyF');await page.waitForTimeout(200);check(!await page.evaluate(()=>!!document.fullscreenElement),'Second F did not toggle fullscreen off');await page.keyboard.press('KeyF');await page.waitForTimeout(200);check(await page.evaluate(()=>!!document.fullscreenElement),'F did not re-enter fullscreen');await page.keyboard.press('Escape');await page.waitForTimeout(200);check(!await page.evaluate(()=>!!document.fullscreenElement),'Escape did not exit fullscreen');check((await read()).mode==='pause','Escape did not also pause the puzzle');}
 if(c.action==='press-repeat')for(let i=0;i<c.count;i++)await page.keyboard.press(c.code);
 if(c.action==='viewport')await page.setViewportSize({width:c.width,height:c.height});
 if(c.action==='export-earned-save'){const s=await read();check(s.mode==='complete'||world(s).result?.goalMatched===true||[1,2].every(n=>s.progress?.completed?.includes(n)),'Export requires an actual earned completion');await context.storageState({path:out+'earned-game-only-storage.json'});}
 actions.at(-1).after=await read();await save();const s=actions.at(-1).after;console.log('INPUT',JSON.stringify(c),JSON.stringify({mode:s.mode,level:s.level,player:player(s),held:world(s).held,result:world(s).result?{goalMatched:world(s).result.goalMatched,exit:world(s).result.exit}:null}));
}
let rl;
try{await page.goto(process.env.RIFT_URL??'http://localhost:4261/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.render_game_to_text);await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode!=='loading',{},{timeout:120000});await page.bringToFront();await version();await capture('fresh-entry');console.log('COMMAND_READY');const lines=process.env.RIFT_ACTIONS?(await fs.readFile(process.env.RIFT_ACTIONS,'utf8')).split(/\r?\n/).filter(Boolean):(rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity}));for await(const line of lines){try{const c=JSON.parse(line);if(c.action==='close'){rl?.close();process.stdin.pause();break;}await command(c);console.log('COMMAND_READY');}catch(e){actions.push({input:line,error:String(e),state:await read()});console.error('COMMAND_BLOCKED',String(e));await capture('blocked');if(process.env.RIFT_STRICT==='1')throw e;console.log('COMMAND_READY');}}}catch(e){process.exitCode=1;console.error(e);checkpoints.push({fatal:String(e),state:await read().catch(()=>null)});}finally{await save(true);rl?.close();process.stdin.pause();await context.close();await browser.close();}
