/** Native Rapier integration regression. Unit fixture setup is not browser play evidence. */
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../src/core/world';
const idle={forward:0,strafe:0,jump:false};
before(async()=>{await initializePhysics();});
function look(w:CoreWorld,target:Vector3){const d=target.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}
function heldSetup(regrab:boolean){
 const w=new CoreWorld(1);w.player.pos.set(3,3.665,-9.8);w.player.vel.set(0,0,0);w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.step();
 look(w,w.crates[0].pos);w.grabDrop();for(let i=0;i<40;i++)w.step(1/120,idle);
 if(regrab){w.grabDrop();for(let i=0;i<120;i++)w.step(1/120,idle);look(w,w.crates[0].pos);w.grabDrop();}
 look(w,new Vector3(10,4.315,-9.8));for(let i=0;i<40;i++)w.step(1/120,idle);
 assert.equal(w.heldId,'weighted-cube');return w;
}
test('native Rapier kinematic velocity follows current displacement/current dt under tiny final substeps',()=>{
 const p=new RAPIER.World({x:0,y:0,z:0});try{const b=p.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());p.createCollider(RAPIER.ColliderDesc.cuboid(.5,.5,.5),b);let x=0,peak=0;for(let i=0;i<60;i++){const dt=i%2?.0001:1/120;p.timestep=dt;x+=4.8*dt;b.setNextKinematicTranslation({x,y:0,z:0});p.step();const v=b.linvel();peak=Math.max(peak,Math.hypot(v.x,v.y,v.z));}assert.ok(peak<4.81,`Native control itself amplifies velocity: ${peak}`);}finally{p.free();}
});
for(const regrab of [false,true])test(`ordinary held walking does not amplify cargo velocity on short remainder steps; regrab=${regrab}`,()=>{
 const w=heldSetup(regrab);try{let peak=0,peakPlayer=0;for(let i=0;i<60;i++){const dt=i%2?.0001:1/120;w.step(dt,{...idle,forward:1});peak=Math.max(peak,w.crates[0].vel.length());peakPlayer=Math.max(peakPlayer,w.player.vel.length());}
 assert.ok(peakPlayer<4.81,`Setup has unexpectedly fast player ${peakPlayer}`);
 assert.equal(w.player.crossings,0);assert.equal(w.crates[0].crossings,0);
 assert.ok(peak<8,`Held cube reaches ${peak.toFixed(3)}m/s while player peaks ${peakPlayer.toFixed(3)}m/s; previous-step carry target is divided by current tiny dt`);
 }finally{w.dispose();}
});
