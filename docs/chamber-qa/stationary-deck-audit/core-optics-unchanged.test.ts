/** Native authored-room validation. No direct setup here counts as browser completion proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Ray,Box3} from 'three';
import {CoreWorld,initializePhysics} from '../stationary-deck-candidate';
import {draftOpticalLevels} from '../../../src/core/levels/optics';
const idle={forward:0,strafe:0,jump:false},forward={...idle,forward:1};
before(initializePhysics);
function world(alternate=false){return new CoreWorld(11,undefined,draftOpticalLevels[0],alternate);}
function tick(w:CoreWorld,seconds:number){for(let i=0;i<Math.ceil(seconds*120);i++)w.step(1/120,idle);}
function look(w:CoreWorld,target:Vector3){const d=target.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}
function walk(w:CoreWorld,x:number,z:number){for(let i=0;i<12*120;i++){if(w.campaignResult)return true;const dx=x-w.player.pos.x,dz=z-w.player.pos.z;if(Math.hypot(dx,dz)<.2)return true;w.yaw=Math.atan2(-dx,-dz);w.pitch=0;w.step(1/120,forward);}return false;}
function visibleShot(w:CoreWorld,surface:string,target:Vector3,index:number){const ray=new Ray(w.eye(),target.clone().sub(w.eye()).normalize()),distance=target.distanceTo(w.eye());const blockers=w.activeSolids().filter(s=>s.kind!=='glass'&&s.id!==w.surfaces.find(p=>p.id===surface)!.solidId).filter(s=>{const hit=ray.intersectBox(new Box3(s.min,s.max),new Vector3());return hit&&hit.distanceTo(w.eye())<distance-.1;});assert.deepEqual(blockers.map(s=>s.id),[]);assert.equal(w.place(index,surface,target),true);}
test('authored11 has identical hardware under both instructions and real optical power',()=>{
 const a=world(),b=world(true);try{assert.deepEqual(a.blueprint,b.blueprint);assert.deepEqual(a.level.optics,b.level.optics);tick(a,.2);assert.equal(a.machines.flags['gallery-receiver'],false);visibleShot(a,'source-band',new Vector3(-8.985,1.55,7),0);visibleShot(a,'receiver-band',new Vector3(-4,1.55,-11.985),1);tick(a,1);assert.equal(a.beams.get('emitter')?.receiver,'gallery-receiver');assert.equal(a.beams.get('emitter')?.hops,1);assert.equal(a.machines.devices.find(d=>d.spec.id==='access-door')!.progress,1);assert.equal(a.machines.devices.find(d=>d.spec.id==='lower-door')!.progress,0);}finally{a.dispose();b.dispose();}
});
test('authored11 native beam→door→automatic lift→upper gallery route is complete',()=>{
 const w=world();try{tick(w,.1);visibleShot(w,'source-band',new Vector3(-8.985,1.55,7),0);visibleShot(w,'receiver-band',new Vector3(-4,1.55,-11.985),1);assert.ok(walk(w,4.5,2));assert.ok(walk(w,4.5,-5.5));tick(w,4.8);assert.ok(w.player.pos.y>4.2,w.player.pos.toArray().join(','));assert.ok(w.player.grounded);assert.ok(walk(w,5.5,-9.4));assert.ok(walk(w,5.5,-14.7));assert.equal(w.campaignResult?.exit,'upper-exit');assert.equal(w.campaignResult?.goalMatched,true);}finally{w.dispose();}
});
test('authored11 contrast uses a real offset pair and unpowered lower route',()=>{
 const w=world(true);try{tick(w,.1);visibleShot(w,'source-band',new Vector3(-8.985,1.55,9),0);visibleShot(w,'receiver-band',new Vector3(-4,1.55,-11.985),1);tick(w,1);assert.equal(w.machines.flags['gallery-receiver'],false);assert.ok(walk(w,-7.7,9));look(w,new Vector3(-9.5,1.55,9));for(let i=0;i<180&&w.player.crossings===0;i++)w.step(1/120,forward);assert.equal(w.player.crossings,1);assert.ok(walk(w,-7,-7));assert.ok(walk(w,-11.7,-7));assert.equal(w.campaignResult?.exit,'lower-exit');assert.equal(w.campaignResult?.goalMatched,true);}finally{w.dispose();}
});
test('authored11 power loss physically brakes a loaded shuttle and restoring it resumes without a jump',()=>{
 const w=world();try{tick(w,.1);w.place(0,'source-band',new Vector3(-8.985,1.55,7));w.place(1,'receiver-band',new Vector3(-4,1.55,-11.985));assert.ok(walk(w,4.5,2));assert.ok(walk(w,4.5,-5.5));tick(w,2);const lift=w.machines.devices.find(d=>d.spec.id==='gallery-lift')!;assert.ok(lift.position.y>.2&&lift.position.y<3);const before=lift.position.clone(),cube=w.crates[0];cube.rigid.setTranslation({x:-4,y:.55,z:-8},true);cube.rigid.setLinvel({x:0,y:0,z:0},true);w.physics.propagateModifiedBodyPositionsToColliders();tick(w,.1);const stopped=lift.position.clone();assert.ok(stopped.distanceTo(before)<.15);tick(w,1);assert.ok(lift.position.distanceTo(stopped)<.00001);assert.ok(w.player.grounded);cube.rigid.setTranslation({x:0,y:.55,z:-8},true);w.physics.propagateModifiedBodyPositionsToColliders();for(let i=0;i<30;i++){const previous=lift.position.clone();w.step(1/120,idle);assert.ok(lift.position.distanceTo(previous)<.02);}assert.ok(lift.position.y>stopped.y+.2);}finally{w.dispose();}
});
