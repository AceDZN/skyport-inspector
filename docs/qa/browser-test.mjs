import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out = new URL('./', import.meta.url).pathname;
const browser = await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page = await context.newPage();
const errors=[]; page.on('pageerror', e=>errors.push(String(e)));
const report=[];
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const check=(condition,message)=>{if(!condition)throw new Error(message); report.push(message); console.log(message);};
const action=async(name)=>{await page.locator(`[data-action="${name}"]`).click();};
const start=async(grade,variant=false)=>{await page.goto('http://localhost:5261',{waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>typeof window.render_game_to_text==='function'); await page.locator(`[data-grade="${grade}"]`).click(); if(variant)await page.locator('#variant').check(); await page.locator('#start-btn').click(); await page.waitForTimeout(250);};
const evidence=async(ids)=>{await page.locator('[data-doc="0"]').click();for(const id of ids){const s=await state(); const i=s.documents.findIndex(d=>d.lines.some(l=>l.id===id)); if(i<0)throw new Error('Missing visible evidence '+id); await page.locator('[data-slot="left"]').selectOption(String(i)); await page.locator(`[data-evidence="${id}"]`).first().click();}};
const stamp=async(decision,gate,time)=>{await page.locator('#gate').selectOption(gate);await page.locator('#time').selectOption(time);await action('arm-'+decision);await action('confirm');await page.waitForTimeout(120);};
const paths={7:[{id:'g7-1',e:['g7-1-ticket','g7-1-list'],d:'board',g:'2',t:'18:00'},{id:'g7-2',ask:true,e:['g7-2-answer','g7-2-schedule'],d:'board',g:'3',t:'18:00'},{id:'g7-3',e:['g7-3-ticket','g7-3-today'],d:'hold',g:'4',t:'16:30'}],8:[{id:'g8-1',e:['g8-1-ticket','g8-1-current'],d:'board',g:'2',t:'18:00'},{id:'g8-2',e:['g8-2-ticket','g8-2-update'],d:'board',g:'3',t:'18:00'},{id:'g8-3',e:['g8-3-ticket','g8-3-update'],d:'board',g:'4',t:'19:00'}],9:[{id:'g9-1',e:['g9-1-ticket','g9-1-current'],d:'board',g:'2',t:'18:00'},{id:'g9-2',e:['g9-2-ticket','g9-2-report'],d:'hold',g:'2',t:'18:00'},{id:'g9-3',e:['g9-3-ticket','g9-3-update'],d:'board',g:'4',t:'19:00'}]};
try{
for(const grade of [7,8,9]){
 await start(grade);
 for(const p of paths[grade]){
  check((await state()).case===p.id,`UI loaded ${p.id}`);
  if(p.ask){await action('ask');await page.locator('[data-question="today"]').click();await action('close-overlay');check((await state()).clarified,'Clarification reply becomes a physical/selectable document');}
  await evidence(p.e);
  if(p.id==='g8-2'||p.id==='g9-3')await page.screenshot({path:out+p.id+'-inspection.png'});
  await stamp(p.d,p.g,p.t);const s=await state();check(s.result?.correct&&s.result?.comprehension,`${p.id} correct action and evidence credit through real UI`);
  await page.screenshot({path:out+p.id+'-result.png'});
  await action('next');
 }
 const s=await state();check(s.mode==='complete'&&s.summary.length===3,`Grade ${grade} real three-case campaign completes`);
 check(s.summary.every(x=>x.credit&&x.unaided),`Grade ${grade} three first-attempt unaided evidence decisions`);
 await page.screenshot({path:out+`grade-${grade}-complete.png`});
}
// Wrong interpretation, recovery, assistance and no-credit lucky action.
await start(7);await stamp('hold','2','18:00');check(!(await state()).result.correct,'Wrong HOLD has visible wrong-queue result');await page.screenshot({path:out+'wrong-queue.png'});await action('recall');check((await state()).mode==='inspect','Recall restores document inspection');await evidence(['g7-1-ticket','g7-1-list']);await stamp('board','2','18:00');let s=await state();check(s.result.correct&&!s.summary[0].unaided,'Recovered action passes without unaided-first-attempt claim');await action('next');
await stamp('board','3','18:00');s=await state();check(s.result.needsClarification&&!s.result.correct,'Even a lucky current route is blocked until missing detail is clarified');await action('recall');await action('ask');await page.locator('[data-question="habit"]').click();check(!(await state()).clarified,'Irrelevant habit question does not invent current departure');await page.locator('[data-question="today"]').click();await action('close-overlay');await action('hint');await action('close-overlay');await action('translate');check((await state()).events.some(e=>e.type==='translation'),'Translation recorded as assistance');await action('translate');await evidence(['g7-2-answer','g7-2-schedule']);await stamp('board','3','18:00');s=await state();check(s.result.correct&&!s.summary.find(x=>x.id==='g7-2').unaided,'Assistance remains recorded after hiding translation');
// Pause/settings/restart paths.
await action('pause');check((await state()).paused,'Pause modal sets paused state');const before=(await state()).events.at(-1).at;await page.waitForTimeout(150);await page.evaluate(()=>window.advanceTime(10000));check((await state()).events.at(-1).at===before,'advanceTime respects pause');await page.keyboard.press('Escape');check(!(await state()).paused,'Escape resumes paused overlay only');await action('settings');await page.locator('[data-gain="music"]').fill('0.12');await page.locator('[data-gain="sfx"]').fill('0.23');await action('close-overlay');check((await state()).audio.gains.music===0.12,'Music slider changes real audio setting');await action('pause');await action('restart');check((await state()).case==='g7-1'&&!(await state()).paused,'Restart returns cleanly to first visitor');
await page.screenshot({path:out+'restarted.png'});
await fs.writeFile(out+'browser-results.json',JSON.stringify({report,errors,finalState:await state()},null,2));
check(errors.length===0,'No page errors in independent desktop campaign');
}catch(error){await page.screenshot({path:out+'failure.png'});await fs.writeFile(out+'browser-results.json',JSON.stringify({report,errors,failure:String(error),state:await state().catch(()=>({unavailable:true}))},null,2));console.error('Original failure:',error);throw error;}finally{await browser.close();}
