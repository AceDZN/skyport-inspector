import{chromium}from'playwright';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({headless:false,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:960,height:600}});const game=await context.newPage();const result=[];const read=()=>game.evaluate(()=>({focused:document.hasFocus(),hidden:document.hidden,audio:JSON.parse(render_game_to_text()).audio}));
try{await game.goto('http://localhost:5261/');await game.locator('#start-btn').press('Enter');await game.waitForFunction(()=>JSON.parse(render_game_to_text()).audio.loadedBuffers===16);await game.waitForTimeout(400);result.push({step:'game focused',...await read()});
const second=await context.newPage();await second.goto('about:blank');await second.bringToFront();await second.waitForTimeout(500);result.push({step:'second tab focused',...await read()});
await game.bringToFront();await game.waitForTimeout(500);result.push({step:'game refocused',...await read()});
}catch(e){result.push({error:String(e)});}finally{await writeFile('docs/audio/focus-audio-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();}
