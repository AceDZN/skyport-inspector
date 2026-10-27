/** New Rapier-core integration contracts. Isolated unit setup is never browser play evidence. */
import test,{before} from 'node:test';
import RAPIER from '@dimforge/rapier3d-compat';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {portalMatrix,makeSolid} from '../src/physics';
import {CoreWorld,initializePhysics} from '../src/core/world';
const idle={forward:0,strafe:0,jump:false};
before(async()=>{await initializePhysics();});
function tick(w:CoreWorld,seconds:number,input=idle){for(let i=0;i<Math.ceil(seconds*120);i++)w.step(1/120,input);}
function playerAt(w:CoreWorld,x:number,y:number,z:number){w.player.pos.set(x,y,z);w.player.vel.set(0,0,0);w.player.grounded=false;w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.step();}
function cubeAt(w:CoreWorld,x:number,y:number,z:number){const c=w.crates[0];c.pos.set(x,y,z);c.vel.set(0,0,0);c.rigid.setTranslation(c.pos,true);c.rigid.setLinvel({x:0,y:0,z:0},true);w.physics.step();return c;}
function look(w:CoreWorld,target:Vector3){const d=target.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}

test('new chamber starts grounded, cube rests in raised alcove and ordinary forward movement cannot cross the divider',()=>{
 const w=new CoreWorld(1);try{tick(w,1);assert.ok(w.player.grounded);assert.equal(w.campaignResult,undefined);assert.equal(w.pads[0].pressed,false);const cube=w.crates[0];assert.ok(Math.abs(cube.pos.y-cube.half.y-2.8)<.035);tick(w,3,{forward:1,strafe:0,jump:false});assert.ok(w.player.pos.z>.2,'Player walks through full-height glass');assert.equal(w.player.crossings,0);}finally{w.dispose();}
});

test('aimed portal placement preserves a valid offset and rejects shots whose full aperture does not fit',()=>{
 const w=new CoreWorld(1);try{const p=new Vector3(-7.985,1.8,5.5);assert.equal(w.place(0,'near-wall',p),true);assert.ok(Math.abs(w.portals[0]!.center.z-5.5)<.001,'Shot silently snapped to panel centre');assert.equal(w.place(0,'near-wall',new Vector3(-7.985,1.8,2.5)),true,'Large white wall unexpectedly limited to a labelled centre panel');assert.equal(w.place(1,'near-wall',new Vector3(-7.985,1.8,9.5)),false);assert.equal(w.place(1,'near-wall',new Vector3(-7.985,1.8,4)),false,'Portal aperture overlaps a real dark structural rib');assert.equal(w.place(1,'opaque',p),false);}finally{w.dispose();}
});

test('actual Rapier movement traverses both directions with conserved crossing speed and no repeat bounce',()=>{
 const w=new CoreWorld(1);try{assert.ok(w.place(0,'near-wall',new Vector3(-7.985,1.55,6)));assert.ok(w.place(1,'far-wall',new Vector3(3,4.35,-11.985)));playerAt(w,-7.1,.87,6);w.yaw=Math.PI/2;tick(w,.6,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,1);const event=w.events.find(e=>e.type==='enter')!;assert.ok(event);assert.ok(Math.abs(Number(event.speed)-Number(event.exitSpeed))<1e-6);assert.ok(w.player.pos.z< -8);tick(w,.4);assert.equal(w.player.crossings,1);w.yaw=0;tick(w,1,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,2);assert.ok(w.player.pos.x> -8);}finally{w.dispose();}
});

test('a portal leaves the adjacent part of its host wall solid to character movement',()=>{
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));playerAt(w,-7,.87,7);w.yaw=Math.PI/2;tick(w,1,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,0);assert.ok(w.player.pos.x>=-7.75,'Host wall disabled outside aperture');}finally{w.dispose();}
});

test('the button responds to standing on it, releases after stepping away, and physically drives the door',()=>{
 const w=new CoreWorld(1);try{playerAt(w,2,1.02,6);tick(w,1);assert.equal(w.pads[0].pressed,true);assert.ok(w.machines.devices[0].progress>.85);playerAt(w,4,.87,6);tick(w,1);assert.equal(w.pads[0].pressed,false);assert.ok(w.machines.devices[0].progress<.1);}finally{w.dispose();}
});

