/** Interactive real-input QA. It reads public snapshots and steps time; never writes game/save/body state. */
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/acedzn/dev/AceDZN-exp/skyport-inspector/package.json')('playwright');
import fs from 'node:fs/promises';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
const out=new URL(process.env.RIFT_OUT??'./run/',import.meta.url).pathname;await fs.mkdir(out,{recursive:true});const rawVideo=new URL('./recordings/'+Date.now()+'/',import.meta.url).pathname;await fs.mkdir(rawVideo,{recursive:true});
const browser=await chromium.launch({headless:process.env.RIFT_HEADED!=='1',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:900},storageState:process.env.RIFT_STORAGE||undefined,recordVideo:process.env.RIFT_VIDEO==='1'?{dir:rawVideo,size:{width:1440,height:900}}:undefined}),page=await context.newPage();
const errors=[],consoleErrors=[],actions=[],checkpoints=[],versions=[];let captureNo=0,mouseX=720,mouseY=450,realTime=true;
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const world=s=>s.world??s,player=s=>world(s).player;
function valueAt(state,query){let value=state;for(const key of query.path.split('.'))value=value?.[key];if(query.id!==undefined)value=value?.find?.(item=>item.id===query.id);if(query.field)for(const key of query.field.split('.'))value=value?.[key];return value;}
function matches(state,query){const value=valueAt(state,query);if(Object.hasOwn(query,'equals'))return JSON.stringify(value)===JSON.stringify(query.equals);return typeof value==='number'&&(query.min===undefined||value>=query.min)&&(query.max===undefined||value<=query.max);}
const check=(condition,message)=>{if(!condition)throw Error(message);};
const save=()=>fs.writeFile(out+'manifest.json',JSON.stringify({status:'Independent normal-input continuation; individual assertions and completion states govern scope',scope:'Ordinary mouse/keyboard UI inputs; render_game_to_text and advanceTime only; no save/body/win injection',importedEarnedStorage:process.env.RIFT_STORAGE??null,rawVideoDirectory:rawVideo,versions,actions,checkpoints,errors,consoleErrors},null,2));
async function version(){
 await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).mode!=='loading');
 const graphics=await page.evaluate(()=>{
  const canvas=document.querySelector('#world');const gl=canvas?.getContext('webgl2');if(!gl)return{available:false};
  const ext=gl.getExtension('WEBGL_debug_renderer_info');return{available:true,renderer:ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):String(gl.getParameter(gl.RENDERER)),vendor:ext?String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)):String(gl.getParameter(gl.VENDOR)),version:String(gl.getParameter(gl.VERSION)),attributes:gl.getContextAttributes(),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),pixelRatio:devicePixelRatio};
 });
