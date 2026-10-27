import{chromium}from'playwright';import{writeFile}from'node:fs/promises';
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),checks=[],errors=[];await page.routeWebSocket('**',ws=>ws.close());page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://localhost:5261/docs/rift-audio/machinery-check.html');await page.locator('#start').click();await page.waitForFunction(()=>audio.state().loadedBuffers===29);
 const result=await page.evaluate(()=>{
  const gains=[],sources=[],ctx=audio.ctx,createGain=ctx.createGain.bind(ctx),createSource=ctx.createBufferSource.bind(ctx);
  ctx.createGain=()=>{const node=createGain();gains.push(node);return node};ctx.createBufferSource=()=>{const node=createSource();sources.push(node);return node};
  audio.cue('footstep');audio.cue('contact');audio.cue('footstep');audio.cue('pad');audio.cue('button-release');audio.cue('button-release');
  ctx.createGain=createGain;ctx.createBufferSource=createSource;
  return{state:audio.state(),gains:gains.map(n=>n.gain.value),sources:sources.map(s=>({buffer:s.buffer===audio.buffers.get('contact')?'contact':s.buffer===audio.buffers.get('pad')?'pad':'other',pitch:s.playbackRate.value}))};
 });checks.push({step:'quiet profiles, independent contact/press and repeat guards',...result});
 if(JSON.stringify(result.gains)!==JSON.stringify([.15000000596046448,.8799999952316284,.8799999952316284,.23999999463558197]))throw Error('Unexpected profile gains');
 if(JSON.stringify(result.state.recentCues)!==JSON.stringify(['footstep','contact','pad','button-release']))throw Error('Recent history lost original footstep/release events');
 if(result.sources.length!==4||result.sources[0].buffer!=='contact'||result.sources[0].pitch>.7||result.sources[1].pitch<.97||result.sources[3].buffer!=='pad'||result.sources[3].pitch>.75)throw Error('Profile buffer/pitch mismatch');
 if(result.state.loadedBuffers!==29||result.state.loadErrors.length||result.state.loopCount!==3)throw Error('Asset/loop regression');
 await page.waitForTimeout(300);await page.evaluate(()=>audio.setPaused(true));await page.waitForTimeout(300);const before=await page.evaluate(()=>audio.state().cuesPlayed);await page.evaluate(()=>audio.cue('footstep'));if(await page.evaluate(()=>audio.state().cuesPlayed)!==before)throw Error('Footstep played during pause');checks.push({step:'paused footstep suppressed',state:await page.evaluate(()=>audio.state())});
 await page.evaluate(()=>{audio.setPaused(false);audio.cue('footstep')});await page.waitForTimeout(80);checks.push({step:'resume footstep schedules normally',state:await page.evaluate(()=>audio.state())});if(await page.evaluate(()=>audio.state().cuesPlayed)!==before+1)throw Error('Resume footstep lost');
}catch(e){errors.push(String(e));}finally{await writeFile('docs/chamber-audio/quiet-profiles.json',JSON.stringify({scope:'Current module profiles; frozen static chamber build unchanged.',checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await browser.close();if(errors.length)process.exitCode=1;}
