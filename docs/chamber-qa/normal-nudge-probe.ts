/** One lightweight native parameter probe. No browser, world.ts edit or campaign win. */
import {CoreWorld,initializePhysics} from '../../src/core/world';
import {ChamberBuilder} from '../../src/core/level-kit';
import {draftEarlyLevels} from '../../src/core/levels/early';
import {writeFileSync} from 'node:fs';
await initializePhysics();
const idle={forward:0,strafe:0,jump:false};
function seamWorld(){const b=new ChamberBuilder();b.world.spawn=[0,.87,7];b.floor('loading-floor',-8,8,2,12);b.floor('upper-gallery',-8,8,-12,-2,4.2);b.floor('catch-floor',-8,8,-12,12,-4);b.device({id:'freight',kind:'lift',label:'FREIGHT',position:[0,-.15,0],size:[4,.3,4],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[1.3,.9,1.3]});b.cube('sample-cube',[-.6,.55,0]);return new CoreWorld(98,undefined,{number:98,name:'Native nudge lab',mission:'Not a campaign run',he:'',chapter:'Test',architecture:{height:9,halfWidth:8,style:'ceramic'},sources:[],blueprint:()=>b.finish()});}
const results=[];
for(const nudge of [.0001,.001,.002,.005]){
 const w=seamWorld();try{
  const original=w.controller.normalNudgeFactor();w.controller.setNormalNudgeFactor(nudge);
  // Exact reported art-v2 pose, restored only in this isolated parameter lab.
  w.player.pos.set(-.5246134400367737,.8642129898071289,2.1499876976013184);w.player.vel.set(0,0,0);w.player.grounded=true;w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.propagateModifiedBodyPositionsToColliders();
  const start=w.player.pos.clone();let maxStep=0;for(let i=0;i<72;i++){const dx=-3-w.player.pos.x,dz=5-w.player.pos.z;w.yaw=Math.atan2(-dx,-dz);const prev=w.player.pos.clone();w.step(1/120,{forward:1,strafe:0,jump:false});maxStep=Math.max(maxStep,w.player.pos.distanceTo(prev));}
  const movedXZ=Math.hypot(w.player.pos.x-start.x,w.player.pos.z-start.z);results.push({kind:'captured lower lift seam',nudge,original,actual:w.controller.normalNudgeFactor(),movedXZ,maxStep,end:w.player.pos.toArray(),grounded:w.player.grounded,passes:movedXZ>2&&w.player.pos.z>3.5&&maxStep<.08});
 }finally{w.dispose();}
 const base=draftEarlyLevels.find(l=>l.number===4)!,p=new CoreWorld(4,undefined,base);try{
  p.controller.setNormalNudgeFactor(nudge);const pad=p.pads[0];let reached=false;
  for(let i=0;i<180;i++){const dx=pad.pos.x-p.player.pos.x,dz=pad.pos.z-p.player.pos.z;if(Math.hypot(dx,dz)<.08){reached=true;break;}p.yaw=Math.atan2(-dx,-dz);p.step(1/120,{forward:1,strafe:0,jump:false});}
  for(let i=0;i<36;i++)p.step(1/120,idle);const pressedBefore=pad.pressed,start=p.player.pos.clone();p.yaw=0;let maxStep=0;
  for(let i=0;i<72;i++){const prev=p.player.pos.clone();p.step(1/120,{forward:-1,strafe:-1,jump:false});maxStep=Math.max(maxStep,p.player.pos.distanceTo(prev));}
  const movedXZ=Math.hypot(p.player.pos.x-start.x,p.player.pos.z-start.z);results.push({kind:'current C4 button→S+A floor step',nudge,reached,pressedBefore,pressedAfter:pad.pressed,movedXZ,maxStep,end:p.player.pos.toArray(),grounded:p.player.grounded,passes:reached&&pressedBefore&&!pad.pressed&&movedXZ>2&&maxStep<.08});
 }finally{p.dispose();}
}
const recommendation=[.0001,.001,.002,.005].find(n=>results.filter(r=>r.nudge===n).every(r=>r.passes));
writeFileSync(new URL('./normal-nudge-probe.json',import.meta.url),JSON.stringify({scope:'Native parameter lab only. Only capsule controller setter changed; no world.ts or body correction. Current fixture tested via normal KCC from spawn; art pose explicitly restored.',results,minimalPassingValue:recommendation??null},null,2)+'\n');
console.log(JSON.stringify({results,minimalPassingValue:recommendation??null},null,2));