test('a cube hovering above the button does not count as physical pressure',()=>{
 const w=new CoreWorld(1);try{const pad=w.pads[0],cube=cubeAt(w,pad.pos.x,pad.pos.y+.55+.18,pad.pos.z);cube.rigid.setGravityScale(0,true);cube.rigid.setLinvel({x:0,y:0,z:0},true);cube.vel.set(0,0,0);tick(w,.25);assert.ok(cube.pos.y-cube.half.y>pad.pos.y+.15);assert.equal(pad.pressed,false,'Hovering cube opened the door without touching the button');}finally{w.dispose();}
});

test('cube pressure opens the door and removing it does not let a closing door embed the player',()=>{
 const w=new CoreWorld(1);try{cubeAt(w,2,.72,6);tick(w,1);assert.equal(w.pads[0].pressed,true);assert.ok(w.machines.devices[0].progress>.85);playerAt(w,-8.12,.88,11);cubeAt(w,4,.55,6);tick(w,1);const d=w.machines.devices[0],size=d.spec.size,player=w.player;const overlaps=Math.abs(player.pos.x-d.position.x)<player.half.x+size[0]/2&&Math.abs(player.pos.z-d.position.z)<player.half.z+size[2]/2&&Math.abs(player.pos.y-d.position.y)<player.half.y+size[1]/2;assert.equal(overlaps,false,'Physical door closes through a stationary character');}finally{w.dispose();}
});

test('an opaque divider prevents grabbing the cube even within nominal reach',()=>{
 const w=new CoreWorld(1);try{playerAt(w,0,.87,.9);const cube=cubeAt(w,0,.55,-.9);look(w,cube.pos);w.grabDrop();assert.equal(w.heldId,undefined);}finally{w.dispose();}
});

test('a low-speed entry at the well bottom cannot reach the elevated gallery by a hidden launch boost',()=>{
 const w=new CoreWorld(2);try{w.place(0,'drop-floor',new Vector3(0,-2.975,6));w.place(1,'high-wall',new Vector3(0,6,-11.985));playerAt(w,0,-2.13,6);tick(w,1.4);const event=w.events.find(e=>e.type==='enter');assert.ok(event,'Low-speed floor entry did not occur');assert.ok(Number(event.speed)<6,'Low-speed test was silently boosted');assert.equal(w.campaignResult,undefined);assert.ok(!(w.player.grounded&&w.player.pos.y>3.9),'Slow portal entry reaches the raised gallery');}finally{w.dispose();}
});

for(const continueForward of [false,true])test(`ordinary walk into the drop well produces a real momentum fling and safe gallery landing; forward held=${continueForward}`,()=>{
 const w=new CoreWorld(2);try{w.place(0,'drop-floor',new Vector3(0,-2.975,6));w.place(1,'high-wall',new Vector3(0,6,-11.985));tick(w,.2);for(let i=0;i<600&&w.player.crossings===0;i++)w.step(1/120,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,1,'Walking into well failed to enter the floor portal');const event=w.events.find(e=>e.type==='enter')!;assert.ok(Number(event.speed)>9,'Real fall failed to provide sufficient entry speed');assert.ok(Math.abs(Number(event.speed)-Number(event.exitSpeed))<1e-6,'Portal changes momentum magnitude');let landed=false;for(let i=0;i<180;i++){w.step(1/120,continueForward?{forward:1,strafe:0,jump:false}:idle);if(w.player.grounded&&w.player.pos.y>4&&w.player.pos.z>-7.5&&w.player.pos.z<-.5){landed=true;break;}}assert.ok(landed,`Actual fling misses safe gallery: ${w.player.pos.toArray()}, ${w.player.vel.toArray()}`);}finally{w.dispose();}
});

test('ordinary jump from the nearest approach cannot reach the high gallery',()=>{
 const w=new CoreWorld(2);try{playerAt(w,0,.87,2.4);tick(w,.1);let highest=-Infinity;for(let i=0;i<240;i++){w.step(1/120,{forward:1,strafe:0,jump:true});highest=Math.max(highest,w.player.pos.y-w.player.half.y);}assert.ok(highest<3.3,'Jump alone clears gallery height');assert.equal(w.campaignResult,undefined);assert.equal(w.player.crossings,0);}finally{w.dispose();}
});

test('falling into the inaccessible lower catch area promptly restores the safe approach',()=>{
 const w=new CoreWorld(2);try{playerAt(w,0,.87,.5);tick(w,2);assert.ok(w.respawns>0,'Player remains stranded under the gallery on catch floor');assert.ok(w.player.pos.y>0,'Fall retry did not restore safe spawn');}finally{w.dispose();}
});

