/** Isolated test setup; never browser gameplay evidence. */
import RAPIER from '@dimforge/rapier3d-compat';
import {Vector3} from 'three';
import {CoreWorld,initializePhysics} from '../../src/core/world';
import {writeFileSync} from 'node:fs';
await initializePhysics();
const idle={forward:0,strafe:0,jump:false},moving={...idle,forward:1};
function look(w:CoreWorld,target:Vector3){const d=target.clone().sub(w.eye());w.yaw=Math.atan2(-d.x,-d.z);w.pitch=Math.asin(d.y/d.length());}
function setup(regrab:boolean){const w=new CoreWorld(1);w.player.pos.set(3,3.665,-9.8);w.player.vel.set(0,0,0);w.character.setTranslation(w.player.pos,true);w.character.setNextKinematicTranslation(w.player.pos);w.physics.step();look(w,w.crates[0].pos);w.grabDrop();for(let i=0;i<40;i++)w.step(1/120,idle);if(regrab){w.grabDrop();for(let i=0;i<120;i++)w.step(1/120,idle);look(w,w.crates[0].pos);w.grabDrop();}look(w,new Vector3(10,4.315,-9.8));for(let i=0;i<40;i++)w.step(1/120,idle);return w;}
const output:{scope:string,cases:unknown[],native:unknown}={scope:'Unit fixture pose setup, no public browser completion claim',cases:[],native:null};
for(const regrab of [false,true])for(const schedule of [[1/120],[1/120,.0001],[1/120,.001]]){
 const w=setup(regrab),trace=[];try{for(let i=0;i<60;i++){const dt=schedule[i%schedule.length],before=w.crates[0].pos.clone();w.step(dt,moving);const c=w.crates[0];trace.push({i,dt,player:w.player.pos.toArray(),playerVelocity:w.player.vel.toArray(),cube:c.pos.toArray(),rigidVelocity:c.rigid.linvel(),speed:c.vel.length(),deltaSpeed:c.pos.distanceTo(before)/dt,held:w.heldId});}output.cases.push({regrab,schedule,held:w.heldId,maxSpeed:Math.max(...trace.map(t=>t.speed)),trace});}finally{w.dispose();}
}
const physics=new RAPIER.World({x:0,y:0,z:0});try{const body=physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());physics.createCollider(RAPIER.ColliderDesc.cuboid(.5,.5,.5),body);let x=0;const trace=[];for(let i=0;i<60;i++){const dt=i%2?.0001:1/120;physics.timestep=dt;x+=4.8*dt;body.setNextKinematicTranslation({x,y:0,z:0});physics.step();trace.push({dt,position:body.translation(),velocity:body.linvel()});}output.native={maxSpeed:Math.max(...trace.map(t=>Math.hypot(t.velocity.x,t.velocity.y,t.velocity.z))),trace};}finally{physics.free();}
writeFileSync(new URL('./held-velocity-probe.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({cases:output.cases.map((c:any)=>({regrab:c.regrab,schedule:c.schedule,maxSpeed:c.maxSpeed,held:c.held})),native:(output.native as any).maxSpeed},null,2));
