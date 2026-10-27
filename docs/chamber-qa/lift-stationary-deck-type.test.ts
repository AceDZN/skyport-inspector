/** Isolated native stationary-deck body-type candidate. Four histories/assertions unchanged; runtime source is frozen and NOT edited. Unit setups only. */
import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {CoreWorld, initializePhysics} from '../../src/core/world';
import {ChamberBuilder} from '../../src/core/level-kit';

before(async () => { await initializePhysics(); });
const idle = {forward:0, strafe:0, jump:false};
function fixture() {
 const b = new ChamberBuilder();
 b.world.spawn = [0,.87,7];
 b.floor('loading-floor',-8,8,2,12);
 b.floor('upper-gallery',-8,8,-12,-2,4.2);
 b.floor('catch-floor',-8,8,-12,12,-4);
 b.device({id:'freight',kind:'lift',label:'FREIGHT',position:[0,-.15,0],size:[4,.3,4],stops:[{label:'lower',position:[0,-.15,0]},{label:'upper',position:[0,4.05,0]}],controlOffset:[1.3,.9,1.3]});
 b.device({id:'power',kind:'switch',label:'POWER',position:[-4,.7,5],size:[.6,1,.35]});
 b.cube('sample-cube',[-.6,.55,0]);
 const w = new CoreWorld(98,undefined,{number:98,name:'Isolated lower dock seam',mission:'Not a campaign run',he:'',chapter:'Test',sources:[],architecture:{height:9,halfWidth:8,style:'ceramic'},blueprint:()=>b.finish()});
 const originalMachinery=(w as any).updateMachinery.bind(w);
 (w as any).updateMachinery=(dt:number)=>{
  originalMachinery(dt);
  for(const d of w.machines.devices.filter(d=>['lift','moving-platform'].includes(d.spec.kind))){
   const body=w.doors.get(d.spec.id)!.rigid;
   if(d.delta.lengthSq()<1e-12){body.setBodyType(RAPIER.RigidBodyType.Fixed,true);}
   else{body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased,true);body.setNextKinematicTranslation(d.position);}
  }
 };
 return w;
}

function tick(w:CoreWorld,seconds:number) { for(let i=0;i<seconds*120;i++)w.step(1/120,idle); }
function walk(w:CoreWorld,x:number,z:number,seconds=4) {
 for(let i=0;i<seconds*120;i++) {
  const dx=x-w.player.pos.x, dz=z-w.player.pos.z;
  if(Math.hypot(dx,dz)<.03) { tick(w,.15); return true; }
  w.yaw=Math.atan2(-dx,-dz); w.pitch=0;
  w.step(1/120,{forward:1,strafe:0,jump:false});
 }
 return false;
}
function exitLowerDock(w:CoreWorld) {
 const reached=walk(w,-3,5);
 assert.ok(reached,`Coplanar deck→loading floor pins a walking capsule: ${w.player.pos.toArray()}; ${JSON.stringify(w.controller.computedMovement())}`);
 assert.ok(w.player.pos.z>4.7);
 assert.ok(w.player.grounded);
 assert.equal(w.player.crossings,0);
 assert.equal(w.campaignResult,undefined);
}
for(const cycle of [false,true])test(`native capsule can leave lower lift edge onto coplanar floor, cycle=${cycle}`,()=>{
 const w=fixture();try {
  tick(w,.5); assert.ok(walk(w,0,2.3)); tick(w,1);
  if(cycle) { w.machines.interact('freight'); tick(w,4); w.machines.interact('freight'); tick(w,4); }
  exitLowerDock(w);
 }finally { w.dispose(); }
});
test('actual interior rider can use E up/down and disembark normally at the lower dock',()=>{
 const w=fixture();try {
  tick(w,.5); assert.ok(walk(w,.8,1)); tick(w,.5);
  const d=w.machines.devices.find(d=>d.spec.id==='freight')!;
  function useControl() { const delta=d.position.clone().add(new Vector3(1.3,.9,1.3)).sub(w.eye());w.yaw=Math.atan2(-delta.x,-delta.z);w.pitch=Math.asin(delta.y/delta.length());assert.equal(w.interact(),true); }
  useControl();tick(w,4);assert.ok(w.player.pos.y>5,JSON.stringify({reason:'The scenario must actually ride to the upper stop',player:w.player.pos.toArray(),grounded:w.player.grounded,velocity:w.player.vel.toArray(),lift:d.position.toArray(),choice:d.choice,cube:w.crates[0].pos.toArray(),events:w.events.slice(-4)}));
  useControl();tick(w,4);assert.ok(w.player.pos.y>.84&&w.player.pos.y<1,'Rider must return without sinking into deck');
  exitLowerDock(w);
 }finally { w.dispose(); }
});
test('captured v2 lower-dock pose can walk away instead of retaining a zero-movement floor contact',()=>{
 const w=fixture();try {
  // Explicit isolated restoration of the reported artifact pose, not a gameplay claim.
  w.player.pos.set(-.5246134400367737,.8642129898071289,2.1499876976013184);
  w.player.vel.set(-.00041381835803079396,0,.00033972662763974047);w.player.grounded=true;
  w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);
  w.physics.propagateModifiedBodyPositionsToColliders();
  exitLowerDock(w);
 }finally { w.dispose(); }
});
