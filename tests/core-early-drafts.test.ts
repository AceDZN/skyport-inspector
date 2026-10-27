/** Focused native Rapier draft review. Direct unit portal/pose setup is not public-input proof. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Ray,Box3} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
import {draftEarlyLevels} from '../src/core/levels/early';
const idle={forward:0,strafe:0,jump:false},forward={...idle,forward:1};
before(async()=>{await initializePhysics();});
function world(n:number){return new CoreWorld(n,undefined,draftEarlyLevels.find(l=>l.number===n)!);}
function tick(w:CoreWorld,seconds=.8){for(let i=0;i<Math.ceil(seconds*120);i++)w.step(1/120,idle);}
function look(w:CoreWorld,t:Vector3){const d=t.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}
function walk(w:CoreWorld,x:number,z:number,seconds=8){for(let i=0;i<seconds*120;i++){if(w.campaignResult)return true;const dx=x-w.player.pos.x,dz=z-w.player.pos.z;if(Math.hypot(dx,dz)<.2){tick(w,.1);return true;}w.yaw=Math.atan2(-dx,-dz);w.pitch=0;w.step(1/120,forward);}return false;}
function enter(w:CoreWorld,t:Vector3){const before=w.player.crossings;look(w,t);for(let i=0;i<180&&w.player.crossings===before;i++)w.step(1/120,forward);assert.equal(w.player.crossings,before+1,'Normal KCC approach never crosses portal');tick(w,.1);}
function cubeAt(w:CoreWorld,id:string,x:number,y:number,z:number){const c=w.crates.find(c=>c.id===id)!;c.pos.set(x,y,z);c.vel.set(0,0,0);c.rigid.setTranslation(c.pos,true);c.rigid.setLinvel({x:0,y:0,z:0},true);c.rigid.setAngvel({x:0,y:0,z:0},true);w.physics.propagateModifiedBodyPositionsToColliders();}
function put(w:CoreWorld,id:string,pad:string){const p=w.pads.find(p=>p.id===pad)!;cubeAt(w,id,p.pos.x,p.pos.y+w.crates.find(c=>c.id===id)!.half.y,p.pos.z);}
function blockedSight(w:CoreWorld,target:Vector3){const eye=w.eye(),ray=new Ray(eye,target.clone().sub(eye).normalize());return w.activeSolids().filter(s=>{const p=ray.intersectBox(new Box3(s.min,s.max),new Vector3());return p&&p.distanceTo(eye)<target.distanceTo(eye)-.1;}).map(s=>s.id);}

test('draft4 actual opaque access door hides the remote wall until real player pressure opens it',()=>{
 const w=world(4);try{const target=new Vector3(-4,1.55,-11.985);assert.ok(blockedSight(w,target).includes('access-door'));assert.ok(walk(w,w.pads[0].pos.x,w.pads[0].pos.z));tick(w);assert.equal(w.pads[0].pressed,true);assert.ok(w.machines.devices.find(d=>d.spec.id==='access-door')!.progress>.9);assert.equal(blockedSight(w,target).length,0,'Raised access still occludes the actual remote aiming line');assert.equal(w.campaignResult,undefined);}finally{w.dispose();}
});
test('draft4 stepping off pressure cannot sprint through the final door without the cube',()=>{
 const w=world(4);try{assert.ok(walk(w,w.pads[0].pos.x,w.pads[0].pos.z));tick(w);assert.equal(w.pads[0].pressed,true);assert.ok(w.machines.devices.find(d=>d.spec.id==='exit-door')!.progress>.9);walk(w,10.7,2,5);assert.equal(w.campaignResult,undefined);assert.ok(w.player.pos.x<8,'Player reaches the exit side after pressure expires');assert.equal(w.pads[0].pressed,false);assert.ok(w.machines.devices.find(d=>d.spec.id==='exit-door')!.progress<.1);}finally{w.dispose();}
});
test('draft4 native stand→visible placement→retrieve through portals→cube replacement→physical exit route is complete',()=>{
 const w=world(4);try{assert.ok(walk(w,w.pads[0].pos.x,w.pads[0].pos.z));tick(w);assert.equal(blockedSight(w,new Vector3(-4,1.55,-11.985)).length,0);assert.ok(w.place(0,'source-west',new Vector3(-7.985,1.55,6)));assert.ok(w.place(1,'remote-north',new Vector3(-4,1.55,-11.985)));assert.ok(walk(w,-6.7,6));tick(w);assert.equal(w.pads[0].pressed,false);assert.ok(w.machines.devices.find(d=>d.spec.id==='access-door')!.progress<.1);enter(w,new Vector3(-8.5,1.55,6));assert.ok(walk(w,-4,-9.8));look(w,w.crates[0].pos);w.grabDrop();assert.equal(w.heldId,'cube',JSON.stringify({player:w.player.pos,crate:w.crates[0].pos,hint:w.interactionHint(),sight:blockedSight(w,w.crates[0].pos),events:w.events.slice(-4)}));assert.ok(walk(w,-4,-10.7));enter(w,new Vector3(-4,1.55,-12.5));assert.ok(walk(w,-5.8,w.pads[0].pos.z));look(w,new Vector3(w.pads[0].pos.x,1.2,w.pads[0].pos.z));tick(w,.3);w.grabDrop();tick(w);assert.equal(w.pads[0].crateId,'cube');assert.ok(walk(w,-5.8,2));assert.ok(walk(w,6.5,2));assert.ok(walk(w,10.7,2));assert.equal(w.campaignResult?.goalMatched,true);assert.ok(w.crates[0].crossings>0);}finally{w.dispose();}
});
test('draft5 two real cubes on one button cannot power the two-input exit',()=>{
 const w=world(5);try{cubeAt(w,'cube-a',-4.6,.69,6);cubeAt(w,'cube-b',-3.4,.69,6);tick(w);assert.equal(w.pads.find(p=>p.id==='lower-button')!.pressed,true);assert.equal(w.pads.find(p=>p.id==='upper-button')!.pressed,false);assert.equal(w.machines.devices[0].progress,0);assert.equal(w.campaignResult,undefined);}finally{w.dispose();}
});
for(const swapped of [false,true])test(`draft5 physical AND accepts one cube on each, assignment swapped=${swapped}, and removal closes exit`,()=>{
 const w=world(5);try{put(w,swapped?'cube-b':'cube-a','lower-button');put(w,swapped?'cube-a':'cube-b','upper-button');tick(w);assert.ok(w.pads.every(p=>p.pressed));assert.ok(w.machines.devices[0].progress>.9);cubeAt(w,swapped?'cube-a':'cube-b',7,3.95,-5);tick(w);assert.equal(w.pads.find(p=>p.id==='upper-button')!.pressed,false);assert.ok(w.machines.devices[0].progress<.1);}finally{w.dispose();}
});
test('draft5 native low retrieval, high retrieval, simultaneous pressures and elevated physical exit route is complete',()=>{
 const w=world(5);try{assert.ok(w.place(0,'source-south',new Vector3(4,1.55,13.985)));assert.ok(w.place(1,'low-north',new Vector3(-5,1.55,-11.985)));assert.ok(walk(w,4,12.7));enter(w,new Vector3(4,1.55,14.5));assert.ok(walk(w,-5,-9.8));look(w,w.crates.find(c=>c.id==='cube-a')!.pos);w.grabDrop();assert.equal(w.heldId,'cube-a',JSON.stringify({player:w.player.pos,crate:w.crates[0].pos,hint:w.interactionHint(),sight:blockedSight(w,w.crates[0].pos),events:w.events.slice(-4)}));assert.ok(walk(w,-5,-10.7));enter(w,new Vector3(-5,1.55,-12.5));assert.ok(walk(w,-5.8,6));look(w,new Vector3(-4,1.2,6));tick(w,.3);w.grabDrop();tick(w);assert.equal(w.pads.find(p=>p.id==='lower-button')!.crateId,'cube-a');assert.ok(walk(w,4,13.35));assert.equal(blockedSight(w,new Vector3(5,4.95,-11.985)).length,0,'High wall actual ray is blocked by gallery lip');assert.ok(w.place(1,'high-north',new Vector3(5,4.95,-11.985)));enter(w,new Vector3(4,1.55,14.5));assert.ok(walk(w,6,-9.8));look(w,w.crates.find(c=>c.id==='cube-b')!.pos);w.grabDrop();assert.equal(w.heldId,'cube-b');assert.ok(walk(w,5.8,-4));look(w,new Vector3(4,4.6,-4));tick(w,.3);w.grabDrop();tick(w);assert.ok(w.pads.every(p=>p.pressed));assert.ok(walk(w,8,-8));assert.ok(walk(w,11.7,-8));assert.equal(w.campaignResult?.goalMatched,true);assert.ok(w.player.crossings>=3);}finally{w.dispose();}
});
test('draft5 ordinary walk/jump cannot bypass the sealed low cell or raised retrieval gallery',()=>{
 const w=world(5);try{walk(w,-5,-8,4);assert.ok(w.player.pos.z>0,'Ordinary walk gets behind low glass');for(let i=0;i<240;i++)w.step(1/120,{forward:1,strafe:0,jump:true});assert.ok(w.player.pos.z>0,'Ordinary jump clears full-height glass');assert.equal(w.player.crossings,0);assert.equal(w.campaignResult,undefined);}finally{w.dispose();}
});
test('draft5 one cube plus temporary player pressure cannot sprint through the elevated exit',()=>{
 const w=world(5);try{put(w,'cube-a','lower-button');w.player.pos.set(4,4.4,-4);w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.propagateModifiedBodyPositionsToColliders();tick(w);assert.ok(w.pads.every(p=>p.pressed));assert.ok(w.machines.devices[0].progress>.9);walk(w,11.7,-8,4);assert.equal(w.campaignResult,undefined);assert.ok(w.player.pos.x<9,'Player-only upper press bypasses the required second cube');assert.equal(w.pads.find(p=>p.id==='upper-button')!.pressed,false);assert.ok(w.machines.devices[0].progress<.1);}finally{w.dispose();}
});
