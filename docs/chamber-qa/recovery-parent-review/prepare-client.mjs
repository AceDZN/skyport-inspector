/** Copy the normal-input harness into parent-owned QA output. Add observation
 * waits and bounded ordinary-key holding; never change builder/game source. */
import fs from'node:fs/promises';import{createHash}from'node:crypto';
const original='/Users/acedzn/dev/AceDZN-exp/skyport-inspector/docs/chamber-qa/normal-input.mjs';
let source=await fs.readFile(original,'utf8');const originalHash=createHash('sha256').update(source).digest('hex');
source=source.replace("import {chromium} from 'playwright';","import {createRequire} from 'node:module';\nconst {chromium}=createRequire('/Users/acedzn/dev/AceDZN-exp/skyport-inspector/package.json')('playwright');");
source=source.replace("new URL('../../work/chamber-qa-video/'+Date.now()+'/',import.meta.url)","new URL('./recordings/'+Date.now()+'/',import.meta.url)");
source=source.replace("Two-chamber QA record; individual assertions and completion states are authoritative, no campaign completion claim","Independent normal-input continuation; individual assertions and completion states govern scope");
const token=" if(c.action==='wait')await time(c.ms);";
if(!source.includes(token))throw Error('Original wait insertion point changed; inspect before extending');
const extension=`
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
`;
source=source.replace(token,token+extension);
const versionMarker='async function version(){',versionEntry='versions.push({at:';
if(!source.includes(versionMarker)||!source.includes(versionEntry))throw Error('Version metadata hook changed');
source=source.replace(versionMarker,`${versionMarker}
 await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).mode!=='loading');
 const graphics=await page.evaluate(()=>{
  const canvas=document.querySelector('#world');const gl=canvas?.getContext('webgl2');if(!gl)return{available:false};
  const ext=gl.getExtension('WEBGL_debug_renderer_info');return{available:true,renderer:ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):String(gl.getParameter(gl.RENDERER)),vendor:ext?String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)):String(gl.getParameter(gl.VENDOR)),version:String(gl.getParameter(gl.VERSION)),attributes:gl.getContextAttributes(),maxTextureSize:gl.getParameter(gl.MAX_TEXTURE_SIZE),pixelRatio:devicePixelRatio};
 });
`);
source=source.replace(versionEntry,'versions.push({graphics,at:');
await fs.writeFile(new URL('./normal-input-client.mjs',import.meta.url),source);
await fs.writeFile(new URL('./client-provenance.json',import.meta.url),JSON.stringify({original,originalHash,modifiedHash:createHash('sha256').update(source).digest('hex'),changes:['Resolve installed Playwright from the builder package without changing it','Keep parent QA recordings under this report','Clarify continuation status text','Add wait-device using public snapshots and real wall-clock polling only; optional fresh-arrival observation, no device/body/clock/goal writes','Add key-until: hold ordinary keyboard keys until a public snapshot condition, then release in finally, including on timeout. No physics or pose assignments.','Record existing WebGL context renderer/vendor/capabilities as read-only version metadata after public loading finishes. No context attributes or renderer/game settings are changed.'],scope:'Actual controls remain mouse/keyboard UI inputs; ordinary earned storage import is explicitly declared. Not game code or a private-state solver.'},null,2)+'\n');
