/** Isolated visual inspection, deliberately seeded unlock availability. No earned progress or played wins. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const out='docs/campaign-art/inspection-31-50';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
await context.addInitScript(()=>{const n=Number(new URL(location.href).searchParams.get('inspect'));if(n>=31&&n<=50){localStorage.clear();localStorage.setItem('rift-runner-campaign-v2',JSON.stringify({version:2,highestUnlocked:50,resumeLevel:n,records:{},updatedAt:Date.now()}));localStorage.setItem('rift-controls',JSON.stringify({unlocked:true,sensitivity:.0022,invert:false,reduced:true}));}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
const manifest={status:'VISUAL INSPECTION ONLY — all levels unplayed in this set',method:'Fresh isolated context; initial unlock availability seeded for level access, zero completion records; public Continue button; camera tilt by actual K input. No body/camera/win assignments, no progression evidence.',url:'http://localhost:5261/campaign.html',started:new Date().toISOString(),dataSha256:crypto.createHash('sha256').update(await fs.readFile('src/data/worlds-upper.json')).digest('hex'),captures:[],errors};
for(let n=31;n<=50;n++){
 await page.goto(`http://localhost:5261/campaign.html?inspect=${n}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof window.render_game_to_text==='function');
 await page.locator('[data-action="continue"]').click();await page.waitForFunction(n=>JSON.parse(window.render_game_to_text()).mode==='playing'&&JSON.parse(window.render_game_to_text()).level===n,n);
 await page.waitForTimeout(650);await page.locator('canvas').focus();await page.keyboard.down('KeyK');await page.evaluate(()=>window.advanceTime(100));await page.keyboard.up('KeyK');await page.waitForTimeout(80);
 const stem=`L${n}-opening`;const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text()));await page.screenshot({path:`${out}/${stem}.png`});await fs.writeFile(`${out}/${stem}.json`,JSON.stringify(state,null,2));
 manifest.captures.push({level:n,file:`${stem}.png`,state:`${stem}.json`,mode:state.mode,result:state.world.result,played:false});console.log(n,state.mode,'drawCalls',state.renderer.drawCalls);
}
await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));await browser.close();
