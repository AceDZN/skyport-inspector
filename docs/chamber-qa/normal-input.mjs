/** Interactive real-input QA. It reads public snapshots and steps time; never writes game/save/body state. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
const out=new URL(process.env.RIFT_OUT??'./run/',import.meta.url).pathname;await fs.mkdir(out,{recursive:true});const rawVideo=new URL('../../work/chamber-qa-video/'+Date.now()+'/',import.meta.url).pathname;await fs.mkdir(rawVideo,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:process.env.RIFT_VIDEO==='1'?{dir:rawVideo,size:{width:1440,height:900}}:undefined}),page=await context.newPage();
const errors=[],consoleErrors=[],actions=[],checkpoints=[],versions=[];let captureNo=0,mouseX=720,mouseY=450,realTime=true;
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
const read=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const world=s=>s.world??s,player=s=>world(s).player;
const check=(condition,message)=>{if(!condition)throw Error(message);};
const save=()=>fs.writeFile(out+'manifest.json',JSON.stringify({status:'IN PROGRESS — two-chamber QA, no campaign completion claim',scope:'Ordinary mouse/keyboard UI inputs; render_game_to_text and advanceTime only; no save/body/win injection',rawVideoDirectory:rawVideo,versions,actions,checkpoints,errors,consoleErrors},null,2));
async function version(){const scripts=await page.locator('script[src]').evaluateAll(els=>els.map(e=>e.src));versions.push({at:new Date().toISOString(),url:page.url(),scripts:await Promise.all(scripts.map(async url=>({url,sha256:createHash('sha256').update(Buffer.from(await (await fetch(url)).arrayBuffer())).digest('hex')})))});}
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
 if(c.action==='trajectory'){for(let i=0;i<c.samples;i++){await time(c.ms??33);const state=await read();checkpoints.push({label:'trajectory-'+i,state});if(i%(c.captureEvery??4)===0)await capture('trajectory-'+i);}}
 if(c.action==='capture')await capture(c.name);
 if(c.action==='assert'){let v=await read();for(const k of c.path.split('.'))v=v?.[k];check(JSON.stringify(v)===JSON.stringify(c.equals),`Expected ${c.path}=${JSON.stringify(c.equals)}, got ${JSON.stringify(v)}`);}
 if(c.action==='reload'){await page.reload();await page.waitForFunction(()=>window.render_game_to_text);await version();await capture('reload');}
 if(c.action==='paused-input'){const start=await read();check(['pause','help','settings'].includes(start.mode),'Pause/help must be opened through UI first');const p0=player(start).position;await page.keyboard.down('KeyW');await time(c.ms??500);await page.evaluate(()=>advanceTime(1000));await page.keyboard.up('KeyW');const end=await read();check(Math.hypot(...player(end).position.map((v,i)=>v-p0[i]))<1e-6,'Physics moves while reading/paused');check(end.audio.paused===true,'Pause/help does not pause audio');}
 if(c.action==='keys'){for(const code of c.codes)await page.keyboard.down(code);await time(c.ms);for(const code of c.codes)await page.keyboard.up(code);}
 if(c.action==='viewport')await page.setViewportSize({width:c.width,height:c.height});
 if(c.action==='export-earned-save'){const s=await read();check(s.mode==='complete'||world(s).result?.goalMatched===true||[1,2].every(n=>s.progress?.completed?.includes(n)),'Export requires an actual earned completion');await context.storageState({path:out+'earned-game-only-storage.json'});}
 actions.at(-1).after=await read();await save();const s=actions.at(-1).after;console.log('INPUT',JSON.stringify(c),JSON.stringify({mode:s.mode,level:s.level,player:player(s),held:world(s).held,result:world(s).result}));
}
let rl;
try{await page.goto(process.env.RIFT_URL??'http://localhost:4261/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.render_game_to_text);await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode!=='loading',{},{timeout:120000});await page.bringToFront();await version();await capture('fresh-entry');console.log('COMMAND_READY');const lines=process.env.RIFT_ACTIONS?(await fs.readFile(process.env.RIFT_ACTIONS,'utf8')).split(/\r?\n/).filter(Boolean):(rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity}));for await(const line of lines){try{const c=JSON.parse(line);if(c.action==='close'){rl?.close();process.stdin.pause();break;}await command(c);console.log('COMMAND_READY');}catch(e){actions.push({input:line,error:String(e),state:await read()});console.error('COMMAND_BLOCKED',String(e));await capture('blocked');if(process.env.RIFT_STRICT==='1')throw e;console.log('COMMAND_READY');}}}catch(e){process.exitCode=1;console.error(e);checkpoints.push({fatal:String(e),state:await read().catch(()=>null)});}finally{await save();rl?.close();process.stdin.pause();await context.close();await browser.close();}
