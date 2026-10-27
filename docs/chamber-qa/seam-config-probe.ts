/** Public KCC configuration diagnosis only; unchanged fixture/history/success from core-lift-seam.test.ts. */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../../src/core/world';
import {ChamberBuilder} from '../../src/core/level-kit';
await initializePhysics();
const idle={forward:0,strafe:0,jump:false};
const configs={
 baseline:(w:CoreWorld)=>{},
 'no-autostep':(w:CoreWorld)=>w.controller.disableAutostep(),
 'no-snap':(w:CoreWorld)=>w.controller.disableSnapToGround(),
 'neither':(w:CoreWorld)=>{w.controller.disableAutostep();w.controller.disableSnapToGround();},
 'offset-02':(w:CoreWorld)=>w.controller.setOffset(.02),
};
type Config=keyof typeof configs;
function fixture(){
 const b=new ChamberBuilder();b.world.spawn=[0,.87,7];
 b.floor('loading-floor',-8,8,2,12);b.floor('upper-gallery',-8,8,-12,-2,4.2);b.floor('catch-floor',-8,8,-12,12,-4);
 b.device({id:'freight',kind:'lift',label:'FREIGHT',position:[0,-.15,0],size:[4,.3,4],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[1.3,.9,1.3]});
 b.device({id:'power',kind:'switch',label:'POWER',position:[-4,.7,5],size:[.6,1,.35]});b.cube('sample-cube',[-.6,.55,0]);
 return new CoreWorld(98,undefined,{number:98,name:'Isolated lower dock seam',mission:'Not a campaign run',he:'',chapter:'Test',sources:[],architecture:{height:9,halfWidth:8,style:'ceramic'},blueprint:()=>b.finish()});
}
function tick(w:CoreWorld,s:number){for(let i=0;i<s*120;i++)w.step(1/120,idle);}
function contacts(w:CoreWorld){
 const hits=[];
 for(let i=0;i<w.controller.numComputedCollisions();i++){
  const c=w.controller.computedCollision(i)!;
  hits.push({id:c.collider?(w.fixed.get(c.collider.handle)?.id??[...w.doors].find(([,v])=>v.collider.handle===c.collider!.handle)?.[0]??'body'):'none',normal:c.normal1,toi:c.toi,remaining:c.translationDeltaRemaining});
 }
 return hits;
}
function walk(w:CoreWorld,x:number,z:number,trace:unknown[]=[],seconds=4){
 for(let i=0;i<seconds*120;i++){
  const dx=x-w.player.pos.x,dz=z-w.player.pos.z;
  if(Math.hypot(dx,dz)<.03){tick(w,.15);return true;}
  w.yaw=Math.atan2(-dx,-dz);w.pitch=0;const previous=w.player.pos.clone();w.step(1/120,{forward:1,strafe:0,jump:false});
  if(i%60===0||i>=seconds*120-3)trace.push({i,position:w.player.pos.toArray(),actualMovement:w.player.pos.clone().sub(previous).toArray(),computedMovement:w.controller.computedMovement(),grounded:w.player.grounded,hits:contacts(w)});
 }
 return false;
}
function run(config:Config,history:string){
 const w=fixture(),trace:unknown[]=[],milestones:Record<string,unknown>={};
 try{
  configs[config](w);milestones.configuration={offset:w.controller.offset(),nudge:w.controller.normalNudgeFactor(),autostep:w.controller.autostepEnabled(),snap:w.controller.snapToGroundEnabled()};
  if(history==='captured-v2'){
   // The fourth original unit restores a captured pose; the other three use native walking only.
   w.player.pos.set(-.5246134400367737,.8642129898071289,2.1499876976013184);w.player.vel.set(-.00041381835803079396,0,.00033972662763974047);w.player.grounded=true;
   w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.propagateModifiedBodyPositionsToColliders();
  }else if(history==='interior-cycle'){
   tick(w,.5);assert.ok(walk(w,.8,1));tick(w,.5);
   const d=w.machines.devices.find(d=>d.spec.id==='freight')!;
   function use(){const delta=d.position.clone().add(new Vector3(1.3,.9,1.3)).sub(w.eye());w.yaw=Math.atan2(-delta.x,-delta.z);w.pitch=Math.asin(delta.y/delta.length());assert.equal(w.interact(),true);}
   use();tick(w,4);milestones.upper={player:w.player.pos.toArray(),grounded:w.player.grounded,lift:d.position.toArray()};assert.ok(w.player.pos.y>5,'The scenario must actually ride to the upper stop');
   use();tick(w,4);milestones.lower={player:w.player.pos.toArray(),grounded:w.player.grounded,lift:d.position.toArray()};assert.ok(w.player.pos.y>.84&&w.player.pos.y<1,'Rider must return without sinking into deck');
  }else{
   tick(w,.5);assert.ok(walk(w,0,2.3));tick(w,1);
   if(history==='edge-cycle'){w.machines.interact('freight');tick(w,4);w.machines.interact('freight');tick(w,4);}
  }
  milestones.before=w.player.pos.toArray();const reached=walk(w,-3,5,trace);
  assert.ok(reached,`Coplanar deck→loading floor pins a walking capsule: ${w.player.pos.toArray()}`);assert.ok(w.player.pos.z>4.7);assert.ok(w.player.grounded);assert.equal(w.player.crossings,0);assert.equal(w.campaignResult,undefined);
  return{config,history,pass:true,milestones,end:w.player.pos.toArray(),trace};
 }catch(error){return{config,history,pass:false,error:String(error),milestones,end:w.player.pos.toArray(),trace};}
 finally{w.dispose();}
}
const full=process.argv.includes('--full'),selected=process.argv.find(a=>a.startsWith('--config='))?.slice(9) as Config|undefined;
const chosen=selected?[selected]:Object.keys(configs) as Config[];
for(const c of chosen)assert.ok(c in configs,`Unknown config ${c}`);
const histories=full?['edge','edge-cycle','interior-cycle','captured-v2']:['edge'];
const results=chosen.flatMap(c=>histories.map(h=>run(c,h)));
const report={scope:'Native public-controller configuration diagnosis, unchanged four-case fixture/history/assertions. Not a browser or registered level completion.',source:'Current source with .005 nudge and offset+nudge local deck support; no world.ts edit by QA',results};
const name=full?`seam-config-${selected??'all'}-four-histories.json`:'seam-config-probe.json';writeFileSync(new URL('./'+name,import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(results.map(({trace,...r})=>({...r,lastTrace:trace.at(-1)})),null,2));