test('held cube crosses independently while player stays in front, and can be pulled back through the same pair',()=>{
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));playerAt(w,3,3.68,-6.4);tick(w,.1);look(w,w.crates[0].pos);w.grabDrop();assert.equal(w.heldId,'weighted-cube');look(w,new Vector3(3,4.35,-11.985));let partial=false;for(let i=0;i<360;i++){w.step(1/120,{forward:1,strafe:0,jump:false});if(w.crates[0].crossings>0&&w.player.crossings===0){partial=true;break;}}assert.ok(partial,'Cube never independently reaches connected space before the player');const cube=w.crates[0];assert.ok(cube.pos.x< -6,'Crossed cube is not at the other portal');for(let i=0;i<100&&cube.crossings<2;i++)w.step(1/120,{forward:-1,strafe:0,jump:false});assert.equal(cube.crossings,2,'Pulling back leaves held cube stranded in connected space');assert.equal(w.player.crossings,0,'Pullback unexpectedly teleports player');assert.ok(cube.pos.z< -7&&cube.pos.x>0);assert.ok(cube.pos.toArray().every(Number.isFinite));}finally{w.dispose();}
});


test('loose rigid cube traverses with transformed orientation and angular velocity, without a bounce',()=>{
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));const c=cubeAt(w,-7.1,1.55,6);c.rigid.setLinvel({x:-4,y:0,z:0},true);c.rigid.setAngvel({x:0,y:1.2,z:.4},true);c.rigid.setRotation(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),.35),true);let oldRotation=c.rotation.clone(),oldAngular=c.angularVelocity.clone();for(let i=0;i<180&&c.crossings===0;i++){oldRotation=c.rotation.clone();oldAngular=c.angularVelocity.clone();w.step(1/120,idle);}assert.equal(c.crossings,1,'Loose cube never crossed');const transform=new Quaternion().setFromRotationMatrix(portalMatrix(w.portals[0]!,w.portals[1]!));assert.ok(c.rotation.angleTo(oldRotation.premultiply(transform))<.06,'Rigid orientation was not mapped to destination');assert.ok(c.angularVelocity.angleTo(oldAngular.applyQuaternion(transform))<.04,'Angular direction was not mapped to destination');const event=w.events.find(e=>e.type==='enter'&&e.body===c.id)!;assert.ok(Math.abs(Number(event.speed)-Number(event.exitSpeed))<1e-5);tick(w,.3);assert.equal(c.crossings,1,'Cube immediately bounced back');assert.ok(c.pos.z< -8);}finally{w.dispose();}
});

test('a portal leaves the adjacent host wall solid to a dynamic cube',()=>{
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));const c=cubeAt(w,-7,.56,9);c.rigid.setLinvel({x:-4,y:0,z:0},true);tick(w,1);assert.equal(c.crossings,0);assert.ok(c.pos.x>=-7.52,'Loose cube passes through adjacent host wall');}finally{w.dispose();}
});


function blockedPair(w:CoreWorld){w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));return w.physics.createCollider(RAPIER.ColliderDesc.cuboid(.8,1,.5).setTranslation(3,4.2,-11.35));}

test('blocked loose-cube exit rolls back the actual rigid body and recovers after obstruction removal',()=>{
 const w=new CoreWorld(1);try{const block=blockedPair(w),c=cubeAt(w,-7.1,1.55,6);c.rigid.setLinvel({x:-4,y:0,z:0},true);tick(w,1);assert.equal(c.crossings,0);assert.ok(c.pos.x>-7.98,'Cube escaped behind entry host wall');assert.ok(c.pos.distanceTo(new Vector3().copy(c.rigid.translation()))<.025,'Proxy rolled back but rigid body escaped');assert.ok(w.events.some(e=>e.type==='blocked'));w.physics.removeCollider(block,true);c.rigid.setLinvel({x:-4,y:3,z:0},true);tick(w,1);assert.equal(c.crossings,1,'Physically clear upward throw retains stale cube failure or bounces back');assert.ok(c.pos.z< -8);}finally{w.dispose();}
});

test('blocked character exit rolls back Rapier and recovers without replacing portals',()=>{
 const w=new CoreWorld(1);try{const block=blockedPair(w);playerAt(w,-7.1,.87,6);w.yaw=Math.PI/2;tick(w,1,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,0);assert.ok(w.player.pos.x>-7.98,'Character escaped behind entry host');assert.ok(w.player.pos.distanceTo(new Vector3().copy(w.character.translation()))<.025,'Character/proxy rollback diverges');w.physics.removeCollider(block,true);tick(w,1,{forward:1,strafe:0,jump:false});assert.equal(w.player.crossings,1,'Cleared exit retains stale character failure');}finally{w.dispose();}
});

