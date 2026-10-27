import {chromium} from 'playwright';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:960,height:600}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results={steps:[],errors};const state=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
async function record(step,extra={}){const s=await state();results.steps.push({step,audio:s.audio,...extra});console.log(step,JSON.stringify(s.audio));await writeFile('docs/audio/integrated-audio-check.json',JSON.stringify(results,null,2));}
const key=async selector=>{await page.locator(selector).press('Enter');};
try{
 await page.goto('http://localhost:5261/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.render_game_to_text);await record('before Start');
 await key('#start-btn');await page.waitForFunction(()=>JSON.parse(render_game_to_text()).audio.loadedBuffers===16);await page.waitForTimeout(800);await record('Start keyboard user gesture');
 await key('[data-action=settings]');for(const [bus,value]of Object.entries({master:.6,music:.4,sfx:.5,voice:.3}))await page.locator(`[data-gain=${bus}]`).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(value));await key('[data-action=sound-test]');await page.waitForTimeout(250);await record('settings and bell');
 await key('[data-action=mute]');await page.waitForTimeout(250);await record('mute');await page.locator('[data-gain=master]').evaluate(e=>{e.value='.8';e.dispatchEvent(new Event('input',{bubbles:true}));});await key('[data-action=close-overlay]');
 await key('#top [data-action=pause]');await page.waitForTimeout(300);await record('pause');await key('.modal [data-action=pause]');await page.waitForTimeout(300);await record('resume');
 await key('#top [data-action=pause]');await key('[data-action=restart]');await page.waitForTimeout(400);await record('restart from pause');
 const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(400);await record('other tab focused',{focused:await page.evaluate(()=>document.hasFocus())});await page.bringToFront();await page.waitForTimeout(400);await record('game refocused',{focused:await page.evaluate(()=>document.hasFocus())});await other.close();
 await key('[data-action=settings]');for(const[bus,value]of Object.entries({master:.8,music:.7,sfx:.74,voice:.8}))await page.locator(`[data-gain=${bus}]`).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(value));await key('[data-action=close-overlay]');await record('defaults restored');await page.screenshot({path:'docs/audio/integrated-audio.png'});
}catch(e){errors.push(String(e));}finally{await writeFile('docs/audio/integrated-audio-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();}
