import{chromium}from'playwright';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});const page=await browser.newPage({viewport:{width:1120,height:760}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
async function record(step){const s=await read();checks.push({step,mode:s.mode,audio:s.audio,player:s.world.player,portals:s.world.portals,events:s.events,assistance:s.assistance});console.log(step,JSON.stringify({mode:s.mode,audio:s.audio}));await writeFile('docs/rift-audio/integrated-browser-check.json',JSON.stringify({checks,errors},null,2));return s;}
const press=async selector=>page.locator(selector).press('Enter');
async function pulse(code,ms){await page.keyboard.down(code);await page.evaluate(ms=>advanceTime(ms),ms);await page.keyboard.up(code);}
function wrap(a){return Math.atan2(Math.sin(a),Math.cos(a));}
async function aimYaw(yaw){for(let i=0;i<2;i++){const s=await read();const delta=wrap(yaw-s.world.player.yaw);if(Math.abs(delta)<.015)break;await pulse(delta>0?'KeyJ':'KeyL',Math.abs(delta)/1.5*1000);} }
try{
 await page.goto(process.env.RIFT_AUDIO_URL||'http://localhost:4261/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.render_game_to_text);await record('before Start');await press('#start-btn');await page.waitForFunction(()=>JSON.parse(render_game_to_text()).audio.loadedBuffers===18);await page.waitForTimeout(400);await record('Start running18buffers3loops');
 await press('[data-action=settings]');for(const[bus,v]of Object.entries({master:.6,music:.35,sfx:.45,voice:.4}))await page.locator(`[data-gain=${bus}]`).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(v));await press('[data-action=sound-test]');await page.waitForTimeout(220);await record('settings sliders and actual portal sound test');await press('[data-action=mute]');await page.waitForTimeout(200);await record('master mute');
 for(const[bus,v]of Object.entries({master:.8,music:.7,sfx:.74,voice:.8}))await page.locator(`[data-gain=${bus}]`).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(v));await page.keyboard.press('Escape');await page.waitForTimeout(200);await record('Escape exits settings and resumes');
 await canvasFocus();await pulse('Space',120);await page.evaluate(()=>advanceTime(1200));await record('jump and land from actual input');
 await aimYaw(.484);await page.keyboard.press('Digit1');await record('actual portalA placement');await aimYaw(.1815);await page.keyboard.press('Digit2');await page.waitForTimeout(1000);await record('actual portalB placement and pair stem');
 await aimYaw(.484);await pulse('KeyW',1900);await page.waitForTimeout(120);await record((await read()).world.player.crossings>0?'actual traversal emits entry and exit':'linked portal approach blocked; no traversal');await page.screenshot({path:'docs/rift-audio/integrated-gameplay.png'});
 await page.keyboard.press('KeyR');await page.waitForTimeout(150);await record('keyboard checkpoint retry during play');
 await page.keyboard.press('Escape');await page.waitForTimeout(300);await record('Escape pause');await page.keyboard.press('Escape');await page.waitForTimeout(250);await record('Escape resume');
 await page.keyboard.press('Escape');await press('[data-action=restart-room]');await page.waitForTimeout(250);await record('full room restart from pause');
 await page.keyboard.press('Escape');await press('[data-action=retry]');await page.waitForTimeout(300);await record('safe checkpoint retry from pause');
 await press('[data-action=settings]');await press('[data-action=sound-test]');await page.waitForTimeout(200);await record('sound test after retry');await page.keyboard.press('Escape');await page.waitForTimeout(200);await record('final resume');
}catch(e){errors.push(String(e));}finally{await writeFile('docs/rift-audio/integrated-browser-check.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checkCount:checks.length,errors},null,2));await browser.close();}
async function canvasFocus(){await page.locator('#world').focus();}