test('blocked held-cube exit preserves both physical bodies and recovers as a connected carry',()=>{
 const w=new CoreWorld(1);try{const block=blockedPair(w);playerAt(w,-4,.87,6);const c=cubeAt(w,-5.7,.8,6);look(w,c.pos);w.grabDrop();assert.equal(w.heldId,c.id);look(w,new Vector3(-8.5,1.55,6));tick(w,1.4,{forward:1,strafe:0,jump:false});assert.equal(c.crossings,0);assert.equal(w.player.crossings,0);assert.ok(c.pos.x>-7.98&&w.player.pos.x>-7.98,'Held/body escaped behind blocked entry');assert.ok(c.pos.distanceTo(new Vector3().copy(c.rigid.translation()))<.025,'Held proxy and rigid diverge');w.physics.removeCollider(block,true);tick(w,1.4,{forward:1,strafe:0,jump:false});assert.ok(c.crossings>=1&&w.player.crossings>=1,'Removed blockage leaves connected carry unwinnable');assert.equal(w.heldId,c.id);}finally{w.dispose();}
});


test('exit floor clearance uses the cube actual rotated support, not its unrotated half-height',()=>{
 const w=new CoreWorld(1);try{w.place(0,'near-wall',new Vector3(-7.985,1.55,6));w.place(1,'far-wall',new Vector3(3,4.35,-11.985));const floor=makeSolid('raised-exit-clearance',3,3.25,-11.3,2,.4,1.2,'floor');w.solids.push(floor);const collider=w.physics.createCollider(RAPIER.ColliderDesc.cuboid(1,.2,.6).setTranslation(3,3.25,-11.3));w.fixed.set(collider.handle,floor);const c=cubeAt(w,-7.1,1.35,6);c.rigid.setGravityScale(0,true);c.rigid.setRotation(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),Math.PI/4),true);c.rigid.setAngvel({x:0,y:0,z:0},true);c.rigid.setLinvel({x:-4,y:0,z:0},true);tick(w,.4);assert.equal(c.crossings,0,'Tilted cube telefrags into higher destination floor');assert.ok(w.events.some(e=>e.type==='blocked'));assert.ok(c.pos.x>-7.98,'Rejected tilted cube escaped entry host');}finally{w.dispose();}
});

test('the highest valid wall exit still cannot turn an idle low-speed floor entry into a gallery bypass',()=>{
 const w=new CoreWorld(2);try{const high=w.surfaces.find(s=>s.id==='high-wall')!,top=high.center.y+high.height/2-1.55;assert.ok(w.place(0,'drop-floor',new Vector3(0,-2.975,6)));assert.ok(w.place(1,'high-wall',new Vector3(0,top,-11.985)));playerAt(w,0,-2.13,6);tick(w,2);assert.equal(w.campaignResult,undefined);assert.ok(!(w.player.grounded&&w.player.pos.y>3.9&&w.player.pos.z>-7.5),'Highest band permits an unearned low-speed gallery landing');}finally{w.dispose();}
});

for(const rate of [30,60,120])test(`fling remains a real conserved crossing and reachable landing at ${rate} physics steps per second`,()=>{
 const w=new CoreWorld(2);try{
  w.place(0,'drop-floor',new Vector3(0,-2.975,6));w.place(1,'high-wall',new Vector3(0,6,-11.985));
  let landed=false;
  for(let i=0;i<rate*6;i++){
   w.step(1/rate,{forward:1,strafe:0,jump:false});
   if(w.player.crossings>0&&w.player.grounded&&w.player.pos.y>4&&w.player.pos.z>-7.5&&w.player.pos.z<-.5){landed=true;break;}
  }
  const event=w.events.find(e=>e.type==='enter'&&e.body==='player');
  assert.ok(event,`No actual portal crossing at ${rate}Hz`);
  assert.ok(Number(event.speed)>9,'Fall does not supply the launch energy');
  assert.ok(Math.abs(Number(event.speed)-Number(event.exitSpeed))<1e-6,'Crossing changes speed');
  assert.equal(w.player.crossings,1,'Frame schedule causes bounce/repeated crossing');
  assert.ok(landed,`Momentum landing fails at ${rate}Hz: ${w.player.pos.toArray()}`);
 }finally{w.dispose();}
});