const scripts=await page.evaluate(()=>[...new Set([...Array.from(document.querySelectorAll('script[src]')).map(e=>e.src),...Array.from(document.querySelectorAll('link[rel="modulepreload"]')).map(e=>e.href),...performance.getEntriesByType('resource').map(e=>e.name).filter(url=>new URL(url).pathname.endsWith('.js'))])]);versions.push({graphics,at:new Date().toISOString(),url:page.url(),scripts:await Promise.all(scripts.map(async url=>({url,sha256:createHash('sha256').update(Buffer.from(await (await fetch(url)).arrayBuffer())).digest('hex')})))});}
async function capture(label){const state=await read(),name=`${String(++captureNo).padStart(3,'0')}-${label.replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)}`;await page.screenshot({path:out+name+'.png'});checkpoints.push({label,capture:name+'.png',state});await save();console.log('CAPTURE',label,JSON.stringify({mode:state.mode,level:state.level,player:player(state),result:world(state).result?.goalMatched}));return state;}
async function time(ms){if(realTime)await page.waitForTimeout(ms);else await page.evaluate(ms=>window.advanceTime(ms),ms);await page.waitForTimeout(20);}
async function key(code,ms){await page.keyboard.down(code);await time(ms);await page.keyboard.up(code);await page.waitForTimeout(20);}
async function aim(target){for(let pass=0;pass<3;pass++){
 const s=await read(),p=player(s),position=p.position,d=target.map((v,i)=>v-[position[0],position[1]+.65,position[2]][i]),yaw=Math.atan2(-d[0],-d[2]),pitch=Math.asin(d[1]/Math.hypot(...d));let dy=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)),dp=pitch-p.pitch;const sensitivity=s.controls?.sensitivity??.0022;
 while(Math.abs(dy)>.002||Math.abs(dp)>.002){const a=Math.max(-.65,Math.min(.65,dy)),b=Math.max(-.4,Math.min(.4,dp));if(Math.abs(a/sensitivity)+Math.abs(b/sensitivity)<1.5)break;
  if(s.pointerLocked){mouseX-=a/sensitivity;mouseY-=b/sensitivity;await page.mouse.move(mouseX,mouseY);}else{check(s.controls?.unlocked,'Lock the mouse or enable unlocked drag through settings first');await page.mouse.move(720,450);await page.mouse.down();mouseX=720-a/sensitivity;mouseY=450-b/sensitivity;await page.mouse.move(mouseX,mouseY);await page.mouse.up();}
  dy-=a;dp-=b;
 }await page.waitForTimeout(20);
}}
async function walk(x,z,stop=.25){let old,stuck=0;for(let i=0;i<100;i++){const s=await read(),p=player(s),pos=p.position,d=Math.hypot(pos[0]-x,pos[2]-z);if(s.mode!=='playing')return;if(d<stop)return;stuck=old&&Math.hypot(pos[0]-old[0],pos[2]-old[2])<.02?stuck+1:0;if(stuck>10)throw Error(`Blocked walking to ${x},${z}; actual ${pos}`);old=pos;await aim([x,pos[1]+.65,z]);await key('KeyW',Math.min(110,d/4.8*1000));}throw Error(`Walking did not reach ${x},${z}`);}
async function command(c){if(c.action==='clock')realTime=c.mode!=='deterministic';const before=await read();actions.push({input:c,before});
 if(c.action==='click')await page.locator(c.selector).click(c.options??{});
 if(c.action==='check')await page.locator(c.selector).setChecked(c.checked??true);
 if(c.action==='lock'){await page.bringToFront();await page.locator(c.selector??'#world').click({position:{x:720,y:450}});mouseX=720;mouseY=450;await page.waitForTimeout(100);check((await read()).pointerLocked,'Ordinary click did not lock the pointer');}
 if(c.action==='aim')await aim(c.target);
 if(c.action==='mouse'){mouseX+=c.dx;mouseY+=c.dy;await page.mouse.move(mouseX,mouseY);}
 if(c.action==='place'){const button=c.index===1?'right':'left';await page.mouse.down({button});await page.mouse.up({button});await time(160);}
 if(c.action==='key')await key(c.code,c.ms);
 if(c.action==='press')await page.keyboard.press(c.code);
 if(c.action==='walk')await walk(c.x,c.z,c.stop??.25);
 if(c.action==='wait')await time(c.ms);
 if(c.action==='key-until'){
  const codes=c.codes??[c.code],started=Date.now();let awaitState=await read();
  try{for(const code of codes)await page.keyboard.down(code);
   while(!(c.conditions??[c]).every(condition=>matches(awaitState,condition))){
    await page.waitForTimeout(c.pollMs??20);awaitState=await read();
    check(Date.now()-started<(c.timeoutMs??5000),'Timed out holding ordinary keys for '+JSON.stringify(c.conditions??[c]));
   }
  }finally{for(const code of codes)await page.keyboard.up(code);}
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
 if(c.action==='reload'){await page.reload();await page.waitForFunction(()=>window.render_game_to_text);await version();await capture('reload');}
 if(c.action==='paused-input'){const start=await read();check(['pause','help','settings'].includes(start.mode),'Pause/help must be opened through UI first');const p0=player(start).position;await page.keyboard.down('KeyW');await time(c.ms??500);await page.evaluate(()=>advanceTime(1000));await page.keyboard.up('KeyW');const end=await read();check(Math.hypot(...player(end).position.map((v,i)=>v-p0[i]))<1e-6,'Physics moves while reading/paused');check(end.audio.paused===true,'Pause/help does not pause audio');}
 if(c.action==='keys'){for(const code of c.codes)await page.keyboard.down(code);await time(c.ms);for(const code of c.codes)await page.keyboard.up(code);}
 if(c.action==='movement-check'){const start=player(await read()).position;for(const code of c.codes)await page.keyboard.down(code);await time(c.ms);for(const code of c.codes)await page.keyboard.up(code);const end=player(await read()).position,distance=Math.hypot(end[0]-start[0],end[2]-start[2]);actions.at(-1).movement={start,end,distance};check(distance>=(c.minDistance??.4),`Ordinary ${c.codes.join('+')} movement pinned: ${distance}m`);}
 if(c.action==='keyboard-look-check'){const start=player(await read());await key('KeyJ',180);await key('KeyI',130);const end=player(await read());check(Math.abs(end.yaw-start.yaw)>.1,'J keyboard look did not change yaw');check(Math.abs(end.pitch-start.pitch)>.05,'I keyboard look did not change pitch');}
 if(c.action==='focus-cycle'){await page.keyboard.down('KeyW');const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(180);actions.at(-1).browserFocus={source:await page.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus()})),other:await other.evaluate(()=>({hidden:document.hidden,focus:document.hasFocus()}))};await page.bringToFront();await page.keyboard.up('KeyW');await other.close();check((await read()).mode==='pause','Changing tab did not pause the game');}
 if(c.action==='fullscreen-check'){await page.keyboard.press('KeyF');await page.waitForTimeout(200);const active=await page.evaluate(()=>!!document.fullscreenElement);check(active,'F did not enter fullscreen');await page.keyboard.press('KeyF');await page.waitForTimeout(200);check(!await page.evaluate(()=>!!document.fullscreenElement),'Second F did not toggle fullscreen off');await page.keyboard.press('KeyF');await page.waitForTimeout(200);check(await page.evaluate(()=>!!document.fullscreenElement),'F did not re-enter fullscreen');await page.keyboard.press('Escape');await page.waitForTimeout(200);check(!await page.evaluate(()=>!!document.fullscreenElement),'Escape did not exit fullscreen');check((await read()).mode==='pause','Escape did not also pause the puzzle');}
 if(c.action==='press-repeat')for(let i=0;i<c.count;i++)await page.keyboard.press(c.code);
 if(c.action==='viewport')await page.setViewportSize({width:c.width,height:c.height});
 if(c.action==='export-earned-save'){const s=await read();check(s.mode==='complete'||world(s).result?.goalMatched===true||[1,2].every(n=>s.progress?.completed?.includes(n)),'Export requires an actual earned completion');await context.storageState({path:out+'earned-game-only-storage.json'});}
 actions.at(-1).after=await read();await save();const s=actions.at(-1).after;console.log('INPUT',JSON.stringify(c),JSON.stringify({mode:s.mode,level:s.level,player:player(s),held:world(s).held,result:world(s).result}));
}
let rl;
try{await page.goto(process.env.RIFT_URL??'http://localhost:4261/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.render_game_to_text);await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode!=='loading',{},{timeout:120000});await page.bringToFront();await version();await capture('fresh-entry');console.log('COMMAND_READY');const lines=process.env.RIFT_ACTIONS?(await fs.readFile(process.env.RIFT_ACTIONS,'utf8')).split(/\r?\n/).filter(Boolean):(rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity}));for await(const line of lines){try{const c=JSON.parse(line);if(c.action==='close'){rl?.close();process.stdin.pause();break;}await command(c);console.log('COMMAND_READY');}catch(e){actions.push({input:line,error:String(e),state:await read()});console.error('COMMAND_BLOCKED',String(e));await capture('blocked');if(process.env.RIFT_STRICT==='1')throw e;console.log('COMMAND_READY');}}}catch(e){process.exitCode=1;console.error(e);checkpoints.push({fatal:String(e),state:await read().catch(()=>null)});}finally{await save();rl?.close();process.stdin.pause();await context.close();await browser.close();}
